/**
 * useQuizEngine Hook
 * 
 * Handles quiz fetching and question data transformation
 * Used by both QuizActivity and CustomQuizActivity components
 */

import { useEffect, useState } from 'react';
import { shuffle } from '../utils/shuffle';
import { generateChoicesForQuestion } from '../utils/generateChoicesForQuestion';

/**
 * Hook for fetching and managing default quiz questions
 * @param {Object} params - Quiz parameters
 * @param {string} params.category - Quiz category
 * @param {Array} params.subcategories - Selected subcategories
 * @param {number} params.difficulty - Difficulty level (1-5)
 * @param {number} params.amount - Number of questions
 * @returns {Object} Quiz data and loading state
 */
export const useDefaultQuiz = ({ category, subcategories, difficulty, amount }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchQuiz() {
      setLoading(true);
      setError(null);
      
      try {
        const url = `https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabSubV2?category=${encodeURIComponent(
          category.toLowerCase()
        )}`;

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        // Build question pool from subcategories or all available
        let pool = [];
        (subcategories.length ? subcategories : Object.keys(data)).forEach(
          (sub) => {
            if (data[sub]) {
              pool = [...pool, ...data[sub]];
            }
          }
        );

        // Filter by difficulty if specified
        if (difficulty && difficulty > 0) {
          pool = pool.filter((q) => Number(q.difficulty) === Number(difficulty));
        }

        // Shuffle and limit to requested amount
        pool = shuffle(pool).slice(0, amount);

        if (pool.length === 0) {
          console.warn('No questions available! Check if questions exist in database for:', {
            category: category.toLowerCase(),
            subcategories,
            difficulty
          });
        }

        // Transform raw questions to standardized format
        const mapped = pool.map((row) => {
          const raw = (row.type || 'Multiple').replace(/\s+/g, '').toLowerCase();
          let tag;
          if (raw === 'multipleanswer') tag = 'multiple';
          else if (raw === 'fillintheblank') tag = 'fill';
          else if (raw === 'draganddrop' || raw === 'drag') tag = 'drag';
          else tag = 'single';

          const correctAnswer = row.correct_answer ?? row.correct;
          const questionId = row.questionId || `default_${btoa(row.question).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)}`;

          const originalOptions = [
            row.option_1 ?? row.a,
            row.option_2 ?? row.b,
            row.option_3 ?? row.c,
            row.option_4 ?? row.d,
          ].filter(Boolean);
          
          return {
            questionId,
            questionText: row.question,
            text: row.question,
            choices: generateChoicesForQuestion({ ...row, correctAnswer, type: tag, originalOptions }, 4),
            correctAnswer: correctAnswer,
            type: tag,
            originalOptions,
          };
        });

        setQuestions(mapped);
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [category, subcategories, difficulty, amount]);

  return { questions, setQuestions, loading, error };
};

/**
 * Hook for fetching and managing custom quiz questions
 * @param {string} quizID - Custom quiz ID
 * @param {string} password - Optional quiz password
 * @returns {Object} Quiz data, metadata, and loading state
 */
export const useCustomQuiz = (quizID, password) => {
  const [questions, setQuestions] = useState([]);
  const [quizMetadata, setQuizMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCustomQuiz() {
      setLoading(true);
      setError(null);
      
      try {
        const url = `https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabCustomQuiz?quizid=${quizID}${password ? `&password=${password}` : ''}`;
        const res = await fetch(url);
        const data = await res.json();
        const quiz = data.data;

        // Handle both old flat structure and new nested structure
        const questionsData = quiz.content?.questions || quiz.questions || {};
        const metadata = quiz.metadata || {};

        const selected = Object.keys(questionsData).map((questionKey) => {
          const q = questionsData[questionKey];
          const type = q.type || 'Multiple';
          const tag =
            type === 'DragAndDrop'
              ? 'drag'
              : type === 'FillInTheBlank'
              ? 'fill'
              : type === 'MultipleAnswer'
              ? 'multiple'
              : 'single';

          const correctAnswer = q.correct_answer;
          const originalOptions = [
            q.option_1,
            q.option_2,
            q.option_3,
            q.option_4,
          ].filter(Boolean);
          
          return {
            questionId: `custom_${quizID}_${questionKey}`,
            questionText: q.question,
            text: q.question,
            choices: generateChoicesForQuestion({ ...q, correctAnswer, type: tag, originalOptions }, 4),
            correctAnswer: correctAnswer,
            type: tag,
            originalOptions,
          };
        });

        setQuestions(selected);
        
        // Store quiz metadata for result submission
        setQuizMetadata({
          category: metadata.category || quiz.category || 'custom',
          difficulty: metadata.difficulty || quiz.difficulty || 3,
          title: metadata.title || quiz.title || 'Custom Quiz'
        });
      } catch (error) {
        console.error('Failed to fetch custom quiz:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomQuiz();
  }, [quizID, password]);

  return { questions, setQuestions, quizMetadata, loading, error };
};

/**
 * Hook to update question choices when answer count changes
 * @param {Array} questions - Current questions
 * @param {Function} setQuestions - State setter for questions
 * @param {number} answerCount - Number of answer choices to show
 */
export const useQuestionChoices = (questions, setQuestions, answerCount) => {
  useEffect(() => {
    if (questions.length === 0) return;
    
    setQuestions((prevQuestions) =>
      prevQuestions.map((question) => {
        return {
          ...question,
          choices: generateChoicesForQuestion(question, answerCount)
        };
      })
    );
  }, [answerCount]); // Don't include questions/setQuestions to avoid loops
};
