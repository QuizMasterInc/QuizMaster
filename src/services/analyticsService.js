/**
 * Analytics Service - handles analytics, statistics, performance calculations, and exports
 */
import { httpsCallable } from 'firebase/functions';
import { functions, handleFirebaseError } from './firebaseService';

class AnalyticsService {
    constructor() {
        // No collection needed - uses cloud functions
    }

    /**
     * Get detailed analytics for a quiz
     * @param {string} quizId - Quiz ID
     * @returns {Promise<Object>} Quiz analytics
     */
    async getQuizAnalytics(quizId) {
        try {
            const analyticsFunction = httpsCallable(functions, 'getQuizAnalytics');
            const result = await analyticsFunction({ quizId });

            return result.data;

        } catch (error) {
            throw handleFirebaseError(error);
        }
    }

    /**
     * Get user performance summary
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User performance data
     */
    async getUserPerformanceSummary(userId) {
        try {
            const summaryFunction = httpsCallable(functions, 'getUserPerformanceSummary');
            const result = await summaryFunction({ userId });

            return result.data;

        } catch (error) {
            throw handleFirebaseError(error);
        }
    }

    /**
     * Export quiz results to CSV format
     * @param {string} quizId - Quiz ID
     * @param {Object} options - Export options
     * @returns {Promise<string>} CSV data
     */
    async exportQuizResults(quizId, options = {}) {
        try {
            const exportFunction = httpsCallable(functions, 'exportQuizResults');
            const result = await exportFunction({
                quizId,
                ...options
            });

            return result.data;

        } catch (error) {
            throw handleFirebaseError(error);
        }
    }

    /**
     * Calculate grade statistics
     * @param {Array} attempts - Array of quiz attempts
     * @returns {Object} Grade statistics
     */
    calculateGradeStatistics(attempts) {
        if (!attempts || attempts.length === 0) {
            return {
                totalAttempts: 0,
                averageScore: 0,
                highestScore: 0,
                lowestScore: 0,
                passingRate: 0,
                gradeDistribution: {}
            };
        }

        const scores = attempts.map(attempt => attempt.score || 0);
        const total = scores.reduce((sum, score) => sum + score, 0);

        // Calculate grade distribution
        const gradeRanges = {
            'A (90-100%)': scores.filter(s => s >= 90).length,
            'B (80-89%)': scores.filter(s => s >= 80 && s < 90).length,
            'C (70-79%)': scores.filter(s => s >= 70 && s < 80).length,
            'D (60-69%)': scores.filter(s => s >= 60 && s < 70).length,
            'F (Below 60%)': scores.filter(s => s < 60).length
        };

        return {
            totalAttempts: attempts.length,
            averageScore: Math.round((total / attempts.length) * 100) / 100,
            highestScore: Math.max(...scores),
            lowestScore: Math.min(...scores),
            passingRate: Math.round((scores.filter(s => s >= 60).length / attempts.length) * 100),
            gradeDistribution: gradeRanges
        };
    }
}

export default new AnalyticsService();