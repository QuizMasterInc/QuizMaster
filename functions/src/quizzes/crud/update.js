const functions = require('firebase-functions')
const {onRequest, onCall} = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const cors = require("cors")({origin: true})

/**
 * Track quiz attempt - increment analytics when someone starts taking a quiz
 * CONVERTED TO CALLABLE FUNCTION to fix CORS issues and maintain architectural consistency
 */
exports.trackQuizAttempt = onCall(async (request) => {
    // Extract data from callable function request
    const { quizId } = request.data;

    if (!quizId) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Quiz ID is required'
        );
    }

    try {
        const quizRef = admin.firestore().collection('custom_quizzes').doc(quizId);
        const quizDoc = await quizRef.get();

        if (!quizDoc.exists) {
            throw new functions.https.HttpsError(
                'not-found',
                'Quiz not found'
            );
        }

        // Update last played time
        await quizRef.update({
            'timestamps.lastAttemptAt': admin.firestore.Timestamp.now(),
            'timestamps.updatedAt': admin.firestore.Timestamp.now()
        });

        return {
            success: true,
            message: "Quiz attempt tracked"
        };

    } catch (error) {
        console.error('Error tracking quiz attempt:', error);

        // Re-throw HttpsError if it's already an HttpsError
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }

        // Otherwise, wrap in internal error
        throw new functions.https.HttpsError(
            'internal',
            'Error tracking quiz attempt'
        );
    }
})

/**
 * Update an existing custom quiz
 */
exports.updateCustomQuiz = onCall(async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const userId = context.auth.uid
    const { quizId, quizData } = data

    if (!quizId || !quizData) {
        throw new functions.https.HttpsError('invalid-argument', 'Quiz ID and quiz data are required')
    }

    try {
        const quizRef = admin.firestore().collection('custom_quizzes').doc(quizId)

        // Verify the quiz belongs to the user
        const doc = await quizRef.get()
        if (!doc.exists) {
            throw new functions.https.HttpsError('not-found', 'Quiz not found')
        }

        const existingData = doc.data()
        if (existingData.creator?.uid !== userId) {
            throw new functions.https.HttpsError('permission-denied', 'Access denied')
        }

        // Prepare update data
        const updateData = {
            ...quizData,
            'timestamps.updatedAt': admin.firestore.Timestamp.now()
        }

        await quizRef.update(updateData)

        return {
            id: quizId,
            ...existingData,
            ...updateData
        }
    } catch (error) {
        console.error('[updateCustomQuiz] Error updating custom quiz:', error)
        throw new functions.https.HttpsError('internal', 'Error updating custom quiz')
    }
})