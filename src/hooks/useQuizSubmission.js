/**
 * useQuizSubmission Hook
 * 
 * Handles quiz result calculation and submission
 * Shared logic between QuizActivity and CustomQuizActivity
 */

import { useState } from 'react';
import quizSubmissionService from '../services/quiz/quizSubmissionService';

export const useQuizSubmission = () => {
  const [submittingResults, setSubmittingResults] = useState(false);

  /**
   * Calculate score and collect user answers from DOM
   * This function extracts answers from the rendered Question components
   * 
   * @param {Array} questions - Array of question objects
   * @returns {Object} { score, questionIds, userAnswers }
   */
  const calculateScoreAndAnswers = (questions) => {
    let score = 0;
    const questionIds = [];
    const userAnswers = {};
    
    questions.forEach((question, index) => {
      const type = question.type?.toLowerCase();
      const isFillBlank = type === 'fill';
      const isMultipleAnswer = type === 'multiple';
      const isDragAndDrop = type === 'drag';
      
      // Store question ID
      questionIds.push(question.questionId);
      
      // Get the current answer from the DOM element
      const questionElement = document.querySelector(`[data-question-index="${index}"]`);
      if (!questionElement) {
        userAnswers[index] = null;
        return;
      }
      
      let userAnswer = null;
      let isCorrect = false;
      
      if (isFillBlank) {
        // Fill in the blank questions
        const input = questionElement.querySelector('input[type="text"]');
        if (input) {
          userAnswer = input.value.trim();
          const correctAnswer = String(question.correctAnswer).trim().toLowerCase();
          isCorrect = userAnswer.toLowerCase() === correctAnswer;
        }
      } else if (isMultipleAnswer) {
        // Multiple answer questions (checkboxes)
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
        // Drag and drop questions
        const dropZone = questionElement.querySelector('.border-dashed');
        if (dropZone && dropZone.textContent && dropZone.textContent !== 'Drop your answer here') {
          userAnswer = dropZone.textContent.trim();
          const correctAnswer = String(question.correctAnswer).trim().toLowerCase();
          isCorrect = userAnswer.toLowerCase() === correctAnswer;
        }
      } else {
        // Regular multiple choice (single answer)
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

  /**
   * Submit quiz results to the backend
   * 
   * @param {Object} params - Submission parameters
   * @param {Object} params.currentUser - Current authenticated user
   * @param {Array} params.questions - Quiz questions
   * @param {Function} params.setUserAnswers - State setter for user answers
   * @param {Function} params.setCompleted - State setter for completion status
   * @param {Function} params.refreshResults - Function to refresh results in context
   * @param {number} params.quizStartTime - Quiz start timestamp
   * @param {Object} params.quizData - Additional quiz data (category, difficulty, quizId, etc.)
   * @returns {Promise<Object>} Submission result
   */
  const submitQuiz = async ({
    currentUser,
    questions,
    setUserAnswers,
    setCompleted,
    refreshResults,
    quizStartTime,
    quizData // { category, difficulty, quizType, quizId, amount }
  }) => {
    if (submittingResults || !currentUser) return;
    
    setSubmittingResults(true);
    
    try {
      // Calculate score and collect answers
      const { score: calculatedScore, questionIds, userAnswers } = calculateScoreAndAnswers(questions);
      
      // Store user answers for modal/results display
      setUserAnswers(userAnswers);
      
      // Calculate time spent in seconds
      const timeSpent = Math.round((Date.now() - quizStartTime) / 1000);
      
      // Submit quiz results to backend
      await quizSubmissionService.submitQuizResults({
        userId: currentUser.uid,
        category: quizData.category,
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
      
      // Refresh dashboard cache
      await refreshResults();
      
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
    calculateScoreAndAnswers // Export for advanced use cases
  };
};
