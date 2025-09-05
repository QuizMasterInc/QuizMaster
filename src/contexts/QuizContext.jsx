/**
 * Quiz Context using the quizService
 */
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import quizService from '../services/quizService';

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
        dispatch({ type: 'SET_LOADING', payload: true });
        
        try {
            const result = await quizService.getQuizzes({
                ...options,
                startAfterDoc: append ? state.lastDoc : null
            });
            
            dispatch({ 
                type: append ? 'APPEND_QUIZZES' : 'SET_QUIZZES', 
                payload: result 
            });
            
            return result;
        
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
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
        dispatch({ type: 'SET_LOADING', payload: true });
        
        try {
            const quiz = await quizService.getQuizById(quizId);
            dispatch({ type: 'SET_CURRENT_QUIZ', payload: quiz });
            return quiz;
        
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        }
    }, []);

    /**
     * Create a new quiz
     */
    const createQuiz = useCallback(async (quizData) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        try {
        const newQuiz = await quizService.createQuiz(quizData);
        
        // Add to the beginning of the quizzes array
        dispatch({
            type: 'SET_QUIZZES',
            payload: {
            quizzes: [newQuiz, ...state.quizzes],
            hasMore: state.hasMore,
            lastDoc: state.lastDoc
            }
        });
        
        return newQuiz;
        
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        }
    }, [state.quizzes, state.hasMore, state.lastDoc]);

    /**
     * Update an existing quiz
     */
    const updateQuiz = useCallback(async (quizId, updates) => {
        try {
            const updatedQuiz = await quizService.updateQuiz(quizId, updates);
            dispatch({ type: 'UPDATE_QUIZ', payload: updatedQuiz });
            return updatedQuiz;
        
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        }
    }, []);

    /**
     * Delete a quiz
     */
    const deleteQuiz = useCallback(async (quizId) => {
        try {
            await quizService.deleteQuiz(quizId);
            dispatch({ type: 'REMOVE_QUIZ', payload: quizId });
        
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        }
    }, []);

    /**
     * Submit quiz attempt
     */
    const submitQuizAttempt = useCallback(async (quizId, attemptData) => {
        try {
            const result = await quizService.submitQuizAttempt(quizId, attemptData);
            return result;
        
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        }
    }, []);

    /**
     * Get quiz statistics
     */
    const getQuizStatistics = useCallback(async (quizId) => {
        try {
            const stats = await quizService.getQuizStatistics(quizId);
            return stats;
        
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        }
    }, []);

    /**
     * Duplicate a quiz
     */
    const duplicateQuiz = useCallback(async (quizId, overrides = {}) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        try {
            const duplicatedQuiz = await quizService.duplicateQuiz(quizId, overrides);
        
            // Add to the beginning of the quizzes array
            dispatch({
                type: 'SET_QUIZZES',
                payload: {
                quizzes: [duplicatedQuiz, ...state.quizzes],
                hasMore: state.hasMore,
                lastDoc: state.lastDoc
                }
            });
        
            return duplicatedQuiz;
        
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        }
    }, [state.quizzes, state.hasMore, state.lastDoc]);

    // Context value
    const value = {
        ...state,
        loadQuizzes,
        loadMoreQuizzes,
        getQuizById,
        createQuiz,
        updateQuiz,
        deleteQuiz,
        submitQuizAttempt,
        getQuizStatistics,
        duplicateQuiz,
        clearError: () => dispatch({ type: 'CLEAR_ERROR' }),
        clearCurrentQuiz: () => dispatch({ type: 'CLEAR_CURRENT_QUIZ' }),
        quiz: state.currentQuiz,
        getQuiz: getQuizById,
        updateQuizDB: updateQuiz
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