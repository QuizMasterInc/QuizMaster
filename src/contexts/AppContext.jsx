/**
 * Main application context that combines category selection with global app state
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const AppContext = createContext(null);

/**
 * Main application provider
 */
export const AppProvider = ({ children }) => {
    // Quiz categories and configuration
    const [quizCategories] = useState([
        'Geography',
        'Science',
        'Sports',
        'Entertainment',
        'Mathematics',
        'History'
    ]);

    const [quizSubcategories] = useState({
        'geography': ['world', 'americas'],
        'science': ['biology', 'chemistry', 'astronomy', 'physics'],
        'sports': ['soccer', 'basketball', 'football'],
        'entertainment': ['tv', 'music', 'movies', 'video games'],
        'mathematics': ['algebra', 'geometry', 'calculus'],
        'history': ['global', 'america', 'norse mythology'],
    });

    // User quiz selections - persist to sessionStorage
    const [category, setCategory] = useState(
        () => sessionStorage.getItem('quizmaster_category') || ''
    );
    
    const [subcategories, setSubcategories] = useState(
        () => JSON.parse(sessionStorage.getItem('quizmaster_subcategories') || '[]')
    );
    
    const [difficulty, setDifficulty] = useState(
        () => sessionStorage.getItem('quizmaster_difficulty') || ''
    );
    
    const [amount, setAmount] = useState(
        () => sessionStorage.getItem('quizmaster_amount') || '10'
    );
    
    const [duration, setDuration] = useState(
        () => Number(sessionStorage.getItem('quizmaster_duration')) || 5
    );

    // Quiz settings
    const [showTimer, setShowTimer] = useState(
        () => JSON.parse(sessionStorage.getItem('quizmaster_showTimer') || 'true')
    );
    
    const [showPauseButton, setShowPauseButton] = useState(
        () => JSON.parse(sessionStorage.getItem('quizmaster_showPauseButton') || 'true')
    );

    useEffect(() => {
        sessionStorage.setItem('quizmaster_category', category);
    }, [category]);

    useEffect(() => {
        sessionStorage.setItem('quizmaster_subcategories', JSON.stringify(subcategories));
    }, [subcategories]);

    useEffect(() => {
        sessionStorage.setItem('quizmaster_difficulty', difficulty);
    }, [difficulty]);

    useEffect(() => {
        sessionStorage.setItem('quizmaster_amount', amount);
    }, [amount]);

    useEffect(() => {
        sessionStorage.setItem('quizmaster_duration', duration);
    }, [duration]);

    useEffect(() => {
        sessionStorage.setItem('quizmaster_showTimer', JSON.stringify(showTimer));
    }, [showTimer]);

    useEffect(() => {
        sessionStorage.setItem('quizmaster_showPauseButton', JSON.stringify(showPauseButton));
    }, [showPauseButton]);

    const selectCategory = (selectedCategory) => {
        setCategory(selectedCategory);
        setSubcategories([]);
    };

    const toggleSubcategory = (subcategory) => {
        setSubcategories(current => {
            if (current.includes(subcategory)) {
                return current.filter(item => item !== subcategory);
            } else {
                return [...current, subcategory];
            }
        });
    };

    const selectAllSubcategories = (selectedCategory) => {
        const categoryKey = selectedCategory.toLowerCase();
        const allSubs = quizSubcategories[categoryKey] || [];
        setSubcategories(allSubs);
    };

    const clearAllSubcategories = () => {
        setSubcategories([]);
    };

    // Settings methods
    const updateDifficulty = (newDifficulty) => {
        setDifficulty(newDifficulty);
    };

    const updateAmount = (newAmount) => {
        setAmount(String(newAmount));
    };

    const updateDuration = (newDuration) => {
        setDuration(Number(newDuration));
    };

    const toggleTimerVisibility = () => {
        setShowTimer(current => !current);
    };

    const togglePauseButtonVisibility = () => {
        setShowPauseButton(current => !current);
    };

    // Reset all selections
    const resetQuizSettings = () => {
        setCategory('');
        setSubcategories([]);
        setDifficulty('');
        setAmount('10');
        setDuration(5);
        setShowTimer(true);
        setShowPauseButton(true);
    };

    // Validation helpers
    const isQuizConfigValid = () => {
        return category && (subcategories.length > 0) && difficulty && amount;
    };

    const getSelectedSubcategoriesForCategory = (selectedCategory) => {
        const categoryKey = selectedCategory.toLowerCase();
        return quizSubcategories[categoryKey] || [];
    };

    // Context values
    const value = {
        quizCategories,
        quizSubcategories,
        category,
        subcategories,
        difficulty,
        amount,
        duration,
        showTimer,
        showPauseButton,
        selectCategory,
        toggleSubcategory,
        selectAllSubcategories,
        clearAllSubcategories,
        updateDifficulty,
        updateAmount,
        updateDuration,
        toggleTimerVisibility,
        togglePauseButtonVisibility,
        resetQuizSettings,
        isQuizConfigValid,
        getSelectedSubcategoriesForCategory,
        allSubcategories: selectAllSubcategories,
        selectDifficulty: updateDifficulty,
        selectAmount: updateAmount,
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