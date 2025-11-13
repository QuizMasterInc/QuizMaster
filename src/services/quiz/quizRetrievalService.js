/**
 * Quiz Retrieval Service - handles quiz reading, browsing, and searching
 */
import { handleFirebaseError } from '../firebase/firebaseService';
import cloudFunctionsAPI from '../api/cloudFunctions';

class QuizRetrievalService {
    constructor() {
        this.collection = 'custom_quizzes';
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

            // Use unified CloudFunctionsAPI
            const quiz = await cloudFunctionsAPI.getCustomQuiz(quizId);

            return {
                id: quiz.id || quiz.uid,
                ...quiz,
                createdAt: quiz.timestamps?.createdAt || quiz.createdAt,
                updatedAt: quiz.timestamps?.updatedAt || quiz.updatedAt
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

            // Map orderByField to browseCustomQuizzes sort options
            const sortMapping = {
                'createdAt': orderDirection === 'desc' ? 'newest' : 'oldest',
                'title': orderDirection === 'asc' ? 'title' : 'titleReverse',
                'updatedAt': orderDirection === 'desc' ? 'newest' : 'oldest'
            };

            const sortBy = sortMapping[orderByField] || 'newest';

            // Use browseCustomQuizzes for filtering and pagination
            const result = await cloudFunctionsAPI.browseCustomQuizzes({
                sortBy,
                limit: limitCount,
                creator: creatorId,
                // Note: browseCustomQuizzes doesn't support startAfterDoc pagination in the same way
                // This is a limitation we'll need to work with
            });

            return {
                quizzes: result.quizzes || [],
                hasMore: (result.quizzes || []).length === limitCount,
                lastDoc: null // Cloud Functions handle pagination differently
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

            const response = await cloudFunctionsAPI.getAllCustomQuizzes();

            // Handle response from grabAllCustomQuizzes
            if (!response || !response.result) {
                return [];
            }

            // Filter quizzes by the current user
            const allQuizzes = response.data || [];
            const userQuizzes = allQuizzes.filter(quiz => {
                // New nested schema only
                return quiz.creator?.userId === userId;
            });

            // Sort quizzes by creation date (newest first)
            return userQuizzes.sort((a, b) => {
                const dateA = new Date(a.timestamps?.createdAt || 0);
                const dateB = new Date(b.timestamps?.createdAt || 0);
                return dateB.getTime() - dateA.getTime();
            });

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
            const data = await cloudFunctionsAPI.browseCustomQuizzes({
                searchTerm,
                sortBy,
                privacy,
                limit,
                creator: currentUserId,
                useIndexes,
                // Additional optimization parameters
                category: 'all',
                difficulty: 'all'
            });

            // Handle response from browseCustomQuizzesOptimized (new format only)
            if (!data.success) {
                throw new Error(data.error || 'Failed to browse quizzes');
            }

            return {
                quizzes: data.quizzes || [],
                count: data.meta?.count || 0,
                searchTerm: data.meta?.searchTerm,
                sortBy: data.meta?.sortBy,
                privacy: data.meta?.privacy,
                timestamp: data.meta?.queryTime,
                indexesUsed: data.meta?.indexesUsed,
                optimized: true
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

    /**
     * Update an existing custom quiz
     * @param {string} quizId - Quiz ID to update
     * @param {Object} quizData - Updated quiz data
     * @returns {Promise<Object>} Updated quiz data
     */
    async updateCustomQuiz(quizId, quizData) {
        try {
            return await cloudFunctionsAPI.updateCustomQuiz(quizId, quizData);
        } catch (error) {
            throw handleFirebaseError(error);
        }
    }

    /**
     * Delete a custom quiz
     * @param {string} quizId - Quiz ID to delete
     * @returns {Promise<Object>} Deletion result
     */
    async deleteCustomQuiz(quizId) {
        try {
            return await cloudFunctionsAPI.deleteCustomQuiz(quizId);
        } catch (error) {
            throw handleFirebaseError(error);
        }
    }

    /**
     * Normalize quiz data for consistent display format
     * @param {Object} quiz - Raw quiz data from API
     * @returns {Object} Normalized quiz data for UI components
     */
    normalizeQuizData(quiz) {
        if (!quiz) return null;

        return {
            id: quiz.uid || quiz.id,
            title: quiz.title || quiz.metadata?.title || 'Untitled Quiz',
            numQuestions: quiz.numQuestions || quiz.metadata?.questionCount || quiz.questionCount || 0,
            tags: Array.isArray(quiz.tags) ? quiz.tags : (quiz.tags ? [quiz.tags] : []),
            password: quiz.quizPassword || quiz.password || null,
            creator: quiz.creator?.displayName || 'Anonymous User',
            difficulty: quiz.difficulty || quiz.metadata?.difficulty || 'Medium',
            category: quiz.category || quiz.metadata?.category || 'General',
            isPrivate: quiz.isPrivate || !quiz.metadata?.isPublic,
            attempts: quiz.attempts || quiz.quizTaken || quiz.analytics?.stats?.attempts || 0,
            averageScore: quiz.averageScore || quiz.analytics?.stats?.averageScore || 0,
            createdAt: quiz.createdAt || quiz.timestamps?.createdAt,
            updatedAt: quiz.updatedAt || quiz.lastEdit || quiz.timestamps?.updatedAt
        };
    }
}

export default new QuizRetrievalService();