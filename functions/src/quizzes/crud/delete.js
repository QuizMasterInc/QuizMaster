const functions = require('firebase-functions')
const {onRequest, onCall} = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const cors = require("cors")({origin: true})

/**
 * Delete a custom quiz
 */
exports.deleteCustomQuiz = onCall(async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const userId = context.auth.uid
    const { quizId } = data

    if (!quizId) {
        throw new functions.https.HttpsError('invalid-argument', 'Quiz ID is required')
    }

    try {
        const quizRef = admin.firestore().collection('custom_quizzes').doc(quizId)

        // Verify the quiz belongs to the user
        const doc = await quizRef.get()
        if (!doc.exists) {
            throw new functions.https.HttpsError('not-found', 'Quiz not found')
        }

        if (doc.data().creator?.uid !== userId) {
            throw new functions.https.HttpsError('permission-denied', 'Access denied')
        }

        await quizRef.delete()

        return { success: true, message: 'Quiz deleted successfully' }
    } catch (error) {
        console.error('[deleteCustomQuiz] Error deleting custom quiz:', error)
        throw new functions.https.HttpsError('internal', 'Error deleting custom quiz')
    }
})