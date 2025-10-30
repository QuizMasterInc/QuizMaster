/**
 * Quiz API Service - handles quiz-related API calls
 */
import cloudFunctionsAPI from '../api/cloudFunctions';

class QuizApiService {
    /**
     * Fetch subcategories for a given category
     * @param {string} category - The category to fetch subcategories for
     * @returns {Promise<Array>} Array of subcategories
     */
    async fetchSubcategories(category) {
        if (!category) {
            return [];
        }

        try {
            const data = await cloudFunctionsAPI.fetchSubcategories(category);
            return data.subcategories || [];
        } catch (error) {
            console.error(`[QuizApiService] Error fetching subcategories for ${category}:`, error);
            return []; // Return empty array on error for graceful degradation
        }
    }
}

export default new QuizApiService();