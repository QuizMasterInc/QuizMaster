/**
 * useQuizSubmission Hook
 * 
 * Handles quiz result calculation and submission.
 * Grades from userAnswers (questionId-keyed) instead of reading the DOM.
 */

import { useState } from 'react';
import quizSubmissionService from '../services/quiz/quizSubmissionService';
import quizDraftService from '../services/quiz/quizDraftService';

export const useQuizSubmission = () => {
  const [submittingResults, setSubmittingResults] = useState(false);

  /**
   * Score the quiz using userAnswers (keyed by questionId).
   * Returns the score, the list of question IDs in the order they were taken,
   * and the userAnswers map exactly as passed in (already in the right shape).
   */
  const calculateScoreAndAnswers = (questions, userAnswers) => {
    let score = 0;
    const questionIds = [];

    questions.forEach((question) => {
      const qid = question.questionId;
      questionIds.push(qid);

      const userAnswer = userAnswers?.[qid];
      if (userAnswer === null || userAnswer === undefined) return;

      const type = question.type?.toLowerCase();
      const isFillBlank = type === 'fill';
      const isMultipleAnswer = type === 'multiple';
      const isDragAndDrop = type === 'drag';

      let isCorrect = false;

      if (isMultipleAnswer) {
        const correctAnswers = String(question.correctAnswer)
          .split('||')
          .map((a) => a.trim().toLowerCase());

        const userArr = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        const userLower = userArr.map((a) => String(a).trim().toLowerCase());

        isCorrect =
          userLower.length === correctAnswers.length &&
          userLower.every((ans) => correctAnswers.includes(ans));
      } else {
        // single, fill, drag — all single-value comparisons
        const userVal = String(userAnswer).trim().toLowerCase();
        const correctVal = String(question.correctAnswer).trim().toLowerCase();
        isCorrect = userVal === correctVal;
      }

      if (isCorrect) score++;
    });

    return { score, questionIds, userAnswers: userAnswers || {} };
  };

  const submitQuiz = async ({
    currentUser,
    questions,
    userAnswers,
    setCompleted,
    refreshResults,
    quizStartTime,
    quizData
  }) => {
    if (submittingResults || !currentUser) return;

    setSubmittingResults(true);

    try {
      const { score: calculatedScore, questionIds } = calculateScoreAndAnswers(
        questions,
        userAnswers
      );

      const timeSpent = Math.round((Date.now() - quizStartTime) / 1000);

      await quizSubmissionService.submitQuizResults({
        userId: currentUser.uid,
        category: quizData.category,
        quizTitle: quizData.quizTitle,
        score: calculatedScore,
        totalQuestions: questions.length,
        amount: quizData.amount || questions.length,
        timeSpent,
        difficulty: quizData.difficulty || 3,
        quizType: quizData.quizType || 'default',
        quizId: quizData.quizId,
        questionIds,
        userAnswers,
        sessionId: quizData.sessionId || `quiz_${Date.now()}`
      });

      await refreshResults();

      await quizDraftService.removeDraft({
        userId: currentUser.uid,
        quizId: quizData.quizId,
        category: quizData.category,
        difficulty: quizData.difficulty,
        amount: quizData.amount
      });

      return { success: true, score: calculatedScore, userAnswers };
    } catch (error) {
      console.error('Error submitting quiz results:', error);
      return { success: false, error };
    } finally {
      setSubmittingResults(false);
      setCompleted(true);
    }
  };

  return {
    submittingResults,
    submitQuiz,
    calculateScoreAndAnswers
  };
};