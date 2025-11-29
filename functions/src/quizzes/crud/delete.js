/**
 * ============================================================================
 *  QuizMaster Cloud Function: deleteCustomQuiz
 * ============================================================================
 *  PURPOSE:
 *    This server-side function allows a logged-in user to delete a custom quiz
 *    they created. It is a Firebase Callable Function, meaning it is invoked
 *    from the client using `httpsCallable()` and automatically receives
 *    the Firebase Auth context for the currently signed-in user.
 *
 *  WHY THIS FILE EXISTS:
 *    - The frontend needs a secure way to delete quizzes.
 *    - Deletion must only be allowed for the quiz's creator.
 *    - Security rules alone are NOT enough when using Cloud Functions; logic
 *      must also validate ownership here before deleting.
 *    - This function gives the backend full control and prevents unauthorized
 *      users from deleting other people's quizzes.
 *
 *  HOW IT WORKS:
 *    1. The client calls this function using `httpsCallable('deleteCustomQuiz')`
 *       and passes a `{ quizId }`.
 *    2. Firebase automatically attaches `request.auth` with the caller's UID.
 *    3. The function:
 *         - Validates the user is authenticated.
 *         - Validates quizId exists.
 *         - Fetches the Firestore document for that quiz.
 *         - Confirms the quiz's creator UID matches the caller's UID.
 *         - Deletes the quiz from `custom_quizzes`.
 * ============================================================================
 */

const functions = require('firebase-functions')
const { onCall } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')

exports.deleteCustomQuiz = onCall(async (request) => {
const { data, auth } = request

try {
    // Auth check: the caller must be signed in so we know who is attempting the delete.
    if (!auth) {
        throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
        )
    }

    const userId = auth.uid
    const { quizId } = data || {}

    // Input validation: a quizId must be provided by the client.
    if (!quizId) {
        throw new functions.https.HttpsError(
        'invalid-argument',
        'Quiz ID is required'
        )
    }

    const quizRef = admin.firestore().collection('custom_quizzes').doc(quizId)
    const doc = await quizRef.get()

    // If the document does not exist, there is nothing to delete.
    if (!doc.exists) {
        throw new functions.https.HttpsError('not-found', 'Quiz not found')
    }

    const quizData = doc.data()
    const creatorId =
        quizData?.creator?.uid ||
        quizData?.creatorID ||
        quizData?.creator?.userId

    // Permission check: only the original creator may delete this quiz.
    if (!creatorId || creatorId !== userId) {
        throw new functions.https.HttpsError(
        'permission-denied',
        'Access denied'
        )
    }

    await quizRef.delete()

// Return a simple success payload back to the client.
    return { success: true, message: 'Quiz deleted successfully' }
    } catch (error) {
        // Log the error for server-side debugging, then surface a safe message to the client.
        console.error('[deleteCustomQuiz] Error deleting custom quiz:', error)

        if (error instanceof functions.https.HttpsError) {
            // Re-throw known HttpsErrors so the client gets the specific code/message.
            throw error
        }

        throw new functions.https.HttpsError(
            'internal',
            'Error deleting custom quiz'
        )
    }
})