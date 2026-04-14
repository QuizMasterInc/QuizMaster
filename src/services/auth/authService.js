/**
 * Authentication service - handles all user authentication operations
 */
import {
    createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updatePassword, updateProfile, onAuthStateChanged,
    EmailAuthProvider, reauthenticateWithCredential, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, OAuthProvider, updateEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, handleFirebaseError, withRetry, timestamp } from '../firebase/firebaseService';
import { validateNoProfanity } from '../../utils/profanityFilter';

class AuthService {
    constructor() {
        this.currentUser = null;
        this.authStateListeners = [];
    }

    /**
     * Initialize auth state listener
     */
    init() {
        return onAuthStateChanged(auth, (user) => {
            this.currentUser = user;
            this.authStateListeners.forEach(callback => callback(user));
        });
    }

    /**
     * Subscribe to authentication state changes
     * @param {Function} callback - Callback function to execute on auth state change
     * @returns {Function} Unsubscribe function
     */
    onAuthStateChange(callback) {
        this.authStateListeners.push(callback);

    
        // Return unsubscribe function
        return () => {
            this.authStateListeners = this.authStateListeners.filter(cb => cb !== callback);
        };
    }

    /**
     * Extract and clean name data from various sources
     */
    extractNameData(authUser, additionalData = {}) {
        let firstName = '';
        let lastName = '';
        let displayName = '';

        // 1. Check if names provided directly
        if (additionalData.firstName && additionalData.lastName) {
            firstName = additionalData.firstName.trim();
            lastName = additionalData.lastName.trim();
            displayName = `${firstName} ${lastName}`;
        }
        // 2. Extract from displayName
        else if (authUser.displayName || additionalData.displayName) {
            displayName = (additionalData.displayName || authUser.displayName).trim();
            const nameParts = displayName.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
        }
        // 3. Extract from email as last resort
        else if (authUser.email) {
            const emailName = authUser.email.split('@')[0];
            displayName = emailName
                .replace(/[._-]/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');

            const nameParts = displayName.split(' ');
            firstName = nameParts[0] || 'User';
            lastName = nameParts.slice(1).join(' ') || '';
        }
        // 4. Ultimate fallback
        else {
            firstName = 'Anonymous';
            lastName = 'User';
            displayName = 'Anonymous User';
        }

        return {
            firstName: firstName || 'User',
            lastName: lastName || '',
            displayName: displayName || `${firstName} ${lastName}`.trim()
        };
    }

    /**
     * Create user document with complete schema based on DATABASE_SCHEMA.md
     */
    createCompleteUserDocument(authUser, additionalData = {}) {
        const { firstName, lastName, displayName } = this.extractNameData(authUser, additionalData);

        // Determine auth provider
        let authProvider = 'email';
        if (authUser.providerData?.length > 0) {
            const provider = authUser.providerData[0].providerId;
            authProvider = provider === 'google.com' ? 'google' : 
                          provider === 'github.com' ? 'github' :
                          provider === 'microsoft.com' ? 'microsoft' : 'email';
        }

        // Create complete user document following your schema
        return {
            // Document ID matches Firebase Auth UID
            uid: authUser.uid,

            // Authentication & Identity
            email: authUser.email || '',
            emailVerified: authUser.emailVerified || false,
            authProvider: authProvider,

            // Profile Information
            profile: {
                firstName: firstName,
                lastName: lastName,
                displayName: displayName
            },

            // Authorization & Roles
            role: additionalData.role || 'user',
            permissions: {
                canCreateQuizzes: true,
                canCreatePublicQuizzes: true,
                canModerateContent: additionalData.role === 'developer' || additionalData.role === 'instructor',
                maxQuizzesAllowed: 50,
            },

            // Account Status
            status: {
                isActive: true
            },

            // Analytics & Tracking
            stats: {
                // QuizMaster (default) quiz performance tracking
                quizmasterQuizzesTaken: 0,
                quizmasterAverageScore: 0,

                // Custom quiz activity tracking
                customQuizActivity: {
                    totalTaken: 0,
                    totalScore: 0,
                    averageScore: 0,
                    lastTakenAt: null
                },

                flashcardDecksCreated: 0,

                // Pre-calculated category statistics for instant dashboard loading
                categoryStats: {
                    geography: { bestScore: 0, avgScore: 0, attempts: 0, totalScore: 0 },
                    science: { bestScore: 0, avgScore: 0, attempts: 0, totalScore: 0 },
                    sports: { bestScore: 0, avgScore: 0, attempts: 0, totalScore: 0 },
                    mathematics: { bestScore: 0, avgScore: 0, attempts: 0, totalScore: 0 },
                    history: { bestScore: 0, avgScore: 0, attempts: 0, totalScore: 0 },
                    entertainment: { bestScore: 0, avgScore: 0, attempts: 0, totalScore: 0 }
                }
            },

            // Preferences
            preferences: {
                theme: additionalData.theme || 'light',
            },

            // Timestamps
            timestamps: {
                createdAt: timestamp.now(),
                updatedAt: timestamp.now(),
                lastLoginAt: timestamp.now(),
                lastActiveAt: timestamp.now(),
            },

            // Recent Activity (empty initially)
            recentActivity: {
                quizIds: [],
                flashcardIds: []
            }
        };
    }

    validateProfileText(updates = {}) {
        return validateNoProfanity([
            {
                label: 'First name',
                value: updates.firstName,
                message: 'First name cannot include profanity.'
            },
            {
                label: 'Last name',
                value: updates.lastName,
                message: 'Last name cannot include profanity.'
            },
            {
                label: 'Display name',
                value: updates.displayName,
                message: 'Display name cannot include profanity.'
            }
        ]);
    }

    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} User data
     */
    async register(userData) {
        const { email, password } = userData;

        // Validate input
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        const profanityValidation = this.validateProfileText(userData);
        if (!profanityValidation.valid) {
            throw new Error(profanityValidation.error);
        }

        try {
            // Check if user is already signed in
            if (auth.currentUser) {
                await signOut(auth);
            }

            const userCredential = await withRetry(() =>
                createUserWithEmailAndPassword(auth, email, password)
            );

            const user = userCredential.user;

            // Update Firebase Auth profile
            const displayName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
            if (displayName) {
                await updateProfile(user, { displayName });
            }

            // Create complete user document
            const userDoc = this.createCompleteUserDocument(user, userData);
            await setDoc(doc(db, 'users', user.uid), userDoc);

            return {
                success: true,
                user: user,
                profile: userDoc
            };

        } catch (error) {
            const customError = this.handleAuthError(error);
            throw customError;
        }
    }

