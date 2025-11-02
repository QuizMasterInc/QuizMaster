import { useState, useCallback } from 'react';
import quizApiService from '../services/quiz/quizApiService';

/**
 * Custom hook for quiz API operations
 * Manages subcategory fetching and related state
 */
export const useQuizApi = () => {
    const [availableSubcategories, setAvailableSubcategories] = useState([]);
    const [quizSubcategories, setQuizSubcategories] = useState({});
    const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);

    /**
     * Fetch subcategories for a category and update state
     * @param {string} category - Category to fetch subcategories for
     */
    const fetchSubcategories = useCallback(async (category) => {
        if (!category) {
            setAvailableSubcategories([]);
            return;
        }

        setIsLoadingSubcategories(true);
        try {
            const subcategories = await quizApiService.fetchSubcategories(category);
            setAvailableSubcategories(subcategories);

            // Update the quizSubcategories state with dynamic data
            setQuizSubcategories(prev => ({
                ...prev,
                [category.toLowerCase()]: subcategories
            }));
        } catch (error) {
            // Error already handled in service, just ensure clean state
            setAvailableSubcategories([]);
        } finally {
            setIsLoadingSubcategories(false);
        }
    }, []);

    /**
     * Clear available subcategories
     */
    const clearAvailableSubcategories = useCallback(() => {
        setAvailableSubcategories([]);
    }, []);

    return {
        availableSubcategories,
        quizSubcategories,
        isLoadingSubcategories,
        fetchSubcategories,
        clearAvailableSubcategories
    };
};