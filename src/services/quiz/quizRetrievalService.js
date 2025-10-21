/**
 * Quiz Retrieval Service - handles quiz reading, browsing, and searching
 */
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { db, handleFirebaseError, withRetry, timestamp } from '../firebase/firebaseService';

class QuizRetrievalService {
    constructor() {
        this.collection = 'quizzes';
    }

    /**
     * Get quiz by ID
     * @param {string} quizId - Quiz ID
     * @returns {Promise<Object>} Quiz data
     */
    async getQuizById(quizId) {
        try {
            // Validate quizId
            if (!quizId) {
                throw new Error('Quiz ID is required');
            }

            const quizDoc = await withRetry(() =>
                getDoc(doc(db, this.collection, quizId))
            );

            if (!quizDoc.exists()) {
                const error = new Error('Quiz not found');
                error.code = 'quiz-not-found';
                throw error;
            }

            const quiz = quizDoc.data();
            return {
                id: quizDoc.id,
                ...quiz,
                createdAt: timestamp.fromFirestore(quiz.createdAt),
                updatedAt: timestamp.fromFirestore(quiz.updatedAt)
            };

        } catch (error) {
            // Add more context to the error
            if (error.code === 'quiz-not-found') {
                // Don't log warnings for expected "not found" cases
            } else {
                console.error(`Error fetching quiz ${quizId}:`, error);
            }
            throw handleFirebaseError(error);
        }
    }

