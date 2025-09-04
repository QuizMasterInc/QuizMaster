/**
 * Result service - handles quiz results and analytics
 */
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions, handleFirebaseError, withRetry, timestamp } from './firebaseService';

class ResultService {
    constructor() {
        this.attemptsCollection = 'quizAttempts';
        this.resultsCollection = 'quizResults';
    }

    /**
     * Get quiz attempt by ID
     * @param {string} attemptId - Attempt ID
     * @returns {Promise<Object>} Quiz attempt data
     */
    async getAttemptById(attemptId) {
        try {
            const attemptDoc = await withRetry(() => 
                getDoc(doc(db, this.attemptsCollection, attemptId))
            );

            if (!attemptDoc.exists()) {
                throw new Error('Quiz attempt not found');
            }

            const attempt = attemptDoc.data();
            return {
                id: attemptDoc.id,
                ...attempt,
                submittedAt: timestamp.fromFirestore(attempt.submittedAt),
                startedAt: timestamp.fromFirestore(attempt.startedAt)
            };

        } catch (error) {
            throw handleFirebaseError(error);
        }
    }

    /**
     * Get user's quiz attempts
     * @param {string} userId - User ID
     * @param {Object} options - Query options
     * @returns {Promise<Object>} User attempts with pagination
     */
    async getUserAttempts(userId, options = {}) {
        try {
            const {
                quizId,
                limitCount = 20,
                startAfterDoc = null,
                orderByField = 'submittedAt',
                orderDirection = 'desc'
            } = options;

            let q = collection(db, this.attemptsCollection);
            q = query(q, where('userId', '==', userId));

            if (quizId) {
                q = query(q, where('quizId', '==', quizId));
            }

            q = query(q, orderBy(orderByField, orderDirection));

            // Apply pagination
            if (startAfterDoc) {
                q = query(q, startAfter(startAfterDoc));
            }
            
            q = query(q, limit(limitCount));

            const querySnapshot = await getDocs(q);
            
            const attempts = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                submittedAt: timestamp.fromFirestore(doc.data().submittedAt),
                startedAt: timestamp.fromFirestore(doc.data().startedAt)
            }));

            return {
                attempts,
                hasMore: querySnapshot.docs.length === limitCount,
                lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null
            };

        } catch (error) {
            throw handleFirebaseError(error);
        }
    }

    /**
     * Get quiz attempts for a specific quiz
     * @param {string} quizId - Quiz ID
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Quiz attempts with pagination
     */
    async getQuizAttempts(quizId, options = {}) {
        try {
            const {
                limitCount = 50,
                startAfterDoc = null,
                orderByField = 'submittedAt',
                orderDirection = 'desc'
            } = options;

            let q = collection(db, this.attemptsCollection);
            q = query(q, where('quizId', '==', quizId));
            q = query(q, orderBy(orderByField, orderDirection));

            if (startAfterDoc) {
                q = query(q, startAfter(startAfterDoc));
            }
            
            q = query(q, limit(limitCount));

            const querySnapshot = await getDocs(q);
            
            const attempts = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                submittedAt: timestamp.fromFirestore(doc.data().submittedAt),
                startedAt: timestamp.fromFirestore(doc.data().startedAt)
            }));

            return {
                attempts,
                hasMore: querySnapshot.docs.length === limitCount,
                lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null
            };

        } catch (error) {
            throw handleFirebaseError(error);
        }
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
            passingRate: Math.round((scores.filter(s => s >= 60).length / scores.length) * 100),
            gradeDistribution: gradeRanges
        };
    }
}

export default new ResultService();