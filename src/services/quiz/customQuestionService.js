/**
 * Custom Question Service - handles custom question management operations
 */
import cloudFunctionsAPI from '../api/cloudFunctions';
import { handleFirebaseError } from '../firebase/firebaseService';

class CustomQuestionService {
    constructor() {
        this.collection = 'custom-questions';
    }

    /**
     * Get all custom questions for the current user
     * @returns {Promise<Array>} Array of custom questions
     */
    async getCustomQuestions() {
        try {
            const result = await cloudFunctionsAPI.getCustomQuestions();
            return result.questions || [];
        } catch (error) {
            throw handleFirebaseError(error);
        }
    }

    /**
     * Add a new custom question
     * @param {Object} questionData - Question data to add
     * @returns {Promise<Object>} Created question
     */
    async addCustomQuestion(questionData) {
        try {
            return await cloudFunctionsAPI.addCustomQuestion(questionData);
        } catch (error) {
            throw handleFirebaseError(error);
        }
    }

    /**
     * Update an existing custom question
     * @param {string} questionId - Question ID to update
     * @param {Object} questionData - Updated question data
     * @returns {Promise<Object>} Updated question
     */
    async updateCustomQuestion(questionId, questionData) {
        try {
            return await cloudFunctionsAPI.updateCustomQuestion(questionId, questionData);
        } catch (error) {
            throw handleFirebaseError(error);
        }
    }

    /**
     * Delete a custom question
     * @param {string} questionId - Question ID to delete
     * @returns {Promise<Object>} Deletion result
     */
    async deleteCustomQuestion(questionId) {
        try {
            return await cloudFunctionsAPI.deleteCustomQuestion(questionId);
        } catch (error) {
            throw handleFirebaseError(error);
        }
    }

    /**
     * Validate custom question data
     * @param {Object} questionData - Question data to validate
     * @returns {Object} Validation result
     */
    validateCustomQuestion(questionData) {
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
}

export default new CustomQuestionService();