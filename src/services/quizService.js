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
     * Submit quiz attempt for default quizmaster quizzes
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
            
            // Handle both new and old schema formats
            let duplicatedQuiz;
            
            if (originalQuiz.metadata) {
                // New nested schema
                const { id, timestamps, analytics, ...quizData } = originalQuiz;
                
                duplicatedQuiz = {
                    ...quizData,
                    metadata: {
                        ...quizData.metadata,
                        title: overrides.title || `${quizData.metadata.title} (Copy)`,
                        ...overrides.metadata
                    },
                    timestamps: {
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        lastAttemptAt: null
                    },
                    analytics: {
                        stats: {
                            attempts: 0,
                            completions: 0,
                            averageScore: 0,
                            averageTime: 0
                        },
                        performance: {
                            questionStats: {},
                            difficultyBreakdown: {}
                        }
                    },
                    moderation: {
                        ...quizData.moderation,
                        status: "active"
                    },
                    ...overrides
                };
            } else {
                // Old flat schema
                const { id, createdAt, updatedAt, attemptCount, averageScore, ...quizData } = originalQuiz;
                
                duplicatedQuiz = {
                    ...quizData,
                    ...overrides,
                    title: overrides.title || `${quizData.title} (Copy)`,
                    isActive: true
                };
            }
            
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
     * Normalize tags to consistent format
     * @param {string|Array} tags - Tags to normalize (can be string or array)
     * @returns {string} - Normalized comma-separated tags string
     */
    normalizeTags(tags) {
        // Handle different input types
        let normalizedTags = '';
        
        if (Array.isArray(tags)) {
            // Convert array to comma-separated string
            normalizedTags = tags.join(',');
        } else if (typeof tags === 'string') {
            normalizedTags = tags;
        } else {
            // Handle other types by converting to string
            normalizedTags = String(tags || '');
        }
        
        // Normalize comma-separated values: handle multiple commas, extra spaces, and edge cases
        normalizedTags = normalizedTags
            .replace(/,+/g, ',')           // Replace multiple consecutive commas with single comma
            .replace(/^\s*,+|,+\s*$/g, '') // Remove leading/trailing commas and spaces
            .split(',')                    // Split by commas
            .map(tag => tag.trim())        // Trim whitespace from each tag
            .filter(tag => tag.length > 0) // Remove empty tags
            .join(',');                    // Join back with single commas
        
        return normalizedTags;
    }

    /**
     * Validate quiz tags input
     * @param {string|Array} tags - Tags to validate (can be string or array)
     * @returns {boolean} - Validation result
     */
    validateQuizTags(tags) {
        const normalizedTags = this.normalizeTags(tags);
        return !!(normalizedTags && normalizedTags.length > 0);
    }

    /**
     * Check if quiz title already exists for user
     * @param {Array} userQuizzes - User's existing quizzes
     * @param {string} newTitle - New quiz title to check
     * @returns {boolean} - True if title exists
     */
    isTitleDuplicate(userQuizzes, newTitle) {
        if (!userQuizzes || !Array.isArray(userQuizzes)) return false;
        
        const titles = userQuizzes.map(quiz => {
            // Handle new nested schema
            if (quiz.metadata && quiz.metadata.title) {
                return quiz.metadata.title;
            }
            // Handle old flat schema
            return quiz.title || (quiz.data && quiz.data.title) || '';
        });
        
        return titles.some(title => 
            title.toLowerCase() === newTitle.toLowerCase()
        );
    }

    /**
     * Transform quiz data array into new nested object format for comprehensive schema
     * @param {Array} quizDataArray - Array of question data
     * @returns {Array} - Array of question objects in new format
     */
    createQuizDataObject(quizDataArray) {
        return quizDataArray.map((questionDetailsArray, index) => {
            // Handle different question types
            const questionType = questionDetailsArray[6] || "Multiple";
            const type = questionType === "TrueFalse" ? "true-false" : 
                        questionType === "FillInTheBlank" ? "fill-blank" : 
                        questionType === "MultipleAnswer" ? "multiple-answer" : "multiple-choice";
            
            // Handle options based on question type
            let options = [];
            if (type === "fill-blank") {
                options = [questionDetailsArray[1]]; // Only first option for fill-in-blank
            } else {
                options = [
                    questionDetailsArray[1], 
                    questionDetailsArray[2], 
                    questionDetailsArray[3], 
                    questionDetailsArray[4]
                ].filter(Boolean); // Remove empty options
            }
            
            return {
                id: `q${index + 1}`,
                type: type,
                question: questionDetailsArray[0],
                options: options,
                correctAnswer: questionDetailsArray[5],
                explanation: questionDetailsArray[7] || "",
                points: 1,
                category: "",
                difficulty: questionDetailsArray[8] || "3"
            };
        });
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

        // Create comprehensive quiz object with new nested schema
        const quizObject = {
            // Metadata section
            metadata: {
                title: quizName,
                description: "",
                category: "General",
                tags: this.normalizeTags(quizTags).split(',').filter(t => t.trim()),
                difficulty: "3",
                language: "en",
                version: "1.0.0"
            },
            
            // Creator section
            creator: {
                userId: currentUserId,
                username: "",
                verified: false
            },
            
            // Content section
            content: {
                questions: this.createQuizDataObject(quizData),
                totalQuestions: quizData.length,
                estimatedTime: Math.max(1, Math.ceil(quizData.length * 0.5)) // 30 seconds per question
            },
            
            // Access section
            access: {
                visibility: privateQuiz ? "private" : "public",
                password: privateQuiz ? privateQuizPassword : null,
                allowAnonymous: !privateQuiz,
                restrictions: []
            },
            
            // Moderation section
            moderation: {
                status: "active",
                reports: [],
                flags: []
            },
            
            // Analytics section
            analytics: {
                stats: {
                    attempts: 0,
                    completions: 0,
                    averageScore: 0,
                    averageTime: 0
                },
                performance: {
                    questionStats: {},
                    difficultyBreakdown: {}
                }
            },
            
            // Timestamps section
            timestamps: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastAttemptAt: null
            },
            
            // Settings section
            settings: {
                shuffleQuestions: false,
                shuffleAnswers: false,
                showCorrectAnswers: true,
                allowRetakes: true,
                timeLimit: null,
                passingScore: 70
            }
        };

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

export default new QuizService();