import { useEffect, useState, useCallback } from 'react';
import { shuffle } from '../utils/shuffle';
import { generateChoicesForQuestion } from '../utils/generateChoicesForQuestion';
import { useAuth } from '../contexts/AuthContext';

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

        let pool = [];
        (subcategories.length ? subcategories : Object.keys(data)).forEach(
          (sub) => {
            if (data[sub]) {
              pool = [...pool, ...data[sub]];
            }
          }
        );

        if (difficulty && difficulty > 0) {
          pool = pool.filter((q) => Number(q.difficulty) === Number(difficulty));
        }

        pool = shuffle(pool).slice(0, amount);

        if (pool.length === 0) {
          console.warn('No questions available! Check if questions exist in database for:', {
            category: category.toLowerCase(),
            subcategories,
            difficulty
          });
        }

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

export const useCustomQuiz = (quizID, password) => {
  const [questions, setQuestions] = useState([]);
  const [quizMetadata, setQuizMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const { currentUser } = useAuth();

  const fetchCustomQuiz = useCallback(async (quizPassword) => {
    setLoading(true);
    setError(null);
    setNeedsPassword(false);

    try {
      let url = `https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabCustomQuiz?quizid=${quizID}`;
      if (quizPassword) {
        url += `&password=${encodeURIComponent(quizPassword)}`;
      }

      const headers = {};
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          headers['Authorization'] = `Bearer ${token}`;
        } catch (tokenErr) {
          console.warn('Failed to get auth token:', tokenErr.message);
        }
      }

      const res = await fetch(url, { headers });

      if (res.status === 401) {
        const errorData = await res.json().catch(() => ({}));
        if (errorData.requiresPassword) {
          setNeedsPassword(true);
          setLoading(false);
          return;
        }
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (!data.result) {
        throw new Error(data.message || 'Failed to load quiz');
      }

      const quiz = data.data;
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
      setNeedsPassword(false);

      setQuizMetadata({
        category: metadata.category || quiz.category || 'custom',
        difficulty: metadata.difficulty || quiz.difficulty || 3,
        title: metadata.title || quiz.title || 'Custom Quiz',
        name: metadata.title || quiz.title || 'Custom Quiz'
      });
    } catch (error) {
      console.error('Failed to fetch custom quiz:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [quizID, currentUser]);

  useEffect(() => {
    fetchCustomQuiz(password || null);
  }, [quizID, password, fetchCustomQuiz]);

  const retryWithPassword = useCallback((enteredPassword) => {
    fetchCustomQuiz(enteredPassword);
  }, [fetchCustomQuiz]);

  return {
    questions,
    setQuestions,
    quizMetadata,
    loading,
    error,
    needsPassword,
    retryWithPassword
  };
};

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
  }, [answerCount]);
};