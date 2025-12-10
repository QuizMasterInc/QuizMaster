// CustomQuizActivity.jsx
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ScaleLoader } from 'react-spinners';
import Question from './Question';
import DoneModal from './DoneModal';
import HelpModal from './HelpModal';
import ProgressBar from './ProgressBar';
import BackToTop from './BackToTopButton';
import { useAuth } from '../../contexts/AuthContext';
import { useResults } from '../../contexts/ResultsContext';

// Custom Hooks
import { useCustomQuiz, useQuestionChoices } from '../../hooks/useQuizEngine';
import { useQuizState } from '../../hooks/useQuizState';
import { useQuizSubmission } from '../../hooks/useQuizSubmission';
import { useQuizUI } from '../../hooks/useQuizUI';

function CustomQuizActivity() {
  const { quizID } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const password = location.state?.password;
  const { currentUser } = useAuth();
  const { refreshResults } = useResults();

  // Quiz data fetching
  const { questions, setQuestions, quizMetadata, loading } = useCustomQuiz(quizID, password);

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
    setCompleted
  } = useQuizState();

  // Quiz submission
  const { submittingResults, submitQuiz } = useQuizSubmission();

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

  // Update question choices when answer count changes
  useQuestionChoices(questions, setQuestions, answerCount);

  // Scroll to top when quiz loads
  useScrollToTop(loading, questions.length);

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
        category: quizMetadata?.category || 'custom',
        difficulty: quizMetadata?.difficulty || 3,
        amount: questions.length,
        quizType: 'custom',
        quizId: quizID,
        sessionId: `custom_quiz_${Date.now()}`
      }
    });
    
    // Open done modal after submission
    setDoneActive(true);
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
            {/* Header */}
            <div className="mb-6">
              <div className="bg-card rounded-2xl p-6 shadow-xl border border-accent">
                <h1 className="text-4xl font-bold text-center mb-2 text-gradient-primary">
                  Custom Quiz!
                </h1>
                <p className="text-lg text-center text-secondary">
                  Test your knowledge with {questions.length} questions
                </p>
              </div>
            </div>

            {/* Settings + Submit row */}
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
                    {answeredCount} / {questions.length}
                  </span>
                </p>
                <p className="text-base text-secondary mb-4">
                  Correct answers:{' '}
                  <span className="font-medium text-accent">{correctCount}</span>
                </p>
                <button
                  onClick={handleSubmit}
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

            {/* Progress Bar */}
            <div className="flex justify-center mb-6">
              <div className="bg-card rounded-2xl p-4 shadow-xl border border-accent max-w-xs flex items-center justify-center">
                <ProgressBar
                  answeredCount={answeredCount}
                  totalQuestions={questions.length}
                />
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
                    isCompleted={completed}
                    onAnswer={recordCorrect}
                    onAnswerChange={recordAnswered}
                    answerCount={answerCount}
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
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 bg-accent hover:bg-accent-hover text-btn-primary rounded-lg font-medium transition-all duration-200"
                  >
                    Return to Dashboard
                  </button>
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
                        <span className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                          {Array.isArray(userAnswer) ? userAnswer.join(', ') : (userAnswer || 'No answer')}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div>
                          <span className="font-medium text-secondary">Correct Answer: </span>
                          <span className="text-green-400 font-medium">{question.correctAnswer}</span>
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

      {/* Modals */}
      {helpActive && (
        <HelpModal
          isActive={setHelpActive}
          active={helpActive}
          amount={questions.length}
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
          quizId={quizID}
          isCustomQuiz={true}
          onViewDetails={viewDetailedResults}
          category={quizMetadata?.name || "Custom Quiz"}
          difficulty={quizMetadata?.difficulty}
          quizStartTime={quizStartTime}
        />
      )}

            <BackToTop />
    </div>
  );
}

export default CustomQuizActivity;
