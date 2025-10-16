/**
 * Result Service - handles basic quiz result retrieval
 */
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { db, handleFirebaseError, withRetry, timestamp } from './firebaseService';

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
     * Cache for all results to avoid multiple API calls
     */
    _allResultsCache = null;
    _cacheTimestamp = null;
    _cacheExpiryMs = 300000; // 5 minutes cache for better performance

    /**
     * Get all quiz results for a user (optimized V2 - single call)
     * @param {string} userId - User ID
     * @returns {Promise<Object>} All quiz results by category
     */
    async getAllResults(userId) {
        try {
            // Check cache first
            const now = Date.now();
            if (this._allResultsCache &&
                this._cacheTimestamp &&
                (now - this._cacheTimestamp) < this._cacheExpiryMs) {
                return this._allResultsCache;
            }

            const data = { uid: userId };

            const response = await fetch(
                'https://graballresultsv2-ukhjsvkoca-uc.a.run.app',
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const allResults = await response.json();

            // Cache the results
            this._allResultsCache = allResults;
            this._cacheTimestamp = now;

            return allResults;

        } catch (error) {
            console.error('Error fetching all results:', error);
            throw new Error('Failed to fetch quiz results. Please try again.');
        }
    }

    /**
     * Get quiz results by category for a user (now uses cached batch call)
     * @param {string} userId - User ID
     * @param {string} category - Quiz category
     * @returns {Promise<Object>} Quiz results for the category
     */
    async getResultsByCategory(userId, category) {
        try {
            // Use the optimized batch call
            const allResults = await this.getAllResults(userId);

            // Find the specific category (case insensitive)
            const categoryKey = Object.keys(allResults).find(
                key => key.toLowerCase() === category.toLowerCase()
            );

            if (categoryKey && allResults[categoryKey]) {
                return {
                    score: allResults[categoryKey].score ?? 0,
                    avgScore: allResults[categoryKey].avgScore ?? 0,
                    attempts: allResults[categoryKey].attempts ?? 0
                };
            }

            // Return empty results if category not found
            return {
                score: 0,
                avgScore: 0,
                attempts: 0
            };

        } catch (error) {
            console.error('Error fetching results by category:', error);
            throw new Error('Failed to fetch quiz results. Please try again.');
        }
    }

    /**
     * Clear results cache (useful after taking a new quiz)
     */
    clearResultsCache() {
        this._allResultsCache = null;
        this._cacheTimestamp = null;
    }
}

export default new ResultService();