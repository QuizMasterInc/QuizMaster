/**
 * Quiz service - handles all quiz-related operations
 */
import {
    collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter,
    arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions, handleFirebaseError, withRetry, timestamp } from './firebaseService';
  
class QuizService {
    constructor() {
        this.collection = 'quizzes';
        this.attemptsCollection = 'quizAttempts';
    }
  
    /**
        * Create a new quiz
        * @param {Object} quizData - Quiz data
        * @returns {Promise<Object>} Created quiz
        */
    async createQuiz(quizData) {
        try {
            const quiz = {
                ...quizData,
                createdAt: timestamp.now(),
                updatedAt: timestamp.now(),
                isActive: true,
                attemptCount: 0,
                averageScore: 0,
                questions: quizData.questions || []
            };
        
            const docRef = await withRetry(() => 
                addDoc(collection(db, this.collection), quiz)
            );
        
            return {
                id: docRef.id,
                ...quiz
            };
        
        } catch (error) {
            throw handleFirebaseError(error);
        }
    }
  
    /**
     * Get quiz by ID
     * @param {string} quizId - Quiz ID
     * @returns {Promise<Object>} Quiz data
     */
    async getQuizById(quizId) {
        try {
            const quizDoc = await withRetry(() => 
                getDoc(doc(db, this.collection, quizId))
            );
    
            if (!quizDoc.exists()) {
                throw new Error('Quiz not found');
            }
    
            const quiz = quizDoc.data();
            return {
                id: quizDoc.id,
                ...quiz,
                createdAt: timestamp.fromFirestore(quiz.createdAt),
                updatedAt: timestamp.fromFirestore(quiz.updatedAt)
            };
    
        } catch (error) {
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
     * Update quiz
     * @param {string} quizId - Quiz ID
     * @param {Object} updates - Quiz updates
     * @returns {Promise<Object>} Updated quiz
     */
    async updateQuiz(quizId, updates) {
        try {
            const quizUpdates = {
                ...updates,
                updatedAt: timestamp.now()
            };
    
            await withRetry(() => 
                updateDoc(doc(db, this.collection, quizId), quizUpdates)
            );
    
            return await this.getQuizById(quizId);
    
        } catch (error) {
            throw handleFirebaseError(error);
        }
    }
  
    /**
     * Delete quiz (soft delete)
     * @param {string} quizId - Quiz ID
     * @returns {Promise<void>}
     */
    async deleteQuiz(quizId) {
        try {
            await withRetry(() => 
                updateDoc(doc(db, this.collection, quizId), {
                    isActive: false,
                    deletedAt: timestamp.now(),
                    updatedAt: timestamp.now()
                })
            );
    
        } catch (error) {
            throw handleFirebaseError(error);
        }
    }
  
    /**
     * Submit quiz attempt
     * @param {string} quizId - Quiz ID
     * @param {Object} attemptData - Quiz attempt data
     * @returns {Promise<Object>} Attempt result
     */
    async submitQuizAttempt(quizId, attemptData) {
        try {
            // Use cloud function for processing quiz submission
            const submitQuizFunction = httpsCallable(functions, 'submitQuiz');
            
            const result = await submitQuizFunction({
                quizId,
                ...attemptData,
                submittedAt: timestamp.now()
            });
    
            return result.data;
    
        } catch (error) {
            throw handleFirebaseError(error);
        }
    }
  
    /**
     * Get quiz attempts for a user
     * @param {string} userId - User ID
     * @param {string} quizId - Optional quiz ID filter
     * @returns {Promise<Array>} Quiz attempts
     */
    async getUserAttempts(userId, quizId = null) {
        try {
            let q = collection(db, this.attemptsCollection);
            q = query(q, where('userId', '==', userId));
            
            if (quizId) {
                q = query(q, where('quizId', '==', quizId));
            }
            
            q = query(q, orderBy('submittedAt', 'desc'));
    
            const querySnapshot = await getDocs(q);
            
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                submittedAt: timestamp.fromFirestore(doc.data().submittedAt)
            }));
    
        } catch (error) {
            throw handleFirebaseError(error);
        }
    }
  
    /**
     * Get quiz statistics
     * @param {string} quizId - Quiz ID
     * @returns {Promise<Object>} Quiz statistics
     */
    async getQuizStatistics(quizId) {
        try {
            // Use cloud function for complex analytics
            const getStatsFunction = httpsCallable(functions, 'getQuizStats');
            const result = await getStatsFunction({ quizId });
            
            return result.data;
    
        } catch (error) {
            throw handleFirebaseError(error);
        }
    }
  
    /**
     * Duplicate a quiz
     * @param {string} quizId - Quiz ID to duplicate
     * @param {Object} overrides - Optional property overrides
     * @returns {Promise<Object>} Duplicated quiz
     */
    async duplicateQuiz(quizId, overrides = {}) {
        try {
            const originalQuiz = await this.getQuizById(quizId);
            
            // Remove ID and timestamps, apply overrides
            const { id, createdAt, updatedAt, attemptCount, averageScore, ...quizData } = originalQuiz;
            
            const duplicatedQuiz = {
                ...quizData,
                ...overrides,
                title: overrides.title || `${quizData.title} (Copy)`,
                isActive: true
            };
            
            return await this.createQuiz(duplicatedQuiz);
    
        } catch (error) {
            throw handleFirebaseError(error);
        }
    }
}

export default new QuizService();