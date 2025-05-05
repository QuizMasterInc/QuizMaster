import React, { useCallback, useEffect, useState } from 'react';
import { ScaleLoader } from 'react-spinners';
import { useCategory } from '../../contexts/CategoryContext';
import Question from './Question';
import DoneModal from './DoneModal';
import HelpModal from './HelpModal';
import Timer from './Timer';
import ProgressBar from './ProgressBar';
import BackToTop from './BackToTopButton';
import BackGroundMusic from '../sounds/BackGroundMusic';

// Fisher‑Yates shuffle 
const shuffle = (array) => {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function QuizActivity() {
  const {
    category,
    subcategories,
    difficulty,
    amount,
    duration,
    showTimer,
    showPauseButton,
  } = useCategory();

  const [questions,      setQuestions]      = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [completed,      setCompleted]      = useState(false);
  const [helpActive,     setHelpActive]     = useState(false);
  const [doneActive,     setDoneActive]     = useState(false);
  const [timerFinished,  setTimerFinished]  = useState(false);
  const [answeredCount,  setAnsweredCount]  = useState(0);
  const [correctCount,   setCorrectCount]   = useState(0);

  //  CALLBACKS FROM <Question>
  const recordCorrect = useCallback(
    (isCorrect) => isCorrect && setCorrectCount((c) => c + 1),
    []
  );

  const recordAnswered = useCallback(
    (firstInteraction) => firstInteraction && setAnsweredCount((c) => c + 1),
    []
  );

  //  FETCH & NORMALISE QUIZ DATA 
  useEffect(() => {
    async function fetchQuiz() {
      setLoading(true);
      try {
        const url = `https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabSub?category=${encodeURIComponent(
          category.toLowerCase()
        )}`;
        const res  = await fetch(url);
        const data = await res.json();

        // gather rows for chosen sub‑categories (or all of them)
        let pool = [];
        (subcategories.length ? subcategories : Object.keys(data)).forEach(
          (sub) => data[sub] && (pool = [...pool, ...data[sub]])
        );

        // difficulty filter (if one passed one in)
        if (difficulty && difficulty > 0) {
          pool = pool.filter(
            (q) => Number(q.difficulty) === Number(difficulty)
          );
        }

        // shuffle and cap to requested amount
        pool = shuffle(pool).slice(0, amount);

        // normalise every row so <Question> understands it
        const mapped = pool.map((row) => {
          const raw = (row.type || 'Multiple').replace(/\s+/g, '').toLowerCase();
          let tag;
          if (raw === 'multipleanswer')          tag = 'multiple'; // select‑all
          else if (raw === 'fillintheblank')     tag = 'fill';
          else if (raw === 'draganddrop' || raw === 'drag')
                                                tag = 'drag';
          else                                   tag = 'single';   // Multiple / TrueFalse

          // choices & answers
          const choices =
            tag === 'single' || tag === 'multiple' || tag === 'drag'
              ? shuffle([
                  row.option_1 ?? row.a,
                  row.option_2 ?? row.b,
                  row.option_3 ?? row.c,
                  row.option_4 ?? row.d,
                ]).filter(Boolean)
              : tag === 'single' && raw === 'truefalse'
              ? ['True', 'False']
              : [];

          const correct = row.correct_answer ?? row.correct;

          return {
            questionText  : row.question,
            text          : row.question,
            choices,
            correctAnswer : correct,
            type          : tag,
          };
        });

        setQuestions(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [category, subcategories, difficulty, amount]);

  //  TIMER → auto‑submit
  useEffect(() => {
    if (timerFinished && !completed) handleSubmit();
  }, [timerFinished, completed]);

  //  SUBMIT
  const handleSubmit = () => {
    setCompleted(true);
    setDoneActive(true);
    setTimerFinished(true);
  };

  // RENDER
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ScaleLoader color="#2563eb" />
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
        <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg inline-block pointer-events-auto">
          <ProgressBar
            answeredCount={answeredCount}
            totalQuestions={amount}
          />
        </div>
      </div>

      {showTimer && (
        <Timer
          duration={duration}
          showPause={showPauseButton}
          onFinish={() => setTimerFinished(true)}
        />
      )}

      <div className="flex flex-col items-center mt-24">
        <h1 className="p-10 mb-8 text-4xl text-gray-300 bg-gray-900 rounded-lg shadow-lg">
          Welcome to the {category} Quiz
        </h1>

        <button
          onClick={() => setHelpActive(true)}
          className="mb-8 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-600"
          disabled={completed}
        >
          Help
        </button>

        {helpActive && (
          <HelpModal
            isActive={setHelpActive}
            active={helpActive}
            amount={amount}
            duration={duration}
          />
        )}

        {questions.map((q, i) => (
          <Question
            key={i}
            question={q}
            isCompleted={completed}
            onAnswer={recordCorrect}
            onAnswerChange={recordAnswered}
          />
        ))}

        {!loading && (
          <button
            onClick={handleSubmit}
            className="mt-8 px-6 py-3 bg-green-600 text-white rounded hover:bg-green-500"
            disabled={completed}
          >
            Submit!
          </button>
        )}
      </div>

      {doneActive && (
        <DoneModal
          isActive={setDoneActive}
          active={doneActive}
          amountCorrect={correctCount}
          totalAmount={questions.length}
        />
      )}

      <BackToTop />
      {!completed && <BackGroundMusic />}
    </>
  );
}

export default QuizActivity;