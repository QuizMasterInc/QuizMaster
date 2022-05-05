"use strict";
// The MIT License (MIT)
//
// Copyright (c) 2022 Firebase
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHandler = exports.getUpdateMask = exports.validateAuthResponse = exports.parseAuthEventContext = exports.parseAuthUserRecord = exports.parseMultiFactor = exports.parseDate = exports.parseProviderData = exports.parseMetadata = exports.verifyJWT = exports.shouldVerifyJWT = exports.decodeJWT = exports.checkDecodedToken = exports.isAuthorizedCloudFunctionURL = exports.getPublicKeyFromHeader = exports.isValidRequest = exports.setKeyExpirationTime = exports.invalidPublicKeys = exports.userRecordConstructor = exports.UserRecordMetadata = exports.JWT_ISSUER = exports.JWT_ALG = exports.JWT_CLIENT_CERT_PATH = exports.JWT_CLIENT_CERT_URL = exports.INVALID_TOKEN_BUFFER = exports.HttpsError = void 0;
const jwt = require("jsonwebtoken");
const node_fetch_1 = require("node-fetch");
const https_1 = require("./https");
Object.defineProperty(exports, "HttpsError", { enumerable: true, get: function () { return https_1.HttpsError; } });
const function_configuration_1 = require("../../function-configuration");
const __1 = require("../..");
/** @internal */
exports.INVALID_TOKEN_BUFFER = 60000; // set to 1 minute
/** @internal */
exports.JWT_CLIENT_CERT_URL = 'https://www.googleapis.com';
/** @internal */
exports.JWT_CLIENT_CERT_PATH = 'robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
/** @internal */
exports.JWT_ALG = 'RS256';
/** @internal */
exports.JWT_ISSUER = 'https://securetoken.google.com/';
const DISALLOWED_CUSTOM_CLAIMS = [
    'acr',
    'amr',
    'at_hash',
    'aud',
    'auth_time',
    'azp',
    'cnf',
    'c_hash',
    'exp',
    'iat',
    'iss',
    'jti',
    'nbf',
    'nonce',
    'firebase',
];
const CLAIMS_MAX_PAYLOAD_SIZE = 1000;
const EVENT_MAPPING = {
    beforeCreate: 'providers/cloud.auth/eventTypes/user.beforeCreate',
    beforeSignIn: 'providers/cloud.auth/eventTypes/user.beforeSignIn',
};
/**
 * Helper class to create the user metadata in a UserRecord object
 */
class UserRecordMetadata {
    constructor(creationTime, lastSignInTime) {
        this.creationTime = creationTime;
        this.lastSignInTime = lastSignInTime;
    }
    /** Returns a plain JavaScript object with the properties of UserRecordMetadata. */
    toJSON() {
        return {
            creationTime: this.creationTime,
            lastSignInTime: this.lastSignInTime,
        };
    }
}
exports.UserRecordMetadata = UserRecordMetadata;
/**
 * Helper function that creates a UserRecord Class from data sent over the wire.
 * @param wireData data sent over the wire
 * @returns an instance of UserRecord with correct toJSON functions
 */
function userRecordConstructor(wireData) {
    // Falsey values from the wire format proto get lost when converted to JSON, this adds them back.
    const falseyValues = {
        email: null,
        emailVerified: false,
        displayName: null,
        photoURL: null,
        phoneNumber: null,
        disabled: false,
        providerData: [],
        customClaims: {},
        passwordSalt: null,
        passwordHash: null,
        tokensValidAfterTime: null,
    };
    const record = { ...falseyValues, ...wireData };
    const meta = record['metadata'];
    if (meta) {
        record['metadata'] = new UserRecordMetadata(meta.createdAt || meta.creationTime, meta.lastSignedInAt || meta.lastSignInTime);
    }
    else {
        record['metadata'] = new UserRecordMetadata(null, null);
    }
    for (const entry of Object.entries(record.providerData)) {
        entry['toJSON'] = () => {
            return entry;
        };
    }
    record['toJSON'] = () => {
        const { uid, email, emailVerified, displayName, photoURL, phoneNumber, disabled, passwordHash, passwordSalt, tokensValidAfterTime, } = record;
        const json = {
            uid,
            email,
            emailVerified,
            displayName,
            photoURL,
            phoneNumber,
            disabled,
            passwordHash,
            passwordSalt,
            tokensValidAfterTime,
        };
        json['metadata'] = record['metadata'].toJSON();
        json['customClaims'] = JSON.parse(JSON.stringify(record.customClaims));
        json['providerData'] = record.providerData.map((entry) => entry.toJSON());
        return json;
    };
    return record;
}
exports.userRecordConstructor = userRecordConstructor;
/**
 * Helper to determine if we refresh the public keys
 * @internal
 */