    /**
     * Custom error handling with user-friendly messages
     */
    handleAuthError(error) {
        const errorCode = error.code;
        let message = error.message;

        // Custom error messages
        switch (errorCode) {
            case 'auth/email-already-in-use':
                message = 'An account with this email already exists. Please sign in instead.';
                break;
            case 'auth/invalid-email':
                message = 'Please enter a valid email address.';
                break;
            case 'auth/operation-not-allowed':
                message = 'This sign-in method is not enabled. Please enable it in Firebase Console (Authentication → Sign-in method).';
                break;
            case 'auth/weak-password':
                message = 'Password is too weak. Please choose a stronger password (at least 6 characters).';
                break;
            case 'auth/user-disabled':
                message = 'This account has been disabled. Please contact support.';
                break;
            case 'auth/user-not-found':
                message = 'No account found with this email address. Please check your email or sign up.';
                break;
            case 'auth/wrong-password':
                message = 'Incorrect password. Please try again or reset your password.';
                break;
            case 'auth/invalid-credential':
                message = 'Invalid email or password. Please check your credentials and try again.';
                break;
            case 'auth/too-many-requests':
                message = 'Too many failed attempts. Please wait a moment before trying again.';
                break;
            case 'auth/network-request-failed':
                message = 'Network error. Please check your internet connection and try again.';
                break;
            case 'auth/popup-closed-by-user':
                message = 'Sign-in was cancelled. Please try again.';
                break;
            case 'auth/popup-blocked':
                message = 'Popup was blocked by your browser. Please allow popups and try again.';
                break;
            case 'auth/cancelled-popup-request':
                message = 'Sign-in was cancelled. Please try again.';
                break;
            case 'auth/unauthorized-domain':
                message = 'This domain is not authorized. Please add it to Firebase Console (Authentication → Settings → Authorized domains).';
                break;
            case 'auth/account-exists-with-different-credential':
                message = 'An account already exists with this email using a different sign-in method. Please sign in with your original method.';
                break;
            default:
                // Keep original message for unknown errors
                message = error.message || 'An unexpected error occurred. Please try again.';
        }

        return new Error(message);
    }

