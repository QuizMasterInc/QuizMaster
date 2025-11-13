/**
 * Quiz Submission Service - handles quiz submission and attempt tracking
 */
import { httpsCallable } from 'firebase/functions';
import { functions, handleFirebaseError, timestamp } from '../firebase/firebaseService';
import cloudFunctionsAPI from '../api/cloudFunctions';

class QuizSubmissionService {
    constructor() {
        // No collection needed - uses cloud functions
    }

    /**
     * Submit quiz results for default quizmaster quizzes
     * @param {Object} attemptData - Quiz attempt data
     * @returns {Promise<Object>} Attempt result
     */
    async submitQuizResults(attemptData) {
        try {
            // Use unified CloudFunctionsAPI
            return await cloudFunctionsAPI.call('submitQuizResults', {
                ...attemptData,
                submittedAt: timestamp.now()
            });

        } catch (error) {
            console.error('submitQuizResults error details:', error);
            throw handleFirebaseError(error);
        }
    }
}

export default new QuizSubmissionService();