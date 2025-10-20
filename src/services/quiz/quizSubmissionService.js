/**
 * Quiz Submission Service - handles quiz submission and attempt tracking
 */
import { httpsCallable } from 'firebase/functions';
import { functions, handleFirebaseError, timestamp } from '../firebase/firebaseService';

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
            // Use HTTP request like all other functions
            const response = await fetch('https://us-central1-quizmaster-c66a2.cloudfunctions.net/submitQuizResults', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...attemptData,
                    submittedAt: timestamp.now()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error('submitQuizResults error details:', error);
            throw handleFirebaseError(error);
        }
    }

    /**
     * Submit quiz attempt (legacy method - kept for compatibility)
     * @param {string} quizId - Quiz ID
     * @param {Object} attemptData - Quiz attempt data
     * @returns {Promise<Object>} Attempt result
     */
    async submitQuizAttempt(quizId, attemptData) {
        try {
            // For default quizzes, use the new submitQuizResults method
            if (attemptData.quizType === 'default' || attemptData.category) {
                return await this.submitQuizResults(attemptData);
            }

            // For custom quizzes, use existing custom quiz tracking
            const trackQuizFunction = httpsCallable(functions, 'trackQuizAttempt');

            const result = await trackQuizFunction({
                quizId,
                ...attemptData,
                submittedAt: timestamp.now()
            });

            return result.data;

        } catch (error) {
            throw handleFirebaseError(error);
        }
    }
}

export default new QuizSubmissionService();