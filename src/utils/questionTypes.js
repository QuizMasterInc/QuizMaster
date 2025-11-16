/**
 * Question type constants and configurations
 */

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'Multiple',
  TRUE_FALSE: 'TrueFalse',
  FILL_IN_BLANK: 'FillInTheBlank',
  MULTIPLE_ANSWER: 'MultipleAnswer',
  DRAG_AND_DROP: 'DragAndDrop'
};

export const DIFFICULTY_LEVELS = {
  1: 'Very Easy',
  2: 'Easy',
  3: 'Medium',
  4: 'Hard',
  5: 'Very Hard'
};

export const DEFAULT_DIFFICULTY = 3;
export const MIN_ANSWERS = 2;
export const MAX_ANSWERS = 4;
export const DEFAULT_ANSWERS = 4;

/**
 * Get difficulty label by level number
 * @param {number} level - Difficulty level (1-5)
 * @returns {string} Difficulty label
 */
export const getDifficultyLabel = (level) => {
  return DIFFICULTY_LEVELS[level] || 'Medium';
};

/**
 * Validate difficulty level
 * @param {number} value - Difficulty value to validate
 * @returns {number} Valid difficulty level (1-5)
 */
export const validateDifficulty = (value) => {
  return !isNaN(value) && value >= 1 && value <= 5 ? value : DEFAULT_DIFFICULTY;
};

/**
 * Get question type display name
 * @param {string} type - Question type constant
 * @returns {string} Display name
 */
export const getQuestionTypeLabel = (type) => {
  const labels = {
    [QUESTION_TYPES.MULTIPLE_CHOICE]: 'Multiple Choice',
    [QUESTION_TYPES.TRUE_FALSE]: 'True/False',
    [QUESTION_TYPES.FILL_IN_BLANK]: 'Fill in the Blank',
    [QUESTION_TYPES.MULTIPLE_ANSWER]: 'Multiple Answer',
    [QUESTION_TYPES.DRAG_AND_DROP]: 'Drag and Drop'
  };
  return labels[type] || type;
};

/**
 * Create empty question array based on type
 * @param {string} type - Question type
 * @param {number} difficulty - Difficulty level
 * @returns {Array} Empty question array
 */
export const createEmptyQuestion = (type = QUESTION_TYPES.MULTIPLE_CHOICE, difficulty = DEFAULT_DIFFICULTY) => {
  return ['', '', '', '', '', '', type, '', difficulty];
};