function invalidPublicKeys(keys, time = Date.now()) {
    if (!keys.publicKeysExpireAt) {
        return true;
    }
    return time + exports.INVALID_TOKEN_BUFFER >= keys.publicKeysExpireAt;
}
exports.invalidPublicKeys = invalidPublicKeys;
/**
 * Helper to parse the response headers to obtain the expiration time.
 * @internal
 */
function setKeyExpirationTime(response, keysCache, time) {
    if (response.headers.has('cache-control')) {
        const ccHeader = response.headers.get('cache-control');
        const maxAgeEntry = ccHeader
            .split(', ')
            .find((item) => item.includes('max-age'));
        if (maxAgeEntry) {
            const maxAge = +maxAgeEntry.trim().split('=')[1];
            keysCache.publicKeysExpireAt = time + maxAge * 1000;
        }
    }
}
exports.setKeyExpirationTime = setKeyExpirationTime;
/**
 * Fetch the public keys for use in decoding and verifying the jwt sent from identity platform.
 */
async function refreshPublicKeys(keysCache, time = Date.now()) {
    const url = `${exports.JWT_CLIENT_CERT_URL}/${exports.JWT_CLIENT_CERT_PATH}`;
    try {
        const response = await node_fetch_1.default(url);
        setKeyExpirationTime(response, keysCache, time);
        const data = await response.json();
        keysCache.publicKeys = data;
    }
    catch (err) {
        __1.logger.error(`Failed to obtain public keys for JWT verification: ${err.message}`);
        throw new https_1.HttpsError('internal', 'Failed to obtain the public keys for JWT verification.');
    }
}
/**
 * Checks for a valid identity platform web request, otherwise throws an HttpsError
 * @internal
 */