    /**
     * Get quizzes with filtering and pagination
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Quizzes data with pagination info
     */
    async getQuizzes(options = {}) {
        try {
            const {
                creatorId,
                isActive = true,
                orderByField = 'createdAt',
                orderDirection = 'desc',
                limitCount = 20,
                startAfterDoc = null
            } = options;

            let q = collection(db, this.collection);

            // Apply filters
            if (creatorId) {
                q = query(q, where('creatorId', '==', creatorId));
            }

            if (isActive !== undefined) {
                q = query(q, where('isActive', '==', isActive));
            }

            // Apply ordering
            q = query(q, orderBy(orderByField, orderDirection));

            // Apply pagination
            if (startAfterDoc) {
                q = query(q, startAfter(startAfterDoc));
            }

            q = query(q, limit(limitCount));

            const querySnapshot = await getDocs(q);

            const quizzes = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: timestamp.fromFirestore(doc.data().createdAt),
                updatedAt: timestamp.fromFirestore(doc.data().updatedAt)
            }));

            return {
                quizzes,
                hasMore: querySnapshot.docs.length === limitCount,
                lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null
            };

        } catch (error) {
            throw handleFirebaseError(error);
        }
    }

    /**
     * Get custom quizzes by user (optimized V2)
     * @param {string} userId - User ID (creator)
     * @returns {Promise<Array>} User's custom quizzes sorted by creation date (newest first)
     */
    async getCustomQuizzesByUser(userId) {
        try {
            // Validate userId
            if (!userId) {
                return [];
            }

            const response = await fetch(
                `https://graballcustomquizzes-ukhjsvkoca-uc.a.run.app`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                // Handle specific HTTP status codes
                if (response.status === 404) {
                    return [];
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Handle response from grabAllCustomQuizzes
            if (!data || !data.result) {
                return [];
            }

            // Filter quizzes by the current user
            const allQuizzes = data.data || [];
            const userQuizzes = allQuizzes.filter(quiz => {
                // Handle new nested schema
                if (quiz.creator && quiz.creator.userId) {
                    return quiz.creator.userId === userId;
                }
                // Handle old flat schema
                return quiz.creator === userId || quiz.creatorID === userId;
            });

            return this.ensureQuizzesSorted(userQuizzes);

        } catch (error) {
            console.error('Error fetching user custom quizzes:', error);

            // For network errors or CORS issues, return empty array to prevent blocking
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                return [];
            }

            // For other errors, still return empty array but log the error
            return [];
        }
    }

    /**
     * Normalize quiz data to work with both old and new schema formats
     * @param {Object} quiz - Quiz object (could be old or new format)
     * @returns {Object} Normalized quiz object
     */
    normalizeQuizData(quiz) {
        if (!quiz) return null;

        return {
            // Basic info
            id: quiz.id || quiz.uid,
            title: quiz.metadata?.title || quiz.title || 'Untitled Quiz',

            // Content info - check new schema location first
            numQuestions: quiz.metadata?.questionCount || quiz.content?.totalQuestions || quiz.numQuestions || quiz.questionCount || 0,
            category: quiz.metadata?.category || quiz.category || 'General',
            difficulty: quiz.metadata?.difficulty || quiz.difficulty || '3',

            // Tags handling
            tags: quiz.metadata?.tags ?
                  (Array.isArray(quiz.metadata.tags) ? quiz.metadata.tags : [quiz.metadata.tags]) :
                  (quiz.tags ? (typeof quiz.tags === 'string' ? quiz.tags.split(',').map(t => t.trim()) : quiz.tags) : []),

            // Creator info - prioritize displayName from database
            creator: quiz.creator?.displayName || quiz.creator?.username || quiz.creator?.userId || quiz.creator || quiz.creatorID || 'Anonymous User',
            creatorUsername: quiz.creator?.username || '',

            // Access info - check new schema first
            isPrivate: !quiz.metadata?.isPublic || quiz.access?.visibility === 'private' || quiz.access?.password || !!quiz.quizPassword || quiz.hasPassword,
            password: (quiz.hasPassword || quiz.metadata?.hasPassword) ? 'protected' : null,

            // Analytics
            attempts: quiz.analytics?.stats?.attempts || quiz.attemptCount || 0,
            averageScore: quiz.analytics?.stats?.averageScore || quiz.averageScore || 0,

            // Timestamps
            createdAt: quiz.timestamps?.createdAt || quiz.createdAt,
            updatedAt: quiz.timestamps?.updatedAt || quiz.updatedAt,

            // Status
            isActive: quiz.moderation?.status === 'active' || quiz.isActive !== false
        };
    }

    /**
     * Ensure quizzes are sorted by creation date (newest first) as a fallback
     * @param {Array} quizzes - Array of quiz objects
     * @returns {Array} Sorted quizzes
     */
    ensureQuizzesSorted(quizzes) {
        if (!Array.isArray(quizzes)) {
            return [];
        }

        return quizzes.sort((a, b) => {
            // Handle different date formats and schema structures
            let dateA, dateB;

            // New nested schema
            if (a.timestamps && a.timestamps.createdAt) {
                dateA = new Date(a.timestamps.createdAt);
            }
            // Old flat schema
            else if (a.createdAt) {
                dateA = new Date(a.createdAt);
            } else {
                dateA = new Date(0);
            }

            // New nested schema
            if (b.timestamps && b.timestamps.createdAt) {
                dateB = new Date(b.timestamps.createdAt);
            }
            // Old flat schema
            else if (b.createdAt) {
                dateB = new Date(b.createdAt);
            } else {
                dateB = new Date(0);
            }

            // Sort descending (newest first)
            return dateB.getTime() - dateA.getTime();
        });
    }

    /**
     * Browse custom quizzes with server-side filtering, sorting, and searching
     * Optimized to use Firestore indexes for better performance
     * @param {Object} options - Browse options
     * @param {string} options.searchTerm - Search term for title/tags
     * @param {string} options.sortBy - Sort method: 'newest', 'oldest', 'title', 'attempts', 'score'
     * @param {string} options.privacy - Privacy filter: 'all', 'public', 'private'
     * @param {number} options.limit - Maximum results to return
     * @param {string} options.currentUserId - Current user ID (for private quiz access)
     * @param {boolean} options.useIndexes - Whether to use optimized indexed queries
     * @param {Array} options.fields - Specific fields to return for efficient data transfer
     * @returns {Promise<Object>} Browse results with metadata
     */
    async browseCustomQuizzes(options = {}) {
        const {
            searchTerm = '',
            sortBy = 'newest',
            privacy = 'all',
            limit = 50,
            currentUserId = null,
            useIndexes = true,
            fields = []
        } = options;

        try {
            // Use the new optimized endpoint that leverages Firestore indexes
            const endpoint = useIndexes ?
                'https://us-central1-quizmaster-c66a2.cloudfunctions.net/browseCustomQuizzesOptimized' :
                'https://us-central1-quizmaster-c66a2.cloudfunctions.net/browseCustomQuizzesV2';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    searchTerm,
                    sortBy,
                    privacy,
                    limit,
                    creator: currentUserId,
                    useIndexes,
                    // Additional optimization parameters
                    category: 'all',
                    difficulty: 'all'
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Browse API Error ${response.status}:`, errorText);
                throw new Error(`API Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            // Handle both new optimized endpoint and legacy endpoint responses
            const isOptimizedResponse = data.success !== undefined;

            if (isOptimizedResponse && !data.success) {
                throw new Error(data.error || 'Failed to browse quizzes');
            } else if (!isOptimizedResponse && !data.result) {
                throw new Error(data.message || 'Failed to browse quizzes');
            }

            return {
                quizzes: data.data || [],
                count: data.meta?.count || data.count || 0,
                searchTerm: data.meta?.searchTerm || data.searchTerm,
                sortBy: data.meta?.sortBy || data.sortBy,
                privacy: data.meta?.privacy || data.privacy,
                timestamp: data.meta?.queryTime || data.timestamp,
                indexesUsed: data.meta?.indexesUsed || null,
                optimized: data.meta?.optimized || false
            };

        } catch (error) {
            console.error('Error browsing custom quizzes:', error);

            // Return more specific error information
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Network error. Please check your connection and try again.');
            } else if (error.message.includes('500')) {
                throw new Error('Server error. The service may be temporarily unavailable.');
            } else {
                throw new Error(error.message || 'Failed to load quizzes. Please try again.');
            }
        }
    }
}

export default new QuizRetrievalService();