/**
 * useQuizState Hook
 * 
 * Manages quiz state including progress tracking, user answers, and completion status
 * Used by both QuizActivity and CustomQuizActivity components
 */

import { useState, useCallback } from 'react';

export const useQuizState = () => {
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const [quizStartTime] = useState(Date.now());

  /**
   * Record when a question is answered (first interaction only)
   */
  const recordAnswered = useCallback(
    (firstInteraction) => firstInteraction && setAnsweredCount((c) => c + 1),
    []
  );

  /**
   * Record when an answer is correct
   */
  const recordCorrect = useCallback(
    (isCorrect) => isCorrect && setCorrectCount((c) => c + 1),
    []
  );

  /**
   * Reset all quiz state
   */
  const resetQuizState = useCallback(() => {
    setAnsweredCount(0);
    setCorrectCount(0);
    setUserAnswers({});
    setCompleted(false);
  }, []);

  return {
    // State
    answeredCount,
    correctCount,
    userAnswers,
    completed,
    quizStartTime,
    
    // Actions
    recordAnswered,
    recordCorrect,
    setUserAnswers,
    setCompleted,
    resetQuizState,
  };
};