function isValidRequest(req) {
    var _a, _b;
    if (req.method !== 'POST') {
        __1.logger.warn(`Request has invalid method "${req.method}".`);
        return false;
    }
    const contentType = (req.header('Content-Type') || '').toLowerCase();
    if (!contentType.includes('application/json')) {
        __1.logger.warn('Request has invalid header Content-Type.');
        return false;
    }
    if (!((_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.jwt)) {
        __1.logger.warn('Request has an invalid body.');
        return false;
    }
    return true;
}
exports.isValidRequest = isValidRequest;
/** @internal */
function getPublicKeyFromHeader(header, publicKeys) {
    if (header.alg !== exports.JWT_ALG) {
        throw new https_1.HttpsError('invalid-argument', `Provided JWT has incorrect algorithm. Expected ${exports.JWT_ALG} but got ${header.alg}.`);
    }
    if (!header.kid) {
        throw new https_1.HttpsError('invalid-argument', 'JWT header missing "kid" claim.');
    }
    if (!publicKeys.hasOwnProperty(header.kid)) {
        throw new https_1.HttpsError('invalid-argument', 'Provided JWT has "kid" claim which does not correspond to a known public key. Most likely the JWT is expired.');
    }
    return publicKeys[header.kid];
}
exports.getPublicKeyFromHeader = getPublicKeyFromHeader;
/**
 * Checks for a well forms cloud functions url
 * @internal
 */
function isAuthorizedCloudFunctionURL(cloudFunctionUrl, projectId) {
    const re = new RegExp(`^https://(${function_configuration_1.SUPPORTED_REGIONS.join('|')})+-${projectId}\.cloudfunctions\.net/`);
    const res = re.exec(cloudFunctionUrl) || [];
    return res.length > 0;
}
exports.isAuthorizedCloudFunctionURL = isAuthorizedCloudFunctionURL;
/**
 * Checks for errors in a decoded jwt
 * @internal
 */
function checkDecodedToken(decodedJWT, eventType, projectId) {
    if (decodedJWT.event_type !== eventType) {
        throw new https_1.HttpsError('invalid-argument', `Expected "${eventType}" but received "${decodedJWT.event_type}".`);
    }
    if (!isAuthorizedCloudFunctionURL(decodedJWT.aud, projectId)) {
        throw new https_1.HttpsError('invalid-argument', 'Provided JWT has incorrect "aud" (audience) claim.');
    }
    if (decodedJWT.iss !== `${exports.JWT_ISSUER}${projectId}`) {
        throw new https_1.HttpsError('invalid-argument', `Provided JWT has incorrect "iss" (issuer) claim. Expected ` +
            `"${exports.JWT_ISSUER}${projectId}" but got "${decodedJWT.iss}".`);
    }
    if (typeof decodedJWT.sub !== 'string' || decodedJWT.sub.length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'Provided JWT has no "sub" (subject) claim.');
    }
    if (decodedJWT.sub.length > 128) {
        throw new https_1.HttpsError('invalid-argument', 'Provided JWT has "sub" (subject) claim longer than 128 characters.');
    }
    // set uid to sub
    decodedJWT.uid = decodedJWT.sub;
}
exports.checkDecodedToken = checkDecodedToken;
/**
 * Helper function to decode the jwt, internally uses the 'jsonwebtoken' package.
 * @internal
 */
function decodeJWT(token) {
    let decoded;
    try {
        decoded = jwt.decode(token, { complete: true });
    }
    catch (err) {
        __1.logger.error('Decoding the JWT failed', err);
        throw new https_1.HttpsError('internal', 'Failed to decode the JWT.');
    }
    if (!(decoded === null || decoded === void 0 ? void 0 : decoded.payload)) {
        throw new https_1.HttpsError('internal', 'The decoded JWT is not structured correctly.');
    }
    return decoded;
}
exports.decodeJWT = decodeJWT;
/**
 * Helper function to determine if we need to do full verification of the jwt
 * @internal
 */
function shouldVerifyJWT() {
    // TODO(colerogers): add emulator support to skip verification
    return true;
}
exports.shouldVerifyJWT = shouldVerifyJWT;
/**
 * Verifies the jwt using the 'jwt' library and decodes the token with the public keys
 * Throws an error if the event types do not match
 * @internal
 */
function verifyJWT(token, rawDecodedJWT, keysCache, time = Date.now()) {
    if (!rawDecodedJWT.header) {
        throw new https_1.HttpsError('internal', 'Unable to verify JWT payload, the decoded JWT does not have a header property.');
    }
    const header = rawDecodedJWT.header;
    let publicKey;
    try {
        if (invalidPublicKeys(keysCache, time)) {
            refreshPublicKeys(keysCache);
        }
        publicKey = getPublicKeyFromHeader(header, keysCache.publicKeys);
        return jwt.verify(token, publicKey, {
            algorithms: [exports.JWT_ALG],
        });
    }
    catch (err) {
        __1.logger.error('Verifying the JWT failed', err);
    }
    // force refresh keys and retry one more time
    try {
        refreshPublicKeys(keysCache);
        publicKey = getPublicKeyFromHeader(header, keysCache.publicKeys);
        return jwt.verify(token, publicKey, {
            algorithms: [exports.JWT_ALG],
        });
    }
    catch (err) {
        __1.logger.error('Verifying the JWT failed again', err);
        throw new https_1.HttpsError('internal', 'Failed to verify the JWT.');
    }
}
exports.verifyJWT = verifyJWT;
/**
 * Helper function to parse the decoded metadata object into a UserMetaData object
 * @internal
 */
