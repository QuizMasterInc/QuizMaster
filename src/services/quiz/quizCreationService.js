/**
 * Quiz Creation Service - handles quiz creation, validation, and normalization
 */
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseService';
import cloudFunctionsAPI from '../api/cloudFunctions';
import { validateNoProfanity } from '../../utils/profanityFilter';

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

    validateQuizContentForProfanity({ quizName, quizTags, privateQuizPassword, quizData }) {
        const quizLevelValidation = validateNoProfanity([
            {
                label: 'Quiz title',
                value: quizName,
                message: 'Quiz title cannot include profanity.'
            },
            {
                label: 'Quiz tags',
                value: this.normalizeTags(quizTags),
                message: 'Quiz tags cannot include profanity.'
            },
            {
                label: 'Quiz password',
                value: privateQuizPassword,
                message: 'Quiz password cannot include profanity.'
            }
        ]);

        if (!quizLevelValidation.valid) {
            return quizLevelValidation;
        }

        for (let index = 0; index < (quizData || []).length; index += 1) {
            const questionDetailsArray = quizData[index] || [];
            const questionNumber = index + 1;
            const questionValidation = validateNoProfanity([
                {
                    label: `Question ${questionNumber}`,
                    value: questionDetailsArray[0],
                    message: `Question ${questionNumber} cannot include profanity.`
                },
                {
                    label: `Question ${questionNumber} explanation`,
                    value: questionDetailsArray[7],
                    message: `Question ${questionNumber} explanation cannot include profanity.`
                },
                {
                    label: `Question ${questionNumber} correct answer`,
                    value: questionDetailsArray[5],
                    message: `Question ${questionNumber} correct answer cannot include profanity.`
                },
                ...questionDetailsArray.slice(1, 5).map((choice, choiceIndex) => ({
                    label: `Question ${questionNumber} option ${choiceIndex + 1}`,
                    value: choice,
                    message: `Question ${questionNumber} option ${choiceIndex + 1} cannot include profanity.`
                }))
            ]);

            if (!questionValidation.valid) {
                return questionValidation;
            }
        }

        return { valid: true };
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
     * Check if quiz title already exists for user (using array of titles)
     * @param {Array} existingTitles - Array of existing quiz titles
     * @param {string} newTitle - New quiz title to check
     * @returns {boolean} - True if title exists
     */
    isTitleDuplicateFromTitles(existingTitles, newTitle) {
        if (!existingTitles || !Array.isArray(existingTitles)) {
            return false;
        }

        return existingTitles.some(title =>
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
        const questionsObject = {};

        quizDataArray.forEach((questionDetailsArray, index) => {
            const questionKey = `Question ${index + 1}`;

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

            questionsObject[questionKey] = questionObject;
        });

        return questionsObject;
    }

    /**
     * Fetch user's existing quiz titles using Cloud Function for consistency
     * @param {string} userId - User ID to fetch quizzes for
     * @returns {Promise<Array>} Array of existing quiz titles
     */
    async fetchUserQuizTitles(userId) {
        try {
            if (!userId) {
                return [];
            }

            // Use unified CloudFunctionsAPI
            const data = await cloudFunctionsAPI.call('grabUserCustomQuizzesV2', { uid: userId }, 'POST');

            // Extract titles from the quiz data (new nested schema only)
            const titles = data.data.map(quiz => {
                return quiz.metadata?.title || '';
            }).filter(title => title.length > 0);

            return titles;

        } catch (error) {
            console.error('Error fetching user quiz titles from Cloud Function:', error);
            // Return empty array on error to allow quiz creation rather than block it
            return [];
        }
    }

    /**
     * Create complete quiz object with validation
     * @param {Object} quizInput - Quiz creation data
     * @returns {Promise<Object>} - Validated quiz object or validation errors
     */
    async createValidatedQuizObject(quizInput) {
        const {
            quizName,
            quizData,
            quizTags,
            privateQuiz,
            privateQuizPassword,
            currentUserId,
            teacherQuiz
        } = quizInput;

        // Fetch fresh user quiz titles for duplicate validation
        let userQuizTitles = [];
        try {
            userQuizTitles = await this.fetchUserQuizTitles(currentUserId);
        } catch (error) {
            console.error('Error fetching user quiz titles for validation:', error);
            // Continue with empty array - better to allow creation than block due to fetch error
        }

        // Validation
        const validations = {
            validQuizName: this.validateQuizName(quizName),
            validQuizTags: this.validateQuizTags(quizTags),
            duplicateTitle: this.isTitleDuplicateFromTitles(userQuizTitles, quizName),
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

        const profanityValidation = this.validateQuizContentForProfanity({
            quizName,
            quizTags,
            privateQuizPassword,
            quizData
        });

        if (!profanityValidation.valid) {
            return {
                success: false,
                error: profanityValidation.error
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
                version: "1.0.0",
                isPublic: !privateQuiz,
                hasPassword: !!privateQuiz,
                password: privateQuiz ? privateQuizPassword : null,
                isTeacherMade: !!teacherQuiz
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
            return await cloudFunctionsAPI.call('addCustomQuiz', quizObject);
        } catch (error) {
            console.error('Error submitting quiz:', error);
            throw new Error('Failed to create quiz. Please try again.');
        }
    }
}

export default new QuizCreationService();
