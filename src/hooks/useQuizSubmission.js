/**
 * useQuizSubmission Hook
 * 
 * Handles quiz result calculation and submission
 */

import { useState } from 'react';
import quizSubmissionService from '../services/quiz/quizSubmissionService';
import quizDraftService from '../services/quiz/quizDraftService';

export const useQuizSubmission = () => {
  const [submittingResults, setSubmittingResults] = useState(false);

  const calculateScoreAndAnswers = (questions) => {
    let score = 0;
    const questionIds = [];
    const userAnswers = {};
    
    questions.forEach((question, index) => {
      const type = question.type?.toLowerCase();
      const isFillBlank = type === 'fill';
      const isMultipleAnswer = type === 'multiple';
      const isDragAndDrop = type === 'drag';
      
      questionIds.push(question.questionId);
      
      const questionElement = document.querySelector(`[data-question-index="${index}"]`);
      if (!questionElement) {
        userAnswers[index] = null;
        return;
      }
      
      let userAnswer = null;
      let isCorrect = false;
      
      if (isFillBlank) {
        const input = questionElement.querySelector('input[type="text"]');
        if (input) {
          userAnswer = input.value.trim();
          const correctAnswer = String(question.correctAnswer).trim().toLowerCase();
          isCorrect = userAnswer.toLowerCase() === correctAnswer;
        }
      } else if (isMultipleAnswer) {
        const checkboxes = questionElement.querySelectorAll('input[type="checkbox"]:checked');
        const selectedTexts = Array.from(checkboxes).map(cb => 
          cb.parentElement.querySelector('span').textContent.trim()
        );
        userAnswer = selectedTexts;
        
        const correctAnswers = String(question.correctAnswer)
          .split('||')
          .map(a => a.trim().toLowerCase());
        
        isCorrect = selectedTexts.length === correctAnswers.length &&
                   selectedTexts.every(ans => correctAnswers.includes(ans.toLowerCase()));
      } else if (isDragAndDrop) {
        const dropZone = questionElement.querySelector('.border-dashed');
        if (dropZone && dropZone.textContent && dropZone.textContent !== 'Drop your answer here') {
          userAnswer = dropZone.textContent.trim();
          const correctAnswer = String(question.correctAnswer).trim().toLowerCase();
          isCorrect = userAnswer.toLowerCase() === correctAnswer;
        }
      } else {
        const selectedButton = questionElement.querySelector('button.bg-accent, button[class*="bg-accent"]');
        if (selectedButton) {
          userAnswer = selectedButton.querySelector('span').textContent.trim();
          const correctAnswer = String(question.correctAnswer).trim().toLowerCase();
          isCorrect = userAnswer.toLowerCase() === correctAnswer;
        }
      }
      
      userAnswers[index] = userAnswer;
      
      if (isCorrect) {
        score++;
      }
    });
    
    return { score, questionIds, userAnswers };
  };

  const submitQuiz = async ({
    currentUser,
    questions,
    setUserAnswers,
    setCompleted,
    refreshResults,
    quizStartTime,
    quizData
  }) => {
    if (submittingResults || !currentUser) return;
    
    setSubmittingResults(true);
    
    try {
      const { score: calculatedScore, questionIds, userAnswers } = calculateScoreAndAnswers(questions);
      
      setUserAnswers(userAnswers);
      
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