function parseMetadata(metadata) {
    const creationTime = (metadata === null || metadata === void 0 ? void 0 : metadata.creation_time)
        ? new Date(metadata.creation_time * 1000).toUTCString()
        : null;
    const lastSignInTime = (metadata === null || metadata === void 0 ? void 0 : metadata.last_sign_in_time)
        ? new Date(metadata.last_sign_in_time * 1000).toUTCString()
        : null;
    return {
        creationTime,
        lastSignInTime,
    };
}
exports.parseMetadata = parseMetadata;
/**
 * Helper function to parse the decoded user info array into an AuthUserInfo array
 * @internal
 */
function parseProviderData(providerData) {
    const providers = [];
    for (const provider of providerData) {
        providers.push({
            uid: provider.uid,
            displayName: provider.display_name,
            email: provider.email,
            photoURL: provider.photo_url,
            providerId: provider.provider_id,
            phoneNumber: provider.phone_number,
        });
    }
    return providers;
}
exports.parseProviderData = parseProviderData;
/**
 * Helper function to parse the date into a UTC string
 * @internal
 */
function parseDate(tokensValidAfterTime) {
    if (!tokensValidAfterTime) {
        return null;
    }
    tokensValidAfterTime = tokensValidAfterTime * 1000;
    try {
        const date = new Date(tokensValidAfterTime);
        if (!isNaN(date.getTime())) {
            return date.toUTCString();
        }
    }
    catch (_a) { }
    return null;
}
exports.parseDate = parseDate;
/**
 * Helper function to parse the decoded enrolled factors into a valid MultiFactorSettings
 * @internal
 */
function parseMultiFactor(multiFactor) {
    if (!multiFactor) {
        return null;
    }
    const parsedEnrolledFactors = [];
    for (const factor of multiFactor.enrolled_factors || []) {
        if (!factor.uid) {
            throw new https_1.HttpsError('internal', 'INTERNAL ASSERT FAILED: Invalid multi-factor info response');
        }
        const enrollmentTime = factor.enrollment_time
            ? new Date(factor.enrollment_time).toUTCString()
            : null;
        parsedEnrolledFactors.push({
            uid: factor.uid,
            factorId: factor.phone_number
                ? factor.factor_id || 'phone'
                : factor.factor_id,
            displayName: factor.display_name,
            enrollmentTime,
            phoneNumber: factor.phone_number,
        });
    }
    if (parsedEnrolledFactors.length > 0) {
        return {
            enrolledFactors: parsedEnrolledFactors,
        };
    }
    return null;
}
exports.parseMultiFactor = parseMultiFactor;
/**
 * Parses the decoded user record into a valid UserRecord for use in the handler
 * @internal
 */
