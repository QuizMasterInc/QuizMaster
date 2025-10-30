/**
 * Quiz Context using the quizService
 */
import { createContext, useContext, useReducer, useCallback } from 'react';
import quizRetrievalService from '../services/quiz/quizRetrievalService';
import quizSubmissionService from '../services/quiz/quizSubmissionService';
import analyticsService from '../services/analytics/analyticsService';

// Create context
const QuizContext = createContext(null);

// Quiz reducer for state management
const quizReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        
        case 'SET_QUIZZES':
            return { 
                ...state, 
                quizzes: action.payload.quizzes,
                hasMore: action.payload.hasMore,
                lastDoc: action.payload.lastDoc,
                loading: false,
                error: null 
            };
        
        case 'APPEND_QUIZZES':
            return {
                ...state,
                quizzes: [...state.quizzes, ...action.payload.quizzes],
                hasMore: action.payload.hasMore,
                lastDoc: action.payload.lastDoc,
                loading: false
            };
        
        case 'SET_CURRENT_QUIZ':
            return { ...state, currentQuiz: action.payload, loading: false, error: null };
        
        case 'CLEAR_CURRENT_QUIZ':
            return { ...state, currentQuiz: null };
        
        case 'UPDATE_QUIZ':
            return {
                ...state,
                quizzes: state.quizzes.map(quiz => 
                quiz.id === action.payload.id ? action.payload : quiz
                ),
                currentQuiz: state.currentQuiz?.id === action.payload.id ? action.payload : state.currentQuiz
            };
        
        case 'REMOVE_QUIZ':
            return {
                ...state,
                quizzes: state.quizzes.filter(quiz => quiz.id !== action.payload),
                currentQuiz: state.currentQuiz?.id === action.payload ? null : state.currentQuiz
            };
        
        default:
            return state;
    }
};

// Initial state
const initialState = {
    quizzes: [],
    currentQuiz: null,
    loading: false,
    error: null,
    hasMore: false,
    lastDoc: null
};

/**
 * Quiz provider component
 */
export const QuizProvider = ({ children }) => {
    const [state, dispatch] = useReducer(quizReducer, initialState);

    /**
     * Load quizzes with filtering and pagination
     */
    const loadQuizzes = useCallback(async (options = {}, append = false) => {
        // Clear any existing errors
        dispatch({ type: 'CLEAR_ERROR' });
        dispatch({ type: 'SET_LOADING', payload: true });
        
        try {
            const result = await quizRetrievalService.getQuizzes({
                ...options,
                startAfterDoc: append ? state.lastDoc : null
            });
            
            // Ensure result has expected structure
            const normalizedResult = {
                quizzes: Array.isArray(result?.quizzes) ? result.quizzes : [],
                hasMore: Boolean(result?.hasMore),
                lastDoc: result?.lastDoc || null
            };
            
            dispatch({ 
                type: append ? 'APPEND_QUIZZES' : 'SET_QUIZZES', 
                payload: normalizedResult 
            });
            
            return normalizedResult;
        
        } catch (error) {
            const errorMessage = error.message || 'Failed to load quizzes';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            
            // Return empty result on error to prevent crashes
            const emptyResult = { quizzes: [], hasMore: false, lastDoc: null };
            dispatch({ 
                type: append ? 'APPEND_QUIZZES' : 'SET_QUIZZES', 
                payload: emptyResult 
            });
            
            return emptyResult;
        }
    }, [state.lastDoc]);

    /**
     * Load more quizzes (pagination)
     */
    const loadMoreQuizzes = useCallback(async (options = {}) => {
        if (!state.hasMore || state.loading) return;
        
        return await loadQuizzes(options, true);
    }, [loadQuizzes, state.hasMore, state.loading]);

    /**
     * Get quiz by ID
     */
    const getQuizById = useCallback(async (quizId) => {
        // Clear any existing errors
        dispatch({ type: 'CLEAR_ERROR' });
        dispatch({ type: 'SET_LOADING', payload: true });
        
        try {
            const quiz = await quizRetrievalService.getQuizById(quizId);
            dispatch({ type: 'SET_CURRENT_QUIZ', payload: quiz });
            return quiz;
        
        } catch (error) {
            const errorMessage = error.message || 'Failed to load quiz';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            
            // Don't throw for "quiz not found" errors to prevent uncaught promise rejections
            if (error.code === 'quiz-not-found') {
                console.warn('Quiz not found:', quizId);
                return null;
            }
            
            throw error;
        }
    }, []);

    // Context value
    const value = {
        ...state,
        loadQuizzes,
        getQuizById,
        quiz: state.currentQuiz,
        getQuiz: getQuizById
    };

    return (
        <QuizContext.Provider value={value}>
            {children}
        </QuizContext.Provider>
    );
};

/**
 * Hook for using quiz context
 */
export const useQuiz = () => {
    const context = useContext(QuizContext);
    if (!context) {
        throw new Error('useQuiz must be used within a QuizProvider');
    }
    return context;
};

export default QuizContext;