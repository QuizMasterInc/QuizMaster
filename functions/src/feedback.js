const functions = require('firebase-functions')
const admin = require('firebase-admin')
const filter = require('leo-profanity')
filter.loadDictionary('en')

exports.submitFeedback = functions.https.onCall(async (request) => {
    const { message, rating } = request.data || request;

    if (!message || typeof message !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Message is required');
    }

    if (filter.check(message)) {
        throw new functions.https.HttpsError('invalid-argument', 'Please keep your feedback respectful.');
    }

    const feedbackData = {
        userId: request.auth?.uid || 'anonymous',
        email: request.auth?.token?.email || 'anonymous',
        message,
        rating,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        approved: false
    };

    await admin.firestore().collection('feedback').add(feedbackData);

    return { success: true };
});