    /**
     * Sign in user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User data
     */
    async signIn(email, password) {
        try {
            const userCredential = await withRetry(() =>
                signInWithEmailAndPassword(auth, email, password)
            );

            const user = userCredential.user;

            const profile = await this.getUserProfile(user.uid);

            // Update last login time
            await updateDoc(doc(db, 'users', user.uid), {
                'timestamps.lastLoginAt': timestamp.now(),
                'timestamps.updatedAt': timestamp.now()
            });

            return {
                user: user,
                profile: profile
            };

        } catch (error) {
            const customError = this.handleAuthError(error);
            throw customError;
        }
    }

    /**
     * Sign in with Google (creates account automatically if it doesn't exist)
     */
    async signInWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            provider.addScope('email');
            provider.addScope('profile');

            const result = await signInWithPopup(auth, provider);

            if (!result || !result.user) {
                throw new Error('No user returned from Google sign-in');
            }

            const user = result.user;

            // Check if user profile exists
            const userDocRef = doc(db, 'users', user.uid);
            const profileDoc = await getDoc(userDocRef);

            let userProfile;

            if (!profileDoc.exists()) {
                // Profile doesn't exist - create it automatically
                const userDocument = this.createCompleteUserDocument(user, {});
                await setDoc(userDocRef, userDocument);
                userProfile = userDocument;
            } else {
                // Profile exists - update last login
                userProfile = profileDoc.data();
                await updateDoc(userDocRef, {
                    'timestamps.lastLoginAt': timestamp.now(),
                    'timestamps.updatedAt': timestamp.now()
                });
            }