function parseAuthUserRecord(decodedJWTUserRecord) {
    if (!decodedJWTUserRecord.uid) {
        throw new https_1.HttpsError('internal', 'INTERNAL ASSERT FAILED: Invalid user response');
    }
    const disabled = decodedJWTUserRecord.disabled || false;
    const metadata = parseMetadata(decodedJWTUserRecord.metadata);
    const providerData = parseProviderData(decodedJWTUserRecord.provider_data);
    const tokensValidAfterTime = parseDate(decodedJWTUserRecord.tokens_valid_after_time);
    const multiFactor = parseMultiFactor(decodedJWTUserRecord.multi_factor);
    return {
        uid: decodedJWTUserRecord.uid,
        email: decodedJWTUserRecord.email,
        emailVerified: decodedJWTUserRecord.email_verified,
        displayName: decodedJWTUserRecord.display_name,
        photoURL: decodedJWTUserRecord.photo_url,
        phoneNumber: decodedJWTUserRecord.phone_number,
        disabled,
        metadata,
        providerData,
        passwordHash: decodedJWTUserRecord.password_hash,
        passwordSalt: decodedJWTUserRecord.password_salt,
        customClaims: decodedJWTUserRecord.custom_claims,
        tenantId: decodedJWTUserRecord.tenant_id,
        tokensValidAfterTime,
        multiFactor,
    };
}
exports.parseAuthUserRecord = parseAuthUserRecord;
/** Helper to get the AdditionalUserInfo from the decoded jwt */
function parseAdditionalUserInfo(decodedJWT) {
    let profile, username;
    if (decodedJWT.raw_user_info)
        try {
            profile = JSON.parse(decodedJWT.raw_user_info);
        }
        catch (err) {
            __1.logger.debug(`Parse Error: ${err.message}`);
        }
    if (profile) {
        if (decodedJWT.sign_in_method === 'github.com') {
            username = profile.login;
        }
        if (decodedJWT.sign_in_method === 'twitter.com') {
            username = profile.screen_name;
        }
    }
    return {
        providerId: decodedJWT.sign_in_method === 'emailLink'
            ? 'password'
            : decodedJWT.sign_in_method,
        profile,
        username,
        isNewUser: decodedJWT.event_type === 'beforeCreate' ? true : false,
    };
}
/** Helper to get the Credential from the decoded jwt */
function parseAuthCredential(decodedJWT, time) {
    if (!decodedJWT.sign_in_attributes &&
        !decodedJWT.oauth_id_token &&
        !decodedJWT.oauth_access_token &&
        !decodedJWT.oauth_refresh_token) {
        return null;
    }
    return {
        claims: decodedJWT.sign_in_attributes,
        idToken: decodedJWT.oauth_id_token,
        accessToken: decodedJWT.oauth_access_token,
        refreshToken: decodedJWT.oauth_refresh_token,
        expirationTime: decodedJWT.oauth_expires_in
            ? new Date(time + decodedJWT.oauth_expires_in * 1000).toUTCString()
            : undefined,
        secret: decodedJWT.oauth_token_secret,
        providerId: decodedJWT.sign_in_method === 'emailLink'
            ? 'password'
            : decodedJWT.sign_in_method,
        signInMethod: decodedJWT.sign_in_method,
    };
}
/**
 * Parses the decoded jwt into a valid AuthEventContext for use in the handler
 * @internal
 */
function parseAuthEventContext(decodedJWT, projectId, time = new Date().getTime()) {
    const eventType = (EVENT_MAPPING[decodedJWT.event_type] || decodedJWT.event_type) +
        (decodedJWT.sign_in_method ? `:${decodedJWT.sign_in_method}` : '');
    return {
        locale: decodedJWT.locale,
        ipAddress: decodedJWT.ip_address,
        userAgent: decodedJWT.user_agent,
        eventId: decodedJWT.event_id,
        eventType,
        authType: !!decodedJWT.user_record ? 'USER' : 'UNAUTHENTICATED',
        resource: {
            // TODO(colerogers): figure out the correct service
            service: 'identitytoolkit.googleapis.com',
            name: !!decodedJWT.tenant_id
                ? `projects/${projectId}/tenants/${decodedJWT.tenant_id}`
                : `projects/${projectId}`,
        },
        timestamp: new Date(decodedJWT.iat * 1000).toUTCString(),
        additionalUserInfo: parseAdditionalUserInfo(decodedJWT),
        credential: parseAuthCredential(decodedJWT, time),
        params: {},
    };
}
exports.parseAuthEventContext = parseAuthEventContext;
/**
 * Checks the handler response for invalid customClaims & sessionClaims objects
 * @internal
 */
