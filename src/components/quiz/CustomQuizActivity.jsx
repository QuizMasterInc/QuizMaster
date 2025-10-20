// CustomQuizActivity.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ScaleLoader } from 'react-spinners';
import Question from './Question';
import DoneModal from './DoneModal';
import HelpModal from './HelpModal';
import Timer from './Timer';
import ProgressBar from './ProgressBar';
import BackToTop from './BackToTopButton';
import { shuffle } from '../../utils/shuffle';
import { useAuth } from '../../contexts/AuthContext';
import { useResults } from '../../contexts/ResultsContext';
import quizSubmissionService from '../../services/quiz/quizSubmissionService';

function CustomQuizActivity() {
  const { quizID } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const password = location.state?.password;
  const timerSettings = location.state; // Get timer settings from navigation state
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
  const [answerCount, setAnswerCount] = useState(4); // default max
  const [quizStartTime] = useState(Date.now());
  const [submittingResults, setSubmittingResults] = useState(false);
  const [quizMetadata, setQuizMetadata] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizSettings, setQuizSettings] = useState({
    showTimer: true,
    showPauseButton: true,
    duration: 5
  });

  const recordCorrect = useCallback(
    (isCorrect) => isCorrect && setCorrectCount((c) => c + 1),
    []
  );

  const recordAnswered = useCallback(
    (firstInteraction) => firstInteraction && setAnsweredCount((c) => c + 1),
    []
  );

  useEffect(() => {
    async function fetchCustomQuiz() {
      setLoading(true);
      try {
        const url = `https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabCustomQuiz?quizid=${quizID}${password ? `&password=${password}` : ''}`;
        const res = await fetch(url);
        const data = await res.json();
        const quiz = data.data;

        // Handle both old flat structure and new nested structure
        const questionsData = quiz.content?.questions || quiz.questions || {};
        const metadata = quiz.metadata || {};
        const settings = quiz.settings || {};

        const selected = Object.keys(questionsData).map((questionKey, index) => {
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
          const correctLower = String(correctAnswer).trim().toLowerCase();

          const allChoices = [
            q.option_1,
            q.option_2,
            q.option_3,
            q.option_4,
          ].filter(Boolean);

          const correctChoice = allChoices.find(
            (c) => c?.trim().toLowerCase() === correctLower
          );

          const wrongChoices = allChoices.filter(
            (c) => c?.trim().toLowerCase() !== correctLower
          );

          const finalChoices =
            tag === 'fill'
              ? []
              : shuffle([
                  correctChoice,
                  ...shuffle(wrongChoices).slice(0, Math.max(0, answerCount - 1)),
                ]).filter(Boolean); // Filter out undefined/null values

          return {
            questionId: `custom_${quizID}_${questionKey}`,
            questionText: q.question,
            text: q.question,
            choices: finalChoices,
            correctAnswer: correctAnswer,
            type: tag,
          };
        });

        setQuestions(selected);
        
        // Store quiz metadata and settings for result submission - handle both structures
        setQuizMetadata({
          category: metadata.category || quiz.category || 'custom',
          difficulty: metadata.difficulty || quiz.difficulty || 3,
          title: metadata.title || quiz.title || 'Custom Quiz'
        });

        // Store timer settings - use navigation state if available, otherwise quiz settings
        setQuizSettings({
          showTimer: timerSettings?.showTimer !== undefined ? timerSettings.showTimer : (settings.showTimer !== undefined ? settings.showTimer : true),
          showPauseButton: timerSettings?.showPauseButton !== undefined ? timerSettings.showPauseButton : (settings.showPauseButton !== undefined ? settings.showPauseButton : true),
          duration: timerSettings?.duration || settings.timeLimit || 5
        });
      } catch (error) {
        console.error('Failed to fetch custom quiz:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomQuiz();
  }, [quizID, answerCount, password]);

  // Scroll to top when quiz loads
  useEffect(() => {
    if (!loading && questions.length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [loading, questions.length]);

  useEffect(() => {
    if (timerFinished && !completed) handleSubmit();
  }, [timerFinished, completed]);

  const handleSubmit = async () => {
    if (submittingResults || !currentUser) return;
    
    setSubmittingResults(true);
    
    // CALCULATE SCORE AND COLLECT ANSWERS
    const calculateScoreAndAnswers = () => {
      let score = 0;
      const questionIds = [];
      const userAnswers = {};
      
      // Get all Question components from refs and calculate their correctness
      const questionElements = document.querySelectorAll('[data-question-index]');
      
      questions.forEach((question, index) => {
        const qText = question.questionText ?? question.text ?? '';
        const type = question.type?.toLowerCase();
        const isFillBlank = type === 'fill';
        const isMultipleAnswer = type === 'multiple';
        const isDragAndDrop = type === 'drag';
        
        // Store question ID
        questionIds.push(question.questionId);
        
        // Get the current answer from the DOM element
        const questionElement = document.querySelector(`[data-question-index="${index}"]`);
        if (!questionElement) {
          userAnswers[index] = null;
          return;
        }
        
        let userAnswer = null;
        let isCorrect = false;
        
        if (isFillBlank) {
          const input = questionElement.querySelector('input[type="text"]');
          if (input) {
            userAnswer = input.value.trim();
            const correctAnswer = String(question.correctAnswer).trim().toLowerCase();
            isCorrect = userAnswer.toLowerCase() === correctAnswer;
          }
        } else if (isMultipleAnswer) {
          const checkboxes = questionElement.querySelectorAll('input[type="checkbox"]:checked');
          const selectedTexts = Array.from(checkboxes).map(cb => 
            cb.parentElement.querySelector('span').textContent.trim()
          );
          userAnswer = selectedTexts;
          
          const correctAnswers = String(question.correctAnswer)
            .split('||')
            .map(a => a.trim().toLowerCase());
          
          isCorrect = selectedTexts.length === correctAnswers.length &&
                     selectedTexts.every(ans => correctAnswers.includes(ans.toLowerCase()));
        } else if (isDragAndDrop) {
          // Handle drag and drop - extract the dropped option
          const dropZone = questionElement.querySelector('.border-dashed');
          if (dropZone && dropZone.textContent && dropZone.textContent !== 'Drop your answer here') {
            userAnswer = dropZone.textContent.trim();
            const correctAnswer = String(question.correctAnswer).trim().toLowerCase();
            isCorrect = userAnswer.toLowerCase() === correctAnswer;
          }
        } else {
          // Regular multiple choice
          const selectedButton = questionElement.querySelector('button.bg-accent, button[class*="bg-accent"]');
          if (selectedButton) {
            userAnswer = selectedButton.querySelector('span').textContent.trim();
            const correctAnswer = String(question.correctAnswer).trim().toLowerCase();
            isCorrect = userAnswer.toLowerCase() === correctAnswer;
          }
        }
        
        userAnswers[index] = userAnswer;
        
        if (isCorrect) {
          score++;
        }
      });
      
      return { score, questionIds, userAnswers };
    };
    
    const { score: calculatedScore, questionIds, userAnswers } = calculateScoreAndAnswers();
    
    // Store user answers for DoneModal access
    setUserAnswers(userAnswers);
    
    try {
      // Calculate time spent in seconds
      const timeSpent = Math.round((Date.now() - quizStartTime) / 1000);
      
      // Submit custom quiz results to backend using calculated score
      await quizSubmissionService.submitQuizResults({
        userId: currentUser.uid,
        category: quizMetadata?.category || 'custom',
        score: calculatedScore,
        totalQuestions: questions.length,
        amount: questions.length, // For custom quizzes, amount equals total questions
        timeSpent,
        difficulty: quizMetadata?.difficulty || 3,
        quizType: 'custom',
        quizId: quizID,
        questionIds,
        userAnswers,
        sessionId: `custom_quiz_${Date.now()}`
      });
      
      // Refresh dashboard cache to show updated scores immediately
      await refreshResults();
      
      console.log('Custom quiz results submitted successfully');
    } catch (error) {
      console.error('Error submitting custom quiz results:', error);
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

            {/* Timer + Progress row - only show when quiz is not completed and timer is enabled */}
            {quizSettings.showTimer && !completed && (
              <div className="flex justify-center gap-6 mb-6">
                <div className="bg-card rounded-2xl p-4 shadow-xl border border-accent flex-1 max-w-xs">
                  <Timer
                    duration={quizSettings.duration}
                    showPause={quizSettings.showPauseButton}
                    onFinish={() => setTimerFinished(true)}
                  />
                </div>
                <div className="bg-card rounded-2xl p-4 shadow-xl border border-accent flex-1 max-w-xs flex items-center justify-center">
                  <ProgressBar
                    answeredCount={answeredCount}
                    totalQuestions={questions.length}
                  />
                </div>
              </div>
            )}

            {/* Show progress bar separately if timer is disabled */}
            {(!quizSettings.showTimer || completed) && (
              <div className="flex justify-center mb-6">
                <div className="bg-card rounded-2xl p-4 shadow-xl border border-accent max-w-xs flex items-center justify-center">
                  <ProgressBar
                    answeredCount={answeredCount}
                    totalQuestions={questions.length}
                  />
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
          duration={quizSettings.duration}
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
          onViewDetails={() => {
            setShowResults(true);
            setDoneActive(false);
          }}
        />
      )}

            <BackToTop />
    </div>
  );
}

export default CustomQuizActivity;