            return {
                user: user,
                profile: userProfile
            };

        } catch (error) {
            console.error('Google sign-in error:', error);
            throw this.handleAuthError(error);
        }
    }

    /**
     * FIXED: Register with Google (creates new account)
     * This creates the profile SYNCHRONOUSLY to prevent race conditions
     */
    async registerWithGoogle(additionalData = {}) {
        try {
            const provider = new GoogleAuthProvider();
            provider.addScope('email');
            provider.addScope('profile');

            // Step 1: Authenticate with Google
            const result = await signInWithPopup(auth, provider);

            if (!result || !result.user) {
                throw new Error('No user returned from Google sign-in');
            }

            const user = result.user;

            // Step 2: Check if profile already exists
            const userDocRef = doc(db, 'users', user.uid);
            const existingDoc = await getDoc(userDocRef);

            if (existingDoc.exists()) {
                // User already registered - this is actually a login
                await user.delete(); // Clean up the duplicate auth
                throw new Error('An account with this Google account already exists. Please sign in instead.');
            }

            // Step 3: Create profile IMMEDIATELY (before any auth state changes propagate)
            // Extract name data properly
            const { firstName, lastName } = this.extractNameData(user.displayName || '', user.email);

            // Merge with additional data
            const userData = {
                firstName: additionalData.firstName || firstName,
                lastName: additionalData.lastName || lastName,
                title: additionalData.title || '',
                theme: additionalData.theme || 'dark'
            };

            // Create the CORRECT nested schema document
            const userDocument = this.createCompleteUserDocument(user, userData);

            // Use setDoc with merge: false to ensure we're creating, not updating
            await setDoc(userDocRef, userDocument);

            // Step 4: Verify the profile was created
            const verifyDoc = await getDoc(userDocRef);
            if (!verifyDoc.exists()) {
                throw new Error('Failed to create user profile');
            }

            // Step 5: Return success
            return {
                user: user,
                profile: verifyDoc.data()
            };

        } catch (error) {
            console.error('Google registration error:', error);

            // Clean up auth if profile creation failed
            if (auth.currentUser) {
                try {
                    await auth.currentUser.delete();
                } catch (cleanupError) {
                    console.error('Failed to clean up auth user:', cleanupError);
                }
            }

            throw this.handleAuthError(error);
        }
    }

    /**
     * Handle Google user profile creation for registration
     * @param {Object} user - Firebase user object
     * @param {Object} additionalData - Additional user data for registration
     */
    async handleGoogleUserProfile(user, additionalData = {}) {
        try {
            // Extract name data from Google profile
            const { firstName, lastName } = this.extractNameData(user.displayName || '', user.email);

            // Merge with any additional data provided during registration
            const userData = {
                firstName: additionalData.firstName || firstName,
                lastName: additionalData.lastName || lastName,
                title: additionalData.title || '',
                theme: additionalData.theme || 'light',
                isGoogleAuth: true
            };

            // Create schema-compliant user document
            const userDocument = this.createCompleteUserDocument(user, userData);

            await setDoc(doc(db, 'users', user.uid), userDocument);

        } catch (error) {
            console.error('Error handling Google user profile:', error);
            throw error;
        }
    }

    /**
     * Sign in with GitHub (creates account automatically if it doesn't exist)
     */
    async signInWithGitHub() {
        try {
            const provider = new GithubAuthProvider();
            provider.addScope('user:email');

            const result = await signInWithPopup(auth, provider);

            if (!result || !result.user) {
                throw new Error('No user returned from GitHub sign-in');
            }

            const user = result.user;

            // Check if user profile exists
            const userDocRef = doc(db, 'users', user.uid);
            const profileDoc = await getDoc(userDocRef);

            let userProfile;

            if (!profileDoc.exists()) {
                // Profile doesn't exist - create it automatically
                const userDocument = this.createCompleteUserDocument(user, {});
                await setDoc(userDocRef, userDocument);
                userProfile = userDocument;
            } else {
                // Profile exists - update last login
                userProfile = profileDoc.data();
                await updateDoc(userDocRef, {
                    'timestamps.lastLoginAt': timestamp.now(),
                    'timestamps.updatedAt': timestamp.now()
                });
            }

            return {
                user: user,
                profile: userProfile
            };

        } catch (error) {
            console.error('GitHub sign-in error:', error);
            throw this.handleAuthError(error);
        }
    }

    /**
     * Register with GitHub (creates new account)
     */
    async registerWithGitHub(additionalData = {}) {
        try {
            const provider = new GithubAuthProvider();
            provider.addScope('user:email');

            // Step 1: Authenticate with GitHub
            const result = await signInWithPopup(auth, provider);

            if (!result || !result.user) {
                throw new Error('No user returned from GitHub sign-in');
            }

            const user = result.user;

            // Step 2: Check if profile already exists
            const userDocRef = doc(db, 'users', user.uid);
            const existingDoc = await getDoc(userDocRef);

            if (existingDoc.exists()) {
                // User already registered - this is actually a login
                await user.delete(); // Clean up the duplicate auth
                throw new Error('An account with this GitHub account already exists. Please sign in instead.');
            }

            // Step 3: Create profile IMMEDIATELY
            const { firstName, lastName } = this.extractNameData(user.displayName || '', user.email);

            // Merge with additional data
            const userData = {
                firstName: additionalData.firstName || firstName,
                lastName: additionalData.lastName || lastName,
                title: additionalData.title || '',
                theme: additionalData.theme || 'dark'
            };

            // Create the CORRECT nested schema document
            const userDocument = this.createCompleteUserDocument(user, userData);

            // Use setDoc with merge: false to ensure we're creating, not updating
            await setDoc(userDocRef, userDocument);

            // Step 4: Verify the profile was created
            const verifyDoc = await getDoc(userDocRef);
            if (!verifyDoc.exists()) {
                throw new Error('Failed to create user profile');
            }

            // Step 5: Return success
            return {
                user: user,
                profile: verifyDoc.data()
            };

        } catch (error) {
            console.error('GitHub registration error:', error);

            // Clean up auth if profile creation failed
            if (auth.currentUser) {
                try {
                    await auth.currentUser.delete();
                } catch (cleanupError) {
                    console.error('Failed to clean up auth user:', cleanupError);
                }
            }

            throw this.handleAuthError(error);
        }
    }



    /**
     * Sign out user
     * @returns {Promise<void>}
     */
    async signOut() {
        try {
            await signOut(auth);
        } catch (error) {
            const customError = this.handleAuthError(error);
            throw customError;
        }
    }

    /**
     * Get user profile from Firestore
     * @param {string} uid - User ID
     * @returns {Promise<Object>} User profile
     */
    async getUserProfile(uid) {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));

            if (!userDoc.exists()) {
                throw new Error('User profile not found');
            }

            const profile = userDoc.data();

            return {
                ...profile,
                createdAt: timestamp.fromFirestore(profile.createdAt),
                updatedAt: timestamp.fromFirestore(profile.updatedAt),
                lastLoginAt: timestamp.fromFirestore(profile.lastLoginAt)
            };

        } catch (error) {
            throw handleFirebaseError(error);
        }
    }

    /**
     * Update user profile
     * @param {string} uid - User ID
     * @param {Object} updates - Profile updates
     * @returns {Promise<Object>} Updated profile
     */
    async updateUserProfile(uid, updates) {
        try {
            const profanityValidation = this.validateProfileText(updates);
            if (!profanityValidation.valid) {
                throw new Error(profanityValidation.error);
            }

            const profileUpdates = {
                profile: {
                    firstName: updates.firstName,
                    lastName: updates.lastName,
                    displayName: updates.firstName && updates.lastName ? 
                        `${updates.firstName} ${updates.lastName}`.trim() : undefined
                },
                email: updates.email,
                'timestamps.updatedAt': timestamp.now()
            };

            // Remove undefined values
            if (profileUpdates.profile.displayName === undefined) {
                delete profileUpdates.profile.displayName;
            }

            await updateDoc(doc(db, 'users', uid), profileUpdates);

            if (updates.firstName || updates.lastName) {
                const displayName = `${updates.firstName || ''} ${updates.lastName || ''}`.trim();
                if (displayName && this.currentUser) {
                    await updateProfile(this.currentUser, { displayName });
                }
            }

            return await this.getUserProfile(uid);

        } catch (error) {
            throw handleFirebaseError(error);
        }
    }

    /**
     * Send password reset email
     * @param {string} email - User email
     * @returns {Promise<void>}
     */
    async sendPasswordResetEmail(email) {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            const customError = this.handleAuthError(error);
            throw customError;
        }
    }

    /**
     * Change user password
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<void>}
     */
    async changePassword(currentPassword, newPassword) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('No user is currently signed in');
            }

            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            await updatePassword(user, newPassword);

            await updateDoc(doc(db, 'users', user.uid), {
                'timestamps.updatedAt': timestamp.now()
            });

        } catch (error) {
            const customError = this.handleAuthError(error);
            throw customError;
        }
    }

    /**
     * Check if user has specific role
     * @param {string} uid - User ID
     * @param {string|Array} roles - Role(s) to check
     * @returns {Promise<boolean>} Whether user has the role
     */
    async hasRole(uid, roles) {
        try {
            const profile = await this.getUserProfile(uid);
            const userRole = profile.role;

            if (Array.isArray(roles)) {
                return roles.includes(userRole);
            }

            return userRole === roles;

        } catch (error) {
            console.error('Error checking user role:', error);
            return false;
        }
    }

    /**
     * Get current user
     * @returns {Object|null} Current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} Whether user is authenticated
     */
    isAuthenticated() {
        return !!this.currentUser;
    }

    /**
     * Update complete user profile with email, password, and display name
     * @param {Object} updates - Profile update data
     * @returns {Promise<Object>} Update results
     */
    async updateCompleteProfile(updates) {
        try {
            const {
                currentPassword,
                newPassword,
                confirmNewPassword,
                newEmail,
                displayName
            } = updates;

            const user = auth.currentUser;
            if (!user) {
                throw new Error('No user is currently signed in');
            }

            // Check if user is Google authenticated
            const isGoogleAuth = user.providerData.some(provider =>
                provider.providerId === 'google.com'
            );

            if (isGoogleAuth) {
                throw new Error('Cannot update Google account credentials');
            }

            // Validate password confirmation
            if (newPassword && newPassword !== confirmNewPassword) {
                throw new Error('New passwords do not match');
            }

            const profanityValidation = this.validateProfileText({ displayName });
            if (!profanityValidation.valid) {
                throw new Error(profanityValidation.error);
            }

            // Re-authenticate user if password changes are needed
            if (newPassword || (newEmail && newEmail !== user.email)) {
                if (!currentPassword) {
                    throw new Error('Current password is required for account changes');
                }

                const credential = EmailAuthProvider.credential(user.email, currentPassword);
                await reauthenticateWithCredential(user, credential);
            }

            const updatePromises = [];
            const updateResults = {
                email: false,
                password: false,
                displayName: false,
                errors: []
            };

            // Update password
            if (newPassword) {
                updatePromises.push(
                    updatePassword(user, newPassword)
                        .then(() => { updateResults.password = true; })
                        .catch(error => {
                            updateResults.errors.push(`Password update failed: ${error.message}`);
                        })
                );
            }

            // Update email
            if (newEmail && newEmail !== user.email) {
                updatePromises.push(
                    updateEmail(user, newEmail)
                        .then(() => { updateResults.email = true; })
                        .catch(error => {
                            updateResults.errors.push(`Email update failed: ${error.message}`);
                        })
                );
            }

            // Update display name
            if (displayName && displayName !== user.displayName) {
                updatePromises.push(
                    updateProfile(user, { displayName })
                        .then(() => { updateResults.displayName = true; })
                        .catch(error => {
                            updateResults.errors.push(`Display name update failed: ${error.message}`);
                        })
                );
            }

            // Execute all updates
            await Promise.allSettled(updatePromises);

            // Update user document in Firestore
            if (updateResults.email || updateResults.displayName) {
                const docUpdates = { 'timestamps.updatedAt': timestamp.now() };
                if (newEmail && updateResults.email) docUpdates.email = newEmail;
                if (displayName && updateResults.displayName) docUpdates['profile.displayName'] = displayName;

                await updateDoc(doc(db, 'users', user.uid), docUpdates);
            }

            return updateResults;

        } catch (error) {
            const customError = this.handleAuthError(error);
            throw customError;
        }
    }

    /**
     * Update only the display name (for Google users)
     * @param {string} newDisplayName - New display name
     * @returns {Promise<void>}
     */
    async updateDisplayName(newDisplayName) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('No user is currently signed in');
            }

            const profanityValidation = this.validateProfileText({ displayName: newDisplayName });
            if (!profanityValidation.valid) {
                throw new Error(profanityValidation.error);
            }

            await updateProfile(user, { displayName: newDisplayName });

            // Update Firestore document too
            await updateDoc(doc(db, 'users', user.uid), {
                'profile.displayName': newDisplayName,
                'timestamps.updatedAt': timestamp.now()
            });

        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

}

// Export singleton instance
export default new AuthService();
