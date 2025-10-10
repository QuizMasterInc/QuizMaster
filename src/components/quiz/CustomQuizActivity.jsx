// CustomQuizActivity.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
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
import quizService from '../../services/quizService';

function CustomQuizActivity() {
  const { quizID } = useParams();
  const location = useLocation();
  const password = location.state?.password;
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

        const selected = Object.values(questionsData).map((q) => {
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
            questionText: q.question,
            text: q.question,
            choices: finalChoices,
            correctAnswer: correctAnswer,
            type: tag,
          };
        });

        setQuestions(selected);
        
        // Store quiz metadata for result submission - handle both structures
        setQuizMetadata({
          category: metadata.category || quiz.category || 'custom',
          difficulty: metadata.difficulty || quiz.difficulty || 3,
          title: metadata.title || quiz.title || 'Custom Quiz'
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
      
      // Submit custom quiz results to backend using calculated score
      await quizService.submitQuizResults({
        userId: currentUser.uid,
        category: quizMetadata?.category || 'custom',
        score: calculatedScore,
        totalQuestions: questions.length,
        timeSpent,
        difficulty: quizMetadata?.difficulty || 3,
        sessionId: `custom_quiz_${Date.now()}`,
        quizType: 'custom',
        quizId: quizID
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

        {/* Timer + Progress row */}
        <div className="flex justify-center gap-6 mb-6">
          <div className="bg-card rounded-2xl p-4 shadow-xl border border-accent flex-1 max-w-xs">
            <Timer
              duration={5} // 5 minutes
              showPause={true}
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
          amount={questions.length}
          duration={5}
        />
      )}

      {doneActive && (
        <DoneModal
          isActive={setDoneActive}
          active={doneActive}
          amountCorrect={correctCount}
          totalAmount={questions.length}
          quizId={quizID}
          isCustomQuiz={true}
        />
      )}

      <BackToTop />
    </div>
  );
}

export default CustomQuizActivity;
