/**
 * Analytics Service - handles analytics, statistics, performance calculations, and exports
 */
import cloudFunctionsAPI from '../api/cloudFunctions';
import { handleFirebaseError } from '../firebase/firebaseService';

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
            return await cloudFunctionsAPI.call('getQuizAnalytics', { quizId });

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
            return await cloudFunctionsAPI.call('getUserPerformanceSummary', { userId });

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
            const data = await cloudFunctionsAPI.call('exportQuizResults', {
                quizId,
                ...options
            });

            return data;

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