function validateAuthResponse(eventType, authRequest) {
    if (!authRequest) {
        authRequest = {};
    }
    if (authRequest.customClaims) {
        const invalidClaims = DISALLOWED_CUSTOM_CLAIMS.filter((claim) => authRequest.customClaims.hasOwnProperty(claim));
        if (invalidClaims.length > 0) {
            throw new https_1.HttpsError('invalid-argument', `The customClaims claims "${invalidClaims.join(',')}" are reserved and cannot be specified.`);
        }
        if (JSON.stringify(authRequest.customClaims).length > CLAIMS_MAX_PAYLOAD_SIZE) {
            throw new https_1.HttpsError('invalid-argument', `The customClaims payload should not exceed ${CLAIMS_MAX_PAYLOAD_SIZE} characters.`);
        }
    }
    if (eventType === 'beforeSignIn' &&
        authRequest.sessionClaims) {
        const invalidClaims = DISALLOWED_CUSTOM_CLAIMS.filter((claim) => authRequest.sessionClaims.hasOwnProperty(claim));
        if (invalidClaims.length > 0) {
            throw new https_1.HttpsError('invalid-argument', `The sessionClaims claims "${invalidClaims.join(',')}" are reserved and cannot be specified.`);
        }
        if (JSON.stringify(authRequest.sessionClaims)
            .length > CLAIMS_MAX_PAYLOAD_SIZE) {
            throw new https_1.HttpsError('invalid-argument', `The sessionClaims payload should not exceed ${CLAIMS_MAX_PAYLOAD_SIZE} characters.`);
        }
        const combinedClaims = {
            ...authRequest.customClaims,
            ...authRequest.sessionClaims,
        };
        if (JSON.stringify(combinedClaims).length > CLAIMS_MAX_PAYLOAD_SIZE) {
            throw new https_1.HttpsError('invalid-argument', `The customClaims and sessionClaims payloads should not exceed ${CLAIMS_MAX_PAYLOAD_SIZE} characters combined.`);
        }
    }
}
exports.validateAuthResponse = validateAuthResponse;
/**
 * Helper function to generate the update mask for the identity platform changed values
 * @internal
 */
function getUpdateMask(authResponse) {
    if (!authResponse) {
        return '';
    }
    const updateMask = [];
    for (const key in authResponse) {
        if (key === 'customClaims' || key === 'sessionClaims') {
            continue;
        }
        if (authResponse.hasOwnProperty(key) &&
            typeof authResponse[key] !== 'undefined') {
            updateMask.push(key);
        }
    }
    return updateMask.join(',');
}
exports.getUpdateMask = getUpdateMask;
/** @internal */
function createHandler(handler, eventType, keysCache) {
    const wrappedHandler = wrapHandler(handler, eventType, keysCache);
    return (req, res) => {
        return new Promise((resolve) => {
            res.on('finish', resolve);
            resolve(wrappedHandler(req, res));
        });
    };
}
exports.createHandler = createHandler;
function wrapHandler(handler, eventType, keysCache) {
    return async (req, res) => {
        try {
            const projectId = process.env.GCLOUD_PROJECT;
            if (!isValidRequest(req)) {
                __1.logger.error('Invalid request, unable to process');
                throw new https_1.HttpsError('invalid-argument', 'Bad Request');
            }
            const rawDecodedJWT = decodeJWT(req.body.data.jwt);
            const decodedPayload = shouldVerifyJWT()
                ? verifyJWT(req.body.data.jwt, rawDecodedJWT, keysCache)
                : rawDecodedJWT.payload;
            checkDecodedToken(decodedPayload, eventType, projectId);
            const authUserRecord = parseAuthUserRecord(decodedPayload.user_record);
            const authEventContext = parseAuthEventContext(decodedPayload, projectId);
            const authResponse = (await handler(authUserRecord, authEventContext)) || undefined;
            validateAuthResponse(eventType, authResponse);
            const updateMask = getUpdateMask(authResponse);
            const result = {
                userRecord: {
                    ...authResponse,
                    updateMask,
                },
            };
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(result));
        }
        catch (err) {
            if (!(err instanceof https_1.HttpsError)) {
                // This doesn't count as an 'explicit' error.
                __1.logger.error('Unhandled error', err);
                err = new https_1.HttpsError('internal', 'An unexpected error occurred.');
            }
            res.status(err.code);
            res.setHeader('Content-Type', 'application/json');
            res.send({ error: err.toJson() });
        }
    };
}
