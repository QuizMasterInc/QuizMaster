/**
 * Custom Quiz Settings - allows users to configure timer settings before taking a custom quiz
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ScaleLoader } from 'react-spinners';
import { BackButton } from '../ui/index.jsx';

function CustomQuizSettings() {
  const { quizID } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [showTimer, setShowTimer] = useState(true);
  const [showPauseButton, setShowPauseButton] = useState(true);
  const [duration, setDuration] = useState(5);

  const password = location.state?.password;

  useEffect(() => {
    async function fetchQuizData() {
      try {
        const url = `https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabCustomQuiz?quizid=${quizID}${password ? `&password=${password}` : ''}`;
        const res = await fetch(url);
        const data = await res.json();
        const quiz = data.data;

        // Extract existing settings if available
        const settings = quiz.settings || {};
        setQuizData(quiz);
        setShowTimer(settings.showTimer !== undefined ? settings.showTimer : true);
        setShowPauseButton(settings.showPauseButton !== undefined ? settings.showPauseButton : true);
        setDuration(settings.timeLimit || 5);
      } catch (error) {
        console.error('Failed to fetch quiz data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuizData();
  }, [quizID]);

  const handleStartQuiz = () => {
    // Navigate to quiz with settings
    navigate(`/quizstarted/${quizID}`, {
      state: {
        password,
        showTimer,
        showPauseButton,
        duration
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 px-6 bg-primary text-primary flex justify-center items-center">
        <ScaleLoader color="var(--accent)" />
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen py-20 px-6 bg-primary text-primary flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-secondary mb-4">Quiz not found</h2>
          <button
            onClick={() => navigate('/allcustomquizzes')}
            className="px-6 py-2 bg-accent hover:bg-accent-hover text-btn-primary rounded-lg font-medium"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary relative overflow-hidden m-5">
      <div className="card rounded-3xl shadow-2xl px-10 py-12 space-y-10 z-10 w-[600px]">

        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-extrabold">
            Quiz Settings
          </h1>
          <div className="rounded-lg shadow-lg transition duration-200">
            <BackButton to="/allcustomquizzes"/>
          </div>
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-gradient-primary">
            {quizData.metadata?.title || quizData.title || 'Custom Quiz'}
          </h2>
          <p className="text-secondary">
            Configure your quiz settings before starting
          </p>
        </div>

        <div className="space-y-6">
          {/* Show Timer */}
          <div className="flex items-center p-4 rounded-lg bg-[var(--primary-500)] shadow-lg border-2 border-accent">
            <label className="text-white font-semibold mr-4">Show Timer</label>
            <input
              type="checkbox"
              checked={showTimer}
              onChange={(e) => setShowTimer(e.target.checked)}
              className="form-checkbox h-5 w-5 text-white focus:ring-white cursor-pointer"
            />
            <span className="ml-4 text-white text-sm">
              {showTimer ? 'Timer is visible' : 'Timer is hidden'}
            </span>
          </div>

          {showTimer && (
            <>
              {/* Show Pause Button */}
              <div className="flex items-center p-4 rounded-lg bg-[var(--primary-500)] shadow-lg border-2 border-accent">
                <label className="text-white font-semibold mr-4">Show Pause Button</label>
                <input
                  type="checkbox"
                  checked={showPauseButton}
                  onChange={(e) => setShowPauseButton(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-white focus:ring-white cursor-pointer"
                />
                <span className="ml-4 text-white text-sm">
                  {showPauseButton ? 'Pause Button is visible' : 'Pause Button is hidden'}
                </span>
              </div>

              {/* Quiz Duration */}
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-gradient-primary mb-2">
                  Select Quiz Duration (In minutes)
                </h3>
                <input
                  type="number"
                  min="1"
                  max="60"
                  className="mt-2 p-2 w-16 text-center text-black font-bold rounded-lg shadow-md border-2 border-accent"
                  value={duration}
                  onChange={(e) => setDuration(Math.max(1, Math.min(60, parseInt(e.target.value) || 1)))}
                />
                <p className="text-sm text-secondary mt-2">
                  Duration: {duration} minute{duration !== 1 ? 's' : ''}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="pt-8 flex justify-center">
          <button
            onClick={handleStartQuiz}
            className="inline-block px-8 py-3 bg-accent hover:bg-accent-hover text-btn-primary rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomQuizSettings;