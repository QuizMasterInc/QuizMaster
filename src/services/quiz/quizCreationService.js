/**
 * Quiz Creation Service - handles quiz creation, validation, and normalization
 */
import { httpsCallable } from 'firebase/functions';
import { functions, handleFirebaseError, timestamp } from '../firebase/firebaseService';

class QuizCreationService {
    constructor() {
        // No collection needed - uses cloud functions
    }

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
     * Create quiz data object in UNIFIED format
     * Uses option_1, option_2, option_3, option_4 ONLY (no a,b,c,d)
     * @param {Array} quizDataArray - Array of question arrays
     * @returns {Object} - Questions object in unified format
     */
    createQuizDataObject(quizDataArray) {
        console.log('createQuizDataObject received:', quizDataArray);
        const questionsObject = {};

        quizDataArray.forEach((questionDetailsArray, index) => {
            const questionKey = `Question ${index + 1}`;

            console.log(`Processing question ${index + 1}:`, questionDetailsArray);

            // Handle different question types
            const questionType = questionDetailsArray[6] || "Multiple";

            // Normalize type to match default quiz format
            let normalizedType;
            if (questionType === "TrueFalse") {
                normalizedType = "TrueFalse";
            } else if (questionType === "FillInTheBlank") {
                normalizedType = "FillInTheBlank";
            } else if (questionType === "MultipleAnswer") {
                normalizedType = "MultipleAnswer";
            } else if (questionType === "DragAndDrop") {
                normalizedType = "DragAndDrop";
            } else {
                normalizedType = "Multiple";
            }

            // Build unified question object with ONLY option_1, option_2, option_3, option_4
            const questionObject = {
                question: questionDetailsArray[0],
                type: normalizedType,

                // Number-based options ONLY (option_1, option_2, etc.)
                option_1: questionDetailsArray[1] || "",
                option_2: questionDetailsArray[2] || "",
                option_3: questionDetailsArray[3] || "",
                option_4: questionDetailsArray[4] || "",

                // Correct answer - single format
                correct_answer: questionDetailsArray[5],

                // Additional metadata
                difficulty: parseInt(questionDetailsArray[8]) || 3, // 1-5 scale as NUMBER
                explanation: questionDetailsArray[7] || "",
                points: 1
            };

            console.log(`Created question object for ${questionKey}:`, questionObject);

            questionsObject[questionKey] = questionObject;
        });

        console.log('Final questionsObject:', questionsObject);

        return questionsObject;
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
            userQuizzes,
            showTimer,
            showPauseButton,
            duration
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
                timeLimit: duration || null,
                showTimer: showTimer !== undefined ? showTimer : true,
                showPauseButton: showPauseButton !== undefined ? showPauseButton : true,
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
}

export default new QuizCreationService();