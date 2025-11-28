// Utility to generate choices for a quiz question
import { shuffle } from './shuffle';

/**
 * Generates the choices array for a question based on answerCount.
 * @param {Object} questionData - Raw question data (from API or DB)
 * @param {number} answerCount - Number of choices to show
 * @returns {Array} choices - Array of choices for the question
 */
export function generateChoicesForQuestion(questionData, answerCount = 4) {
  const { correctAnswer, correct_answer, type, originalOptions } = questionData;
  const correct = correctAnswer ?? correct_answer;
  const correctLower = String(correct).trim().toLowerCase();

  // Always use originalOptions if available, else fallback to option_1..option_4
  let allChoices = Array.isArray(originalOptions) && originalOptions.length > 0
    ? originalOptions
    : [
        questionData.option_1 ?? questionData.a,
        questionData.option_2 ?? questionData.b,
        questionData.option_3 ?? questionData.c,
        questionData.option_4 ?? questionData.d,
      ].filter(Boolean);

  if (type === 'fill' || type === 'drag') return [];

  const correctChoice = allChoices.find(
    (c) => c?.trim().toLowerCase() === correctLower
  );
  const wrongChoices = allChoices.filter(
    (c) => c?.trim().toLowerCase() !== correctLower
  );
  const correctToUse = correctChoice || correct;
  const wrongChoicesNeeded = Math.max(0, answerCount - 1);
  const wrongChoicesToUse = shuffle(wrongChoices).slice(0, wrongChoicesNeeded);
  const finalChoices = shuffle([
    correctToUse,
    ...wrongChoicesToUse
  ]).filter(Boolean);
  return finalChoices;
}
