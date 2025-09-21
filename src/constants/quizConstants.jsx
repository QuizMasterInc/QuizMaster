/**
 * Quiz application constants
 * 
 * This file contains all static data used throughout the quiz application:
 * - Quiz categories and subcategories
 * - Category icons (JSX components)
 * - Route destinations for each category
 * 
 * Note: Order matters! Icons and destinations arrays must match the order of quizCategories.
 */

import React from 'react';
import { 
  Book, 
  World, 
  FlaskVial, 
  Basketball, 
  Ticket, 
  Calculator 
} from '../components/icons/index.jsx';

/**
 * Main quiz categories
 * Order is important - must match icons and destinations arrays
 */
export const QUIZ_CATEGORIES = [
    'Geography',
    'Science',
    'Sports',
    'Entertainment',
    'Mathematics',
    'History'
];

/**
 * Quiz subcategories for each main category
 * Keys should be lowercase versions of QUIZ_CATEGORIES
 */
export const QUIZ_SUBCATEGORIES = {
    'geography': ['world', 'americas'],
    'science': ['biology', 'chemistry', 'astronomy', 'physics'],
    'sports': ['soccer', 'basketball', 'football'],
    'entertainment': ['tv', 'music', 'movies', 'video games'],
    'mathematics': ['algebra', 'geometry', 'calculus'],
    'history': ['global', 'america', 'norse mythology'],
};

/**
 * Icons for each quiz category
 * Order must match QUIZ_CATEGORIES array
 */
export const CATEGORY_ICONS = [
    <World className="w-10 h-10 -sm:w-8 -sm:h-8" />,
    <FlaskVial className="w-10 h-10 -sm:w-8 -sm:h-8" />,
    <Basketball className="w-10 h-10 -sm:w-8 -sm:h-8" />,
    <Ticket className="w-10 h-10 -sm:w-8 -sm:h-8" />,
    <Calculator className="w-10 h-10 -sm:w-8 -sm:h-8" />,
    <Book className="w-10 h-10 -sm:w-8 -sm:h-8" />
];

/**
 * Route destinations for each category
 * Order must match QUIZ_CATEGORIES array
 */
export const CATEGORY_DESTINATIONS = [
    'geography',
    'science',
    'sports',
    'entertainment',
    'mathematics',
    'history'
];

/**
 * Default quiz settings
 */
export const DEFAULT_QUIZ_SETTINGS = {
    amount: '10',
    duration: 5,
    showTimer: true,
    showPauseButton: true,
    difficulty: ''
};

/**
 * SessionStorage keys used throughout the app
 */
export const STORAGE_KEYS = {
    CATEGORY: 'quizmaster_category',
    SUBCATEGORIES: 'quizmaster_subcategories',
    DIFFICULTY: 'quizmaster_difficulty',
    AMOUNT: 'quizmaster_amount',
    DURATION: 'quizmaster_duration',
    SHOW_TIMER: 'quizmaster_showTimer',
    SHOW_PAUSE_BUTTON: 'quizmaster_showPauseButton'
};

/**
 * Legacy SessionStorage keys for migration
 * Used to migrate from old CategoryContext to new AppContext
 */
export const LEGACY_STORAGE_KEYS = {
    CATEGORY: 'category',
    SUBCATEGORIES: 'subcategories',
    DIFFICULTY: 'difficulty',
    AMOUNT: 'amount',
    DURATION: 'duration'
};

/**
 * Helper function to get icon by category name
 * @param {string} categoryName - Name of the category
 * @returns {JSX.Element} - The corresponding icon component
 */
export const getIconByCategory = (categoryName) => {
    const index = QUIZ_CATEGORIES.findIndex(
        cat => cat.toLowerCase() === categoryName.toLowerCase()
    );
    return index !== -1 ? CATEGORY_ICONS[index] : null;
};

/**
 * Helper function to get destination by category name
 * @param {string} categoryName - Name of the category
 * @returns {string} - The corresponding route destination
 */
export const getDestinationByCategory = (categoryName) => {
    const index = QUIZ_CATEGORIES.findIndex(
        cat => cat.toLowerCase() === categoryName.toLowerCase()
    );
    return index !== -1 ? CATEGORY_DESTINATIONS[index] : null;
};

/**
 * Helper function to get subcategories by category name
 * @param {string} categoryName - Name of the category
 * @returns {string[]} - Array of subcategories for the category
 */
export const getSubcategoriesByCategory = (categoryName) => {
    return QUIZ_SUBCATEGORIES[categoryName.toLowerCase()] || [];
};
