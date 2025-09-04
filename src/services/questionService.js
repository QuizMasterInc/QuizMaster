/**
 * Question service - handles question management operations
 */
import { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { db, handleFirebaseError, withRetry, timestamp } from './firebaseService';

class QuestionService {
    constructor() {
        this.collection = 'questions';
    }

    /**
     * Create a new question
     * @param {Object} questionData - Question data
     * @returns {Promise<Object>} Created question
     */
    async createQuestion(questionData) {
        try {
            const question = {
                ...questionData,
                createdAt: timestamp.now(),
                updatedAt: timestamp.now(),
                isActive: true,
                usageCount: 0
            };

            const docRef = await withRetry(() => 
                addDoc(collection(db, this.collection), question)
            );

            return {
                id: docRef.id,
                ...question
            };

        } catch (error) {
            throw handleFirebaseError(error);
        }
    }

    /**
     * Get question by ID
     * @param {string} questionId - Question ID
     * @returns {Promise<Object>} Question data
     */
    async getQuestionById(questionId) {
        try {
            const questionDoc = await withRetry(() => 
                getDoc(doc(db, this.collection, questionId))
            );

            if (!questionDoc.exists()) {
                throw new Error('Question not found');
            }

            const question = questionDoc.data();
            return {
                id: questionDoc.id,
                ...question,
                createdAt: timestamp.fromFirestore(question.createdAt),
                updatedAt: timestamp.fromFirestore(question.updatedAt)
            };

        } catch (error) {
            throw handleFirebaseError(error);
        }
    }

    /**
     * Get questions with filtering
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Questions array
     */
    async getQuestions(options = {}) {
        try {
            const {
                creatorId,
                subject,
                difficulty,
                questionType,
                isActive = true,
                limitCount = 50
            } = options;

            let q = collection(db, this.collection);

            if (creatorId) {
                q = query(q, where('creatorId', '==', creatorId));
            }

            if (subject) {
                q = query(q, where('subject', '==', subject));
            }

            if (difficulty) {
                q = query(q, where('difficulty', '==', difficulty));
            }

            if (questionType) {
                q = query(q, where('type', '==', questionType));
            }

            if (isActive !== undefined) {
                q = query(q, where('isActive', '==', isActive));
            }

            // Apply ordering and limit
            q = query(q, orderBy('createdAt', 'desc'), limit(limitCount));

            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: timestamp.fromFirestore(doc.data().createdAt),
                updatedAt: timestamp.fromFirestore(doc.data().updatedAt)
            }));

        } catch (error) {
            throw handleFirebaseError(error);
        }
    }

    /**
     * Update question
     * @param {string} questionId - Question ID
     * @param {Object} updates - Question updates
     * @returns {Promise<Object>} Updated question
     */
    async updateQuestion(questionId, updates) {
        try {
            const questionUpdates = {
                ...updates,
                updatedAt: timestamp.now()
            };

            await withRetry(() => 
                updateDoc(doc(db, this.collection, questionId), questionUpdates)
            );

            return await this.getQuestionById(questionId);

        } catch (error) {
            throw handleFirebaseError(error);
        }
    }

    /**
     * Delete question (soft delete)
     * @param {string} questionId - Question ID
     * @returns {Promise<void>}
     */
    async deleteQuestion(questionId) {
        try {
            await withRetry(() => 
                updateDoc(doc(db, this.collection, questionId), {
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
     * Validate question data
     * @param {Object} questionData - Question data to validate
     * @returns {Object} Validation result
     */
    validateQuestion(questionData) {
        const errors = {};

        // Required fields validation
        if (!questionData.question?.trim()) {
            errors.question = 'Question text is required';
        }

        if (!questionData.type) {
            errors.type = 'Question type is required';
        }

        // Type-specific validation
        if (questionData.type === 'multiple-choice') {
            if (!questionData.options || questionData.options.length < 2) {
                errors.options = 'At least 2 options are required for multiple choice questions';
            }

            if (!questionData.correctAnswer && questionData.correctAnswer !== 0) {
                errors.correctAnswer = 'Correct answer is required';
            }
        }

        if (questionData.type === 'true-false') {
            if (questionData.correctAnswer === undefined || questionData.correctAnswer === null) {
                errors.correctAnswer = 'Correct answer is required for true/false questions';
            }
        }

        if (questionData.type === 'short-answer' || questionData.type === 'essay') {
            if (!questionData.correctAnswer?.trim()) {
                errors.correctAnswer = 'Sample answer or rubric is required';
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    /**
     * Bulk import questions
     * @param {Array} questionsData - Array of question data
     * @returns {Promise<Object>} Import result
     */
    async bulkImportQuestions(questionsData) {
        try {
            const results = {
                successful: [],
                failed: [],
                total: questionsData.length
            };

            for (const questionData of questionsData) {
                try {
                    // Validate question
                    const validation = this.validateQuestion(questionData);
                    if (!validation.isValid) {
                        results.failed.push({
                            data: questionData,
                            error: validation.errors
                        });
                        continue;
                    }
                    
                    const createdQuestion = await this.createQuestion(questionData);
                    results.successful.push(createdQuestion);

                } catch (error) {
                    results.failed.push({
                        data: questionData,
                        error: error.message || 'Unknown error'
                    });
                }
            }

            return results;
        } catch (error) {
            throw handleFirebaseError(error);
        }
    }

}

export default new QuestionService();