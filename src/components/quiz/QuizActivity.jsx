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

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [helpActive, setHelpActive] = useState(false);
  const [doneActive, setDoneActive] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizId, setQuizId] = useState(null);
  const [answerCount, setAnswerCount] = useState(4); // ✅ default max

  const recordCorrect = useCallback(
    (isCorrect) => isCorrect && setCorrectCount((c) => c + 1),
    []
  );

  const recordAnswered = useCallback(
    (firstInteraction) => firstInteraction && setAnsweredCount((c) => c + 1),
    []
  );

  useEffect(() => {
    async function fetchQuiz() {
      setLoading(true);
      try {
        const url = `https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabSub?category=${encodeURIComponent(
          category.toLowerCase()
        )}`;
        const res = await fetch(url);
        const data = await res.json();

        let pool = [];
        (subcategories.length ? subcategories : Object.keys(data)).forEach(
          (sub) => data[sub] && (pool = [...pool, ...data[sub]])
        );

        if (difficulty && difficulty > 0) {
          pool = pool.filter((q) => Number(q.difficulty) === Number(difficulty));
        }

        pool = shuffle(pool).slice(0, amount);

        const mapped = pool.map((row) => {
          const raw = (row.type || 'Multiple').replace(/\s+/g, '').toLowerCase();
          let tag;
          if (raw === 'multipleanswer') tag = 'multiple';
          else if (raw === 'fillintheblank') tag = 'fill';
          else if (raw === 'draganddrop' || raw === 'drag') tag = 'drag';
          else tag = 'single';

          const correctAnswer = row.correct_answer ?? row.correct;
          const correctLower = String(correctAnswer).trim().toLowerCase();

          const allChoices = [
            row.option_1 ?? row.a,
            row.option_2 ?? row.b,
            row.option_3 ?? row.c,
            row.option_4 ?? row.d,
          ].filter(Boolean);

          const correctChoice = allChoices.find(
            (c) => c?.trim().toLowerCase() === correctLower
          );

          const wrongChoices = allChoices.filter(
            (c) => c?.trim().toLowerCase() !== correctLower
          );

          const finalChoices = shuffle([
            correctChoice,
            ...shuffle(wrongChoices).slice(0, Math.max(0, answerCount - 1)),
          ]);

          return {
            questionText: row.question,
            text: row.question,
            choices: finalChoices,
            correctAnswer: correctAnswer,
            type: tag,
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
  }, [category, subcategories, difficulty, amount, answerCount]); // re-map if answerCount changes

  useEffect(() => {
    if (timerFinished && !completed) handleSubmit();
  }, [timerFinished, completed]);

  const handleSubmit = () => {
    setCompleted(true);
    setDoneActive(true);
    setTimerFinished(true);
  };

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
          <ProgressBar answeredCount={answeredCount} totalQuestions={amount} />
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
        <h1 className="p-10 mb-4 text-4xl text-gray-300 bg-gray-900 rounded-lg shadow-lg">
          Welcome to the {category} Quiz
        </h1>

        <div className="mb-6 text-white">
          <label className="mr-2">Answers per question:</label>
          <select
            value={answerCount}
            onChange={(e) => setAnswerCount(Number(e.target.value))}
            className="text-black px-2 py-1 rounded"
            disabled={completed}
          >
            {[2, 3, 4].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

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
            answerCount={answerCount}
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
          quizId={quizId}
        />
      )}

      <BackToTop />
      {!completed && <BackGroundMusic />}
    </>
  );
}

export default QuizActivity;
