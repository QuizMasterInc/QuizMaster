/**
 * Quiz Retrieval Service - handles quiz reading, browsing, and searching
 */
import { handleFirebaseError } from '../firebase/firebaseService';
import cloudFunctionsAPI from '../api/cloudFunctions';
import { sanitizeProfanity } from '../../utils/profanityFilter';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseService';

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
      if (!quizId) {
        throw new Error('Quiz ID is required');
      }

      const response = await cloudFunctionsAPI.getCustomQuiz(quizId);
      const quiz = response?.data || response;

      if (!quiz) {
        throw new Error('Quiz not found');
      }

      const questions = quiz.content?.questions || quiz.questions || {};
      const questionCount = quiz.metadata?.questionCount || quiz.content?.totalQuestions || Object.keys(questions).length;

      return {
        id: quiz.id || quiz.uid,
        ...quiz,
        questions,
        numQuestions: quiz.numQuestions || questionCount,
        createdAt: quiz.timestamps?.createdAt || quiz.createdAt,
        updatedAt: quiz.timestamps?.updatedAt || quiz.updatedAt || quiz.lastEdit
      };
    } catch (error) {
      if (error.code !== 'quiz-not-found') {
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
        orderByField = 'createdAt',
        orderDirection = 'desc',
        limitCount = 20
      } = options;

      const sortMapping = {
        createdAt: orderDirection === 'desc' ? 'newest' : 'oldest',
        title: orderDirection === 'asc' ? 'title' : 'titleReverse',
        updatedAt: orderDirection === 'desc' ? 'newest' : 'oldest'
      };

      const sortBy = sortMapping[orderByField] || 'newest';

      const result = await cloudFunctionsAPI.browseCustomQuizzes({
        sortBy,
        limit: limitCount,
        creator: creatorId
      });

      return {
        quizzes: result.quizzes || [],
        hasMore: (result.quizzes || []).length === limitCount,
        lastDoc: null
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
      if (!userId) return [];

      const response = await cloudFunctionsAPI.getAllCustomQuizzes();

      if (!response || !response.result) return [];

      const allQuizzes = response.data || [];
      const userQuizzes = allQuizzes.filter((quiz) => {
        return quiz.creator?.userId === userId;
      });

      return userQuizzes.sort((a, b) => {
        const dateA = new Date(a.timestamps?.createdAt || 0);
        const dateB = new Date(b.timestamps?.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error fetching user custom quizzes:', error);

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return [];
      }
      return [];
    }
  }

  /**
   * Browse custom quizzes with server-side filtering, sorting, and searching
   * Optimized to use Firestore indexes for better performance
   */
  async browseCustomQuizzes(options = {}) {
    const {
      searchTerm = '',
      sortBy = 'newest',
      privacy = 'all',
      limit = 50,
      currentUserId = null,
      useIndexes = true
      // fields is accepted but not used by the cloud function call here
    } = options;

    try {
      const data = await cloudFunctionsAPI.browseCustomQuizzes({
        searchTerm,
        sortBy,
        privacy,
        limit,
        // IMPORTANT: do NOT filter by creator for public browsing
        // currentUserId should only be used for permission checks (include your private quizzes if supported)
        currentUserId,
        useIndexes,
        category: 'all',
        difficulty: 'all'
      });

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

      if (error.message?.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      } else if (error.message?.includes('500')) {
        throw new Error('Server error. The service may be temporarily unavailable.');
      } else {
        throw new Error(error.message || 'Failed to load quizzes. Please try again.');
      }
    }
  }

  async updateCustomQuiz(quizId, quizData) {
    try {
      if (!quizId) {
        throw new Error('Quiz ID is required');
      }

      await updateDoc(doc(db, this.collection, quizId), {
        ...quizData,
        'timestamps.updatedAt': new Date().toISOString()
      });

      return { success: true, quizId };
    } catch (error) {
      throw handleFirebaseError(error);
    }
  }

  async deleteCustomQuiz(quizId) {
    try {
      return await cloudFunctionsAPI.deleteCustomQuiz(quizId);
    } catch (error) {
      throw handleFirebaseError(error);
    }
  }

  /**
   * Normalize quiz data for consistent display format
   * NOTE: creator is returned as an OBJECT (not a string) so UI can show username/displayName.
   */
  normalizeQuizData(quiz) {
    if (!quiz) return null;

    return {
      id: quiz.uid || quiz.id,
      title: sanitizeProfanity(quiz.title || quiz.metadata?.title || 'Untitled Quiz'),
      numQuestions: quiz.numQuestions || quiz.metadata?.questionCount || quiz.questionCount || 0,

      tags: Array.isArray(quiz.tags)
        ? quiz.tags.map(tag => sanitizeProfanity(tag))
        : Array.isArray(quiz.metadata?.tags)
          ? quiz.metadata.tags.map(tag => sanitizeProfanity(tag))
          : (quiz.tags || quiz.metadata?.tags ? [sanitizeProfanity(quiz.tags || quiz.metadata?.tags)] : []),

      password: quiz.quizPassword || quiz.password || null,

      creator: {
        uid:
          quiz.creator?.uid ||
          quiz.creator?.userId ||
          quiz.createdBy ||
          quiz.creatorId ||
          quiz.creatorID ||
          quiz.userId ||
          null,
        displayName: sanitizeProfanity(quiz.creator?.displayName || quiz.creator?.name || quiz.creatorName || 'Anonymous User'),
        username: quiz.creator?.username || quiz.creatorUsername || quiz.username || null
      },

      difficulty: quiz.difficulty || quiz.metadata?.difficulty || 'Medium',
      category: quiz.category || quiz.metadata?.category || 'General',

      // supports both schemas: metadata.isPublic and root isPublic
      isPrivate: !!quiz.isPrivate || !((quiz.metadata?.isPublic ?? quiz.isPublic) === true),

      attempts: quiz.attempts || quiz.quizTaken || quiz.analytics?.stats?.attempts || 0,
      averageScore: quiz.averageScore || quiz.analytics?.stats?.averageScore || 0,

      createdAt: quiz.createdAt || quiz.timestamps?.createdAt,
      updatedAt: quiz.updatedAt || quiz.lastEdit || quiz.timestamps?.updatedAt
    };
  }
}

export default new QuizRetrievalService();
