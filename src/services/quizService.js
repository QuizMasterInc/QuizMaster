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

    // ===== CUSTOM QUIZ BUSINESS LOGIC =====

    /**
     * Validate quiz name input
     * @param {string} quizName - Quiz name to validate
     * @returns {boolean} - Validation result
     */
    validateQuizName(quizName) {
        return !!(quizName && quizName.trim());
    }

    /**
     * Validate quiz password input
     * @param {string} password - Password to validate
     * @returns {boolean} - Validation result
     */
    validateQuizPassword(password) {
        return !!(password && password.trim());
    }

    /**
     * Validate quiz tags input
     * @param {string} tags - Tags to validate
     * @returns {boolean} - Validation result
     */
    validateQuizTags(tags) {
        return !!(tags && tags.trim());
    }

    /**
     * Check if quiz title already exists for user
     * @param {Array} userQuizzes - User's existing quizzes
     * @param {string} newTitle - New quiz title to check
     * @returns {boolean} - True if title exists
     */
    isTitleDuplicate(userQuizzes, newTitle) {
        if (!userQuizzes || !Array.isArray(userQuizzes)) return false;
        
        const titles = userQuizzes.map(quiz => 
            quiz.title || (quiz.data && quiz.data.title) || ''
        );
        
        return titles.some(title => 
            title.toLowerCase() === newTitle.toLowerCase()
        );
    }

    /**
     * Transform quiz data array into Firestore object format
     * @param {Array} quizDataArray - Array of question data
     * @returns {Object} - Formatted quiz data object
     */
    createQuizDataObject(quizDataArray) {
        const quizDataObject = {};
        
        for (let i = 0; i < quizDataArray.length; i++) {
            const questionDetailsArray = quizDataArray[i];
            const questionNumber = `Question ${i + 1}`;
            
            quizDataObject[questionNumber] = {
                question: questionDetailsArray[0],
                option_1: questionDetailsArray[1],
                option_2: questionDetailsArray[2],
                option_3: questionDetailsArray[3],
                option_4: questionDetailsArray[4],
                correct_answer: questionDetailsArray[5],
            };
        }
        
        return quizDataObject;
    }

    /**
     * Create complete quiz object with validation
     * @param {Object} quizInput - Quiz creation data
     * @returns {Object} - Validated quiz object or validation errors
     */
    createValidatedQuizObject(quizInput) {
        const {
            quizName,
            quizData,
            quizTags,
            privateQuiz,
            privateQuizPassword,
            currentUserId,
            userQuizzes
        } = quizInput;

        // Validation
        const validations = {
            validQuizName: this.validateQuizName(quizName),
            validQuizTags: this.validateQuizTags(quizTags),
            duplicateTitle: this.isTitleDuplicate(userQuizzes, quizName),
            validPassword: privateQuiz ? this.validateQuizPassword(privateQuizPassword) : true
        };

        // Check for validation errors
        if (validations.duplicateTitle) {
            return { 
                success: false, 
                error: "You already have a quiz with this title. Please choose a different title." 
            };
        }

        if (!validations.validQuizName) {
            return { 
                success: false, 
                error: "Please enter a valid quiz name." 
            };
        }

        if (!validations.validQuizTags) {
            return { 
                success: false, 
                error: "Please enter valid quiz tags." 
            };
        }

        if (privateQuiz && !validations.validPassword) {
            return { 
                success: false, 
                error: "Please enter a valid password for private quiz." 
            };
        }

        // Create quiz object
        const quizObject = {
            creatorID: currentUserId,
            title: quizName,
            questionCount: quizData.length,
            quizData: this.createQuizDataObject(quizData),
            quizTags: quizTags,
            createdAt: new Date().toISOString(),
            isActive: true
        };

        // Add password if private quiz
        if (privateQuiz) {
            quizObject.quizPassword = privateQuizPassword;
        }

        return { success: true, quizObject };
    }

    /**
     * Submit quiz to Firebase Cloud Function
     * @param {Object} quizObject - Validated quiz object
     * @returns {Promise<Object>} - API response
     */
    async submitCustomQuiz(quizObject) {
        try {
            const response = await fetch(
                'https://us-central1-quizmaster-c66a2.cloudfunctions.net/addCustomQuiz',
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(quizObject)
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error submitting quiz:', error);
            throw new Error('Failed to create quiz. Please try again.');
        }
    }

    /**
     * Get custom quizzes by user (optimized V2)
     * @param {string} userId - User ID (creator)
     * @returns {Promise<Array>} User's custom quizzes
     */
    async getCustomQuizzesByUser(userId) {
        try {
            const response = await fetch(
                `https://grabcustomquizzesbyuserv2-ukhjsvkoca-uc.a.run.app`,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ creator: userId })
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return Array.isArray(data) ? data : [];

        } catch (error) {
            console.error('Error fetching user custom quizzes:', error);
            throw new Error('Failed to fetch custom quizzes. Please try again.');
        }
    }

    /**
     * Browse custom quizzes with server-side filtering, sorting, and searching
     * Replaces client-side operations for better performance and security
     * @param {Object} options - Browse options
     * @param {string} options.searchTerm - Search term for title/tags
     * @param {string} options.sortBy - Sort method: 'newest', 'oldest', 'title', etc.
     * @param {string} options.privacy - Privacy filter: 'all', 'public', 'private'
     * @param {number} options.limit - Maximum results to return
     * @param {string} options.currentUserId - Current user ID (for private quiz access)
     * @returns {Promise<Object>} Browse results with metadata
     */
    async browseCustomQuizzes(options = {}) {
        const {
            searchTerm = '',
            sortBy = 'newest',
            privacy = 'all',
            limit = 50,
            currentUserId = null
        } = options;

        try {
            const response = await fetch(
                'https://us-central1-quizmaster-c66a2.cloudfunctions.net/browseCustomQuizzesV2',
                {
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
                        currentUserId
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to browse quizzes');
            }

            return {
                quizzes: data.data || [],
                count: data.count || 0,
                searchTerm: data.searchTerm,
                sortBy: data.sortBy,
                privacy: data.privacy,
                timestamp: data.timestamp
            };

        } catch (error) {
            console.error('Error browsing custom quizzes:', error);
            throw new Error('Failed to browse quizzes. Please try again.');
        }
    }
}

export default new QuizService();