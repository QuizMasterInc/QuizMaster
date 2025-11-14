/**
 * Custom hook for managing question form state
 */

import { useState } from 'react';
import { createEmptyQuestion, DEFAULT_DIFFICULTY, DEFAULT_ANSWERS, validateDifficulty } from '../utils/questionTypes';
import { verifyQuestionInput, buildQuestionArray } from '../utils/questionValidator';

export const useQuestionForm = () => {
  const [currentQuestion, setCurrentQuestion] = useState(createEmptyQuestion());
  const [selectedCorrectAnswers, setSelectedCorrectAnswers] = useState([false, false, false, false]);
  const [droppedOption, setDroppedOption] = useState('');
  const [numAnswers, setNumAnswers] = useState(DEFAULT_ANSWERS);
  const [questionDifficulty, setQuestionDifficulty] = useState(DEFAULT_DIFFICULTY);

  const handleQuestionChange = (value, index) => {
    setCurrentQuestion((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const updateNumAnswers = (newCount) => {
    setNumAnswers(newCount);
    setCurrentQuestion((prev) => {
      const updated = [...prev];
      // Clear options beyond the new count
      for (let i = newCount + 1; i <= 4; i++) {
        updated[i] = '';
      }
      return updated;
    });
  };

  const updateQuestionDifficulty = (value) => {
    const validValue = validateDifficulty(value);
    setQuestionDifficulty(validValue);
    setCurrentQuestion((prev) => {
      const updated = [...prev];
      updated[8] = validValue;
      return updated;
    });
  };

  const resetQuestionForm = () => {
    setCurrentQuestion(createEmptyQuestion());
    setQuestionDifficulty(DEFAULT_DIFFICULTY);
    setSelectedCorrectAnswers([false, false, false, false]);
    setDroppedOption('');
    setNumAnswers(DEFAULT_ANSWERS);
  };

  const validateCurrentQuestion = () => {
    return verifyQuestionInput(currentQuestion, numAnswers, selectedCorrectAnswers);
  };

  const getCurrentQuestionData = () => {
    return buildQuestionArray(currentQuestion, questionDifficulty, selectedCorrectAnswers);
  };

  return {
    // State
    currentQuestion,
    selectedCorrectAnswers,
    droppedOption,
    numAnswers,
    questionDifficulty,

    // Setters
    setCurrentQuestion,
    setSelectedCorrectAnswers,
    setDroppedOption,
    setNumAnswers,

    // Handlers
    handleQuestionChange,
    updateNumAnswers,
    updateQuestionDifficulty,
    resetQuestionForm,
    validateCurrentQuestion,
    getCurrentQuestionData
  };
};
