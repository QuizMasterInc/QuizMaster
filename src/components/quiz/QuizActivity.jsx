import React, { useCallback, useEffect, useState } from 'react';
import { ScaleLoader } from 'react-spinners';
import { useCategory } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useResults } from '../../contexts/ResultsContext';
import Question from './Question';
import DoneModal from './DoneModal';
import HelpModal from './HelpModal';
import Timer from './Timer';
import ProgressBar from './ProgressBar';
import { shuffle } from '../../utils/shuffle';
import quizService from '../../services/quizService';


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
  const { currentUser } = useAuth();
  const { refreshResults } = useResults();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [helpActive, setHelpActive] = useState(false);
  const [doneActive, setDoneActive] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizId, setQuizId] = useState(null);
  const [answerCount, setAnswerCount] = useState(4);
  const [quizStartTime] = useState(Date.now());
  const [submittingResults, setSubmittingResults] = useState(false);

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
        const url = `https://grabsubv2-ukhjsvkoca-uc.a.run.app?category=${encodeURIComponent(
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
  }, [category, subcategories, difficulty, amount, answerCount]);

  useEffect(() => {
    if (!loading && questions.length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [loading, questions.length]);

  useEffect(() => {
    if (timerFinished && !completed) {
      // Add small delay to ensure all state updates are processed
      setTimeout(() => {
        handleSubmit();
      }, 100);
    }
  }, [timerFinished, completed]);

  const handleSubmit = async () => {
    if (submittingResults || !currentUser) return;
    
    setSubmittingResults(true);
    
    // CALCULATE SCORE DIRECTLY FROM QUESTION STATES
    const calculateScore = () => {
      let score = 0;
      
      // Get all Question components from refs and calculate their correctness
      const questionElements = document.querySelectorAll('[data-question-index]');
      
      questions.forEach((question, index) => {
        const qText = question.questionText ?? question.text ?? '';
        const type = question.type?.toLowerCase();
        const isFillBlank = type === 'fill';
        const isMultipleAnswer = type === 'multiple';
        const isDragAndDrop = type === 'drag';
        
        // Get the current answer from the DOM element
        const questionElement = document.querySelector(`[data-question-index="${index}"]`);
        if (!questionElement) return;
        
        let isCorrect = false;
        
        if (isFillBlank) {
          const input = questionElement.querySelector('input[type="text"]');
          if (input) {
            const userAnswer = input.value.trim().toLowerCase();
            const correctAnswer = String(question.correctAnswer).trim().toLowerCase();
            isCorrect = userAnswer === correctAnswer;
          }
        } else if (isMultipleAnswer) {
          const checkboxes = questionElement.querySelectorAll('input[type="checkbox"]:checked');
          const selectedTexts = Array.from(checkboxes).map(cb => 
            cb.parentElement.querySelector('span').textContent.trim().toLowerCase()
          );
          
          const correctAnswers = String(question.correctAnswer)
            .split('||')
            .map(a => a.trim().toLowerCase());
          
          isCorrect = selectedTexts.length === correctAnswers.length &&
                     selectedTexts.every(ans => correctAnswers.includes(ans));
        } else if (isDragAndDrop) {
          // Handle drag and drop - this is more complex, skipping for now
          // Can be implemented if needed
        } else {
          // Regular multiple choice
          const selectedButton = questionElement.querySelector('button.bg-accent, button[class*="bg-accent"]');
          if (selectedButton) {
            const selectedText = selectedButton.querySelector('span').textContent.trim().toLowerCase();
            const correctAnswer = String(question.correctAnswer).trim().toLowerCase();
            isCorrect = selectedText === correctAnswer;
          }
        }
        
        if (isCorrect) {
          score++;
        }
      });
      
      return score;
    };
    
    const calculatedScore = calculateScore();
    
    try {
      // Calculate time spent in seconds
      const timeSpent = Math.round((Date.now() - quizStartTime) / 1000);
      
      // Submit quiz results to backend using calculated score
      await quizService.submitQuizResults({
        userId: currentUser.uid,
        category: category.toLowerCase(),
        score: calculatedScore,
        totalQuestions: questions.length,
        timeSpent,
        difficulty: difficulty || 3,
        sessionId: `quiz_${Date.now()}`
      });
      
      // Refresh dashboard cache to show updated scores immediately
      await refreshResults();
      
    } catch (error) {
      console.error('Error submitting quiz results:', error);
      // Still show results even if submission fails
    } finally {
      setSubmittingResults(false);
      setCompleted(true);
      setDoneActive(true);
      setTimerFinished(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 px-6 bg-primary text-primary flex justify-center items-center">
        <ScaleLoader color="var(--accent)" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-6 bg-primary text-primary">
      <div className="max-w-6xl mx-auto">
        {showTimer ? (
            <>
            {/* Header */}
            <div className="mb-6">
              <div className="bg-card rounded-2xl p-6 shadow-xl border border-accent">
                <h1 className="text-4xl font-bold text-center mb-2 text-gradient-primary">
                  {category} Quiz!
                </h1>
                <p className="text-lg text-center text-secondary">
                  Test your knowledge with {amount} questions
                </p>
              </div>
            </div>
        
            {/* Settings + Submit row (moved up) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Settings */}
              <div className="bg-card rounded-2xl p-6 shadow-xl border border-accent">
                <h2 className="text-2xl font-semibold mb-4 text-center text-gradient-primary">
                  Quiz Settings
                </h2>
                <div className="mb-4">
                  <label className="block text-base mb-2 text-secondary">
                    Answers per question:
                  </label>
                  <select
                    value={answerCount}
                    onChange={(e) => setAnswerCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-input text-primary border border-accent"
                    disabled={completed}
                  >
                    {[2, 3, 4].map((num) => (
                      <option key={num} value={num}>
                        {num} options
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setHelpActive(true)}
                  className="w-full px-6 py-2 bg-accent hover:bg-accent-hover text-btn-primary rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg border border-accent"
                  disabled={completed}
                >
                  Help
                </button>
              </div>
        
              {/* Progress + Submit */}
              <div className="bg-card rounded-2xl p-6 shadow-xl border border-accent">
                <h2 className="text-2xl font-semibold mb-4 text-center text-gradient-primary">
                  Quiz Progress
                </h2>
                <p className="text-base text-secondary mb-2">
                  Questions answered:{' '}
                  <span className="font-medium text-accent">
                    {answeredCount} / {amount}
                  </span>
                </p>
                <p className="text-base text-secondary mb-4">
                  Correct answers:{' '}
                  <span className="font-medium text-accent">{correctCount}</span>
                </p>
                <button
                  onClick={() => {
                    // Give time for all recordCorrect calls to complete
                    setTimeout(handleSubmit, 200);
                  }}
                  className={`w-full px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg border flex items-center justify-center gap-2 ${
                    completed || submittingResults
                      ? 'bg-neutral-400 border-neutral-400 text-white cursor-not-allowed'
                      : 'bg-accent hover:bg-accent-hover text-btn-primary border-accent'
                  }`}
                  disabled={completed || submittingResults}
                >
                  {submittingResults ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : completed ? (
                    'Quiz Completed!'
                  ) : (
                    'Submit Quiz'
                  )}
                </button>
              </div>
            </div>
        
            {/* Timer + Progress row (moved below, horizontal) */}
            <div className="flex justify-center gap-6 mb-6">
              <div className="bg-card rounded-2xl p-4 shadow-xl border border-accent flex-1 max-w-xs">
                <Timer
                  duration={duration}
                  showPause={showPauseButton}
                  onFinish={() => setTimerFinished(true)}
                />
              </div>
              <div className="bg-card rounded-2xl p-4 shadow-xl border border-accent flex-1 max-w-xs flex items-center justify-center">
                <ProgressBar
                  answeredCount={answeredCount}
                  totalQuestions={amount}
                />
              </div>
            </div>
          </>
        ) : (
          /* 2x2 grid layout when no timer */
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Title */}
            <div className="bg-card rounded-3xl p-8 shadow-xl border border-accent">
              <h1 className="text-4xl font-bold text-center mb-4 text-gradient-primary">
                {category} Quiz!
              </h1>
              <p className="text-lg text-center text-secondary">
                Test your knowledge with {amount} questions
              </p>
            </div>
            {/* Progress */}
            <div className="bg-card rounded-3xl p-6 shadow-xl border border-accent flex items-center justify-center">
              <ProgressBar
                answeredCount={answeredCount}
                totalQuestions={amount}
              />
            </div>
            {/* Settings */}
            <div className="bg-card rounded-3xl p-8 shadow-xl border border-accent">
              <h2 className="text-2xl font-semibold mb-6 text-center text-gradient-primary">
                Quiz Settings
              </h2>
              <div className="mb-6">
                <label className="block text-lg mb-2 text-secondary">
                  Answers per question:
                </label>
                <select
                  value={answerCount}
                  onChange={(e) => setAnswerCount(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg bg-input text-primary border border-accent"
                  disabled={completed}
                >
                  {[2, 3, 4].map((num) => (
                    <option key={num} value={num}>
                      {num} options
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setHelpActive(true)}
                className="w-full px-8 py-3 bg-accent hover:bg-accent-hover text-btn-primary rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
                disabled={completed}
              >
                Help
              </button>
            </div>
            {/* Progress + Submit */}
            <div className="bg-card rounded-3xl p-8 shadow-xl border border-accent">
              <h2 className="text-2xl font-semibold mb-6 text-center text-gradient-primary">
                Quiz Progress
              </h2>
              <p className="text-lg text-secondary mb-4">
                Questions answered:{' '}
                <span className="font-medium text-accent">
                  {answeredCount} / {amount}
                </span>
              </p>
              <p className="text-lg text-secondary mb-6">
                Correct answers:{' '}
                <span className="font-medium text-accent">{correctCount}</span>
              </p>
              <button
                onClick={() => {
                  // Give time for all recordCorrect calls to complete
                  setTimeout(handleSubmit, 200);
                }}
                className={`w-full px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 flex items-center justify-center gap-2 ${
                  completed || submittingResults
                    ? 'bg-neutral-400 border-neutral-400 text-white cursor-not-allowed'
                    : 'bg-accent hover:bg-accent-hover text-btn-primary border-accent'
                }`}
                disabled={completed || submittingResults}
              >
                {submittingResults ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : completed ? (
                  'Quiz Completed!'
                ) : (
                  'Submit Quiz'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-8">
          {questions.map((q, i) => (
            <div
              key={i}
              className="bg-card rounded-3xl p-8 shadow-xl border border-accent"
              data-question-index={i}
            >
              <Question
                question={q}
                isCompleted={completed}
                onAnswer={recordCorrect}
                onAnswerChange={recordAnswered}
                answerCount={answerCount}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {helpActive && (
        <HelpModal
          isActive={setHelpActive}
          active={helpActive}
          amount={amount}
          duration={duration}
        />
      )}

      {doneActive && (
        <DoneModal
          isActive={setDoneActive}
          active={doneActive}
          amountCorrect={correctCount}
          totalAmount={questions.length}
          quizId={quizId}
        />
      )}


    </div>
  );

}

export default QuizActivity;