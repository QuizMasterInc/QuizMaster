import { useEffect } from 'react';

/**
 * Custom hook for quiz business logic and validation
 * Handles category/subcategory selection, validation, and quiz configuration logic
 */
export const useQuizLogic = (config, api) => {
    const {
        category,
        subcategories,
        difficulty,
        amount,
        setCategory,
        setSubcategories,
        setDifficulty,
        setAmount
    } = config;

    const {
        availableSubcategories,
        quizSubcategories,
        fetchSubcategories
    } = api;

    // Fetch subcategories when category changes
    useEffect(() => {
        fetchSubcategories(category);
        // Clear subcategories when category changes
        setSubcategories([]);
    }, [category]); // Only depend on category, not on functions

    /**
     * Select a category and reset subcategories
     * @param {string} selectedCategory - Category to select
     */
    const selectCategory = (selectedCategory) => {
        setCategory(selectedCategory);
        setSubcategories([]);
    };

    /**
     * Toggle a subcategory selection
     * @param {string} subcategory - Subcategory to toggle
     */
    const toggleSubcategory = (subcategory) => {
        setSubcategories(current => {
            if (current.includes(subcategory)) {
                return current.filter(item => item !== subcategory);
            } else {
                return [...current, subcategory];
            }
        });
    };

    /**
     * Select all subcategories for a category
     * @param {string} selectedCategory - Category to select all subcategories for
     */
    const allSubcategories = (selectedCategory) => {
        const categoryKey = selectedCategory.toLowerCase();
        // Use availableSubcategories if present, otherwise fall back to quizSubcategories
        const allSubs = availableSubcategories.length > 0
            ? availableSubcategories
            : (quizSubcategories[categoryKey] || []);
        setSubcategories(allSubs);
    };

    // Settings methods
    const updateDifficulty = (newDifficulty) => {
        setDifficulty(newDifficulty);
    };

    const updateAmount = (newAmount) => {
        setAmount(String(newAmount));
    };

    return {
        // Actions
        selectCategory,
        toggleSubcategory,
        updateDifficulty,
        updateAmount,

        // Aliases for backward compatibility
        allSubcategories,
        selectDifficulty: updateDifficulty,
        selectAmount: updateAmount,
    };
};