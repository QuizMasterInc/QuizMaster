/**
 * Question validation utilities
 */

import { QUESTION_TYPES } from './questionTypes';

/**
 * Verify if question inputs are complete based on question type
 * @param {Array} question - Question array [question, opt1, opt2, opt3, opt4, answer, type, explanation, difficulty]
 * @param {number} numAnswers - Number of answer options (2-4)
 * @param {Array<boolean>} selectedCorrectAnswers - For multiple answer questions
 * @returns {boolean} True if question is valid
 */
export const verifyQuestionInput = (question, numAnswers = 4, selectedCorrectAnswers = []) => {
  const type = question[6];
  const optionsFilled = [1, 2, 3, 4].slice(0, numAnswers).every((idx) => question[idx].trim() !== '');

  switch (type) {
    case QUESTION_TYPES.TRUE_FALSE:
      return question[0].trim() !== '' && question[5] !== '';

    case QUESTION_TYPES.FILL_IN_BLANK:
      return question[0].trim() !== '' && question[1].trim() !== '';

    case QUESTION_TYPES.MULTIPLE_ANSWER:
      return question[0].trim() !== '' && optionsFilled && selectedCorrectAnswers.some(Boolean);

    case QUESTION_TYPES.DRAG_AND_DROP:
      return question[0].includes('[blank]') && optionsFilled && question[5].trim() !== '';

    case QUESTION_TYPES.MULTIPLE_CHOICE:
    default:
      return question[0].trim() !== '' && optionsFilled && question[5].trim() !== '';
  }
};

/**
 * Build final question array based on type
 * @param {Array} currentQuestion - Current question state
 * @param {number} questionDifficulty - Difficulty level
 * @param {Array<boolean>} selectedCorrectAnswers - For multiple answer questions
 * @returns {Array} Formatted question array
 */
export const buildQuestionArray = (currentQuestion, questionDifficulty, selectedCorrectAnswers = []) => {
  const type = currentQuestion[6];
  const difficulty = currentQuestion[8] || questionDifficulty || 3;

  switch (type) {
    case QUESTION_TYPES.TRUE_FALSE:
      return [
        currentQuestion[0],  // question text
        'True',              // option_1
        'False',             // option_2
        '',                  // option_3
        '',                  // option_4
        currentQuestion[5],  // correct_answer
        'TrueFalse',         // type
        '',                  // explanation
        difficulty           // difficulty
      ];

    case QUESTION_TYPES.FILL_IN_BLANK:
      return [
        currentQuestion[0],  // question text
        currentQuestion[1],  // correct answer (option_1)
        '',                  // option_2
        '',                  // option_3
        '',                  // option_4
        currentQuestion[1],  // correct_answer (same as option_1)
        'FillInTheBlank',    // type
        '',                  // explanation
        difficulty           // difficulty
      ];

    case QUESTION_TYPES.MULTIPLE_ANSWER:
      const options = currentQuestion.slice(1, 5);
      const correctAnswers = selectedCorrectAnswers
        .map((selected, idx) => (selected ? options[idx] : null))
        .filter(Boolean);
      return [
        currentQuestion[0],                // question text
        ...options,                        // options 1-4
        correctAnswers.join('||'),         // correct_answer
        'MultipleAnswer',                  // type
        '',                                // explanation
        difficulty                         // difficulty
      ];

    case QUESTION_TYPES.DRAG_AND_DROP:
      return [
        currentQuestion[0],                // question text
        ...currentQuestion.slice(1, 5),    // options 1-4
        currentQuestion[5],                // correct_answer
        'DragAndDrop',                     // type
        '',                                // explanation
        difficulty                         // difficulty
      ];

    case QUESTION_TYPES.MULTIPLE_CHOICE:
    default:
      return [
        currentQuestion[0],                // question text
        currentQuestion[1],                // option_1
        currentQuestion[2],                // option_2
        currentQuestion[3],                // option_3
        currentQuestion[4],                // option_4
        currentQuestion[5],                // correct_answer
        currentQuestion[6],                // type
        '',                                // explanation
        difficulty                         // difficulty
      ];
  }
};

/**
 * Validate CSV question row
 * @param {Array} values - CSV row values
 * @returns {boolean} True if valid
 */
export const validateCSVQuestion = (values) => {
  return values.length >= 6 && values[0].trim() !== '';
};
