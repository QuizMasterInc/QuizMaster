/**
 * Main application context that combines category selection with global app state
 */
import { createContext, useContext, useState } from 'react';
import { QUIZ_CATEGORIES, CATEGORY_ICONS, CATEGORY_DESTINATIONS } from '../constants/quizConstants';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { useQuizApi } from '../hooks/useQuizApi';
import { useQuizLogic } from '../hooks/useQuizLogic';

// Create context
const AppContext = createContext(null);

/**
 * Main application provider - now a clean facade that composes specialized hooks
 */
export const AppProvider = ({ children }) => {
    // Static data from constants
    const [quizCategories] = useState(QUIZ_CATEGORIES);

    // Configuration state using sessionStorage hook
    const [category, setCategory] = useSessionStorage('quizmaster_category', '');
    const [subcategories, setSubcategories] = useSessionStorage('quizmaster_subcategories', [], true);
    const [difficulty, setDifficulty] = useSessionStorage('quizmaster_difficulty', '');
    const [amount, setAmount] = useSessionStorage('quizmaster_amount', '10');

    // Compose configuration state
    const config = {
        category,
        setCategory,
        subcategories,
        setSubcategories,
        difficulty,
        setDifficulty,
        amount,
        setAmount
    };

    // API operations
    const api = useQuizApi();

    // Business logic and validation
    const logic = useQuizLogic(config, api);

    // Context values - clean composition of all hooks
    const value = {
        // Static data
        quizCategories,
        quizSubcategories: api.quizSubcategories,
        availableSubcategories: api.availableSubcategories,
        icons: CATEGORY_ICONS,
        destinations: CATEGORY_DESTINATIONS,

        // Configuration state
        category,
        subcategories,
        difficulty,
        amount,

        // API state
        isLoadingSubcategories: api.isLoadingSubcategories,

        // Business logic methods
        ...logic
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

/**
 * Hook for using app context
 */
export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

export const useCategory = useApp;
export default AppContext;