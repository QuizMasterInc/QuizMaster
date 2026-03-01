/**
 * useQuizState Hook
 * 
 * Manages quiz state including progress tracking, user answers, and completion status
 * Auto-saves progress to Firebase on every answer
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import quizDraftService from '../services/quiz/quizDraftService';

export const useQuizState = (quizConfig = {}) => {
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const [quizStartTime] = useState(Date.now());
  
  const configRef = useRef(quizConfig);
  const isSubmittingRef = useRef(false);
  
  useEffect(() => {
    configRef.current = quizConfig;
  }, [quizConfig]);

  // Auto-save draft whenever userAnswers changes
  useEffect(() => {
    const config = configRef.current;

    if (!config.userId || Object.keys(userAnswers).length === 0 || completed || isSubmittingRef.current) {
      return;
    }

    const saveTimer = setTimeout(() => {
      if (isSubmittingRef.current) return;
      
      quizDraftService.saveDraft({
        userId: config.userId,
        quizId: config.quizId,
        quizType: config.quizType,
        quizTitle: config.quizTitle,
        category: config.category,
        difficulty: config.difficulty,
        amount: config.amount,
        questionIds: config.questions?.map(q => q.questionId) || [],
        questions: config.questions || [],
        userAnswers,
        answeredCount,
        quizStartTime
      }).catch(err => console.error('Auto-save failed:', err));
    }, 500);

    return () => clearTimeout(saveTimer);
  }, [userAnswers, answeredCount, completed, quizStartTime]);

  const recordAnswered = useCallback(
    (firstInteraction) => firstInteraction && setAnsweredCount((c) => c + 1),
    []
  );

  const recordCorrect = useCallback(
    (isCorrect) => isCorrect && setCorrectCount((c) => c + 1),
    []
  );

  const resetQuizState = useCallback(() => {
    setAnsweredCount(0);
    setCorrectCount(0);
    setUserAnswers({});
    setCompleted(false);
    isSubmittingRef.current = false;
  }, []);

  const startSubmission = useCallback(() => {
    isSubmittingRef.current = true;
  }, []);

  return {
    answeredCount,
    correctCount,
    userAnswers,
    completed,
    quizStartTime,
    recordAnswered,
    recordCorrect,
    setUserAnswers,
    setAnsweredCount,
    setCompleted,
    resetQuizState,
    startSubmission,
  };
};