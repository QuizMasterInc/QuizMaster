import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScaleLoader } from 'react-spinners';
import { useCategory } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useResults } from '../../contexts/ResultsContext';
import Question from './Question';
import DoneModal from './DoneModal';
import HelpModal from './HelpModal';
import ProgressBar from './ProgressBar';
import DownloadQuiz from './DownloadQuiz';
import BackToTopButton from './BackToTopButton';

// Custom Hooks
import { useDefaultQuiz, useQuestionChoices } from '../../hooks/useQuizEngine';
import { useQuizState } from '../../hooks/useQuizState';
import { useQuizSubmission } from '../../hooks/useQuizSubmission';
import { useQuizUI } from '../../hooks/useQuizUI';
import quizDraftService from '../../services/quiz/quizDraftService';

function QuizActivity() {
  const { category, subcategories, difficulty, amount } = useCategory();
  const { currentUser } = useAuth();
  const { refreshResults } = useResults();
  const navigate = useNavigate();

  // Quiz data fetching
  const { questions, setQuestions, loading } = useDefaultQuiz({
    category,
    subcategories,
    difficulty,
    amount
  });

  // Quiz state management
  const {
    answeredCount,
    correctCount,
    userAnswers,
    completed,
    quizStartTime,
    recordAnswered,
    recordCorrect,
    setUserAnswers,
    setAnsweredCount,
    setCompleted,
    resetQuizState
  } = useQuizState();

  // Quiz submission
  const { submittingResults, submitQuiz, calculateScoreAndAnswers } = useQuizSubmission();

  // UI state
  const {
    helpActive,
    doneActive,
    answerCount,
    showResults,
    setHelpActive,
    setDoneActive,
    setAnswerCount,
    viewDetailedResults,
    useScrollToTop
  } = useQuizUI();

  // Review Again / Mark for Review (session-only)
  const [reviewQueue, setReviewQueue] = useState([]);
  const [resultsByIndex, setResultsByIndex] = useState({});

  const handleReviewToggle = (index, isMarked) => {
    if (index === null || index === undefined) return;
    
    if (isMarked) {
      setReviewQueue((prev) => (prev.includes(index) ? prev : [...prev, index]));
    } else {
      setReviewQueue((prev) => prev.filter((i) => i !== index));
    }
  };

  const handleAnswerResult = (index, isCorrect) => {
    if (typeof index !== 'number') return;

    setResultsByIndex((prev) => ({
      ...prev,
      [index]: isCorrect
    }));

    if (typeof isCorrect === 'boolean') {
      recordCorrect(isCorrect);
    }
  };

  const scrollToQuestion = (index) => {
    try {
      const el = document.querySelector(`[data-question-index="${index}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (_) {
      // no-op
    }
  };

  const goToNextReview = () => {
    if (!reviewQueue || reviewQueue.length === 0) return;
    scrollToQuestion(reviewQueue[0]);
  };

  // Update question choices when answer count changes
  useQuestionChoices(questions, setQuestions, answerCount);

  // Scroll to top when quiz loads
  useScrollToTop(loading, questions.length);

  // Try to restore draft on mount
  useEffect(() => {
    if (!currentUser) return;
    try {
      const draft = quizDraftService.loadDraft({ userId: currentUser.uid, quizId: null, category, difficulty, amount });
      if (draft) {
        if (draft.questionIds && draft.questionIds.length === questions.length) {
          if (draft.userAnswers) setUserAnswers(draft.userAnswers);
          if (typeof draft.answeredCount === 'number') {
            if (typeof setAnsweredCount === 'function') setAnsweredCount(draft.answeredCount);
          }

          const resume = window.confirm('A saved quiz draft was found. Would you like to restore your progress?');
          if (!resume) {
            quizDraftService.removeDraft({ userId: currentUser.uid, quizId: null, category, difficulty, amount });
          }
        }
      }
    } catch (err) {
      console.error('Error restoring quiz draft:', err);
    }
  }, [currentUser?.uid]);

  // Handle quiz submission
  const handleSubmit = async () => {
    await submitQuiz({
      currentUser,
      questions,
      setUserAnswers,
      setCompleted,
      refreshResults,
      quizStartTime,
      quizData: {
        category: category.toLowerCase(),
        difficulty: difficulty || 3,
        amount,
        quizType: 'default',
        quizId: `${category.toLowerCase()}_${difficulty || 3}_${amount}`,
        sessionId: `quiz_${Date.now()}`
      }
    });
    
    setDoneActive(true);
  };

  // Retry only incorrect questions (from DoneModal)
  const handleReviewAgain = (incorrectIndexes) => {
    if (!Array.isArray(incorrectIndexes) || incorrectIndexes.length === 0) return;

    const reviewQuestions = incorrectIndexes
      .map((i) => questions[i])
      .filter(Boolean);

    if (reviewQuestions.length === 0) return;

    if (typeof resetQuizState === 'function') {
      resetQuizState();
    } else {
      setUserAnswers({});
      setCompleted(false);
    }

    setQuestions(reviewQuestions);

    setDoneActive(false);
    setReviewQueue([]);
    setResultsByIndex({});
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
        {!showResults ? (
          <>
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Title */}
            <div className="bg-card rounded-3xl p-8 shadow-xl border border-accent">
              <h1 className="text-4xl font-bold text-center mb-4 text-gradient-primary">
                {category} Quiz!
              </h1>
              <p className="text-lg text-center text-secondary">
                Test your knowledge with {questions.length} questions
              </p>
            </div>
            {/* Progress */}
            <div className="bg-card rounded-3xl p-6 shadow-xl border border-accent flex items-center justify-center">
              <ProgressBar
                answeredCount={answeredCount}
                totalQuestions={questions.length}
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
                  {answeredCount} / {questions.length}
                </span>
              </p>
              <p className="text-lg text-secondary mb-6">
                Correct answers:{' '}
                <span className="font-medium text-accent">{correctCount}</span>
              </p>
              <div className="mb-6">
                <p className="text-lg text-secondary mb-3">
                  Marked for review:{' '}
                  <span className="font-medium text-accent">{reviewQueue.length}</span>
                </p>
                <button
                  type="button"
                  onClick={goToNextReview}
                  className={`w-full px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 flex items-center justify-center gap-2 ${
                    completed || reviewQueue.length === 0
                      ? 'bg-neutral-400 border-neutral-400 text-white cursor-not-allowed'
                      : 'bg-[var(--neutral-200)] text-black border-primary hover:bg-[var(--neutral-300)]'
                  }`}
                  disabled={completed || reviewQueue.length === 0}
                >
                  Go to next review question
                </button>
              </div>
              <div className="space-y-3">
              <button
                onClick={() => {
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
              <button
                onClick={async () => {
                  try {
                    const calc = calculateScoreAndAnswers(questions);
                    const draft = {
                      userId: currentUser?.uid,
                      quizId: null,
                      category,
                      difficulty,
                      amount,
                      questionIds: calc.questionIds || questions.map(q => q.questionId),
                      userAnswers: calc.userAnswers || {},
                      answeredCount: answeredCount || 0,
                      quizStartTime
                    };

                    const res = await quizDraftService.saveDraft(draft);
                    if (res.success) {
                      alert('Quiz progress saved locally. You can resume later from Home.');
                    } else {
                      alert('Failed to save draft: ' + (res.message || 'unknown'));
                    }
                  } catch (err) {
                    console.error('Error saving quiz draft:', err);
                    alert('Failed to save draft.');
                  }
                }}
                className="w-full px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 flex items-center justify-center gap-2 bg-yellow-400 text-black border-yellow-500 hover:bg-yellow-500 hover:text-white"
                disabled={!currentUser}
              >
                Save for later
              </button>
              </div>
            </div>
          </div>
          
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
                  questionIndex={i}
                  isCompleted={completed}
                  onAnswer={handleAnswerResult}
                  onAnswerChange={recordAnswered}
                  answerCount={answerCount}
                  onReviewToggle={handleReviewToggle}
                />
              </div>
            ))}
          </div>
          </>
        ) : (
          /* Detailed Results View */
          <div className="space-y-8">
            {/* Results Header */}
            <div className="mb-6">
              <div className="bg-card rounded-2xl p-6 shadow-xl border border-accent">
                <div className="flex items-center justify-between">
                  <h1 className="text-4xl font-bold text-gradient-primary">
                    Quiz Results
                  </h1>
                  <div className="flex gap-3">
                    <DownloadQuiz
                      questions={questions}
                      userAnswers={userAnswers}
                      correctCount={correctCount}
                      category={category}
                    />
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="px-4 py-2 bg-accent hover:bg-accent-hover text-btn-primary rounded-lg font-medium transition-all duration-200"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                </div>
                <p className="text-lg text-secondary mt-2">
                  Review your answers below
                </p>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-6">
              {questions.map((question, index) => {
                const userAnswer = userAnswers[index];
                const isCorrect = (() => {
                  if (!userAnswer) return false;
                  const correctAnswer = String(question.correctAnswer).trim().toLowerCase();
                  const userAns = Array.isArray(userAnswer) 
                    ? userAnswer.map(a => a.toLowerCase().trim())
                    : [String(userAnswer).toLowerCase().trim()];
                  
                  if (question.type === 'multiple') {
                    const correctAnswers = correctAnswer.split('||').map(a => a.trim().toLowerCase());
                    return userAns.length === correctAnswers.length && 
                           userAns.every(ans => correctAnswers.includes(ans));
                  } else {
                    return userAns[0] === correctAnswer;
                  }
                })();

                return (
                  <div key={index} className={`p-6 rounded-xl border-2 bg-card ${isCorrect ? 'border-green-400' : 'border-red-400'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-primary flex-1">
                        Question {index + 1}: {question.questionText}
                      </h3>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${isCorrect ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-secondary">Your Answer: </span>
                        <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                          {Array.isArray(userAnswer) ? userAnswer.join(', ') : (userAnswer || 'No answer')}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div>
                          <span className="font-medium text-secondary">Correct Answer: </span>
                          <span className="text-green-700">{question.correctAnswer}</span>
                        </div>
                      )}
                    </div>

                    {question.choices && question.choices.length > 0 && (
                      <div className="mt-4">
                        <span className="font-medium text-secondary">Options: </span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {question.choices.map((choice, choiceIndex) => (
                            <span key={choiceIndex} className="px-3 py-1 bg-[var(--bg-primary)] text-primary rounded border border-[var(--neutral-300)] text-sm">
                              {choice}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Top button */}
      <BackToTopButton />

      {/* Modals */}
      {helpActive && (
        <HelpModal
          isActive={setHelpActive}
          active={helpActive}
          amount={amount}
        />
      )}

      {doneActive && (
        <DoneModal
          isActive={setDoneActive}
          active={doneActive}
          amountCorrect={correctCount}
          totalAmount={questions.length}
          questions={questions}
          userAnswers={userAnswers}
          quizId={null}
          isCustomQuiz={false}
          onViewDetails={viewDetailedResults}
          onReviewAgain={handleReviewAgain}
          category={category}
          difficulty={difficulty}
          quizStartTime={quizStartTime}
        />
      )}
    </div>
  );
}

export default QuizActivity;