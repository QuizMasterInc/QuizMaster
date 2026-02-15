/**
 * Custom Quiz Settings - allows users to configure quiz settings before taking a custom quiz
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ScaleLoader } from 'react-spinners';
import { BackButton } from '../ui/index.jsx';

function CustomQuizSettings() {
  const { quizID } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);

  const password = location.state?.password;

  useEffect(() => {
    async function fetchQuizData() {
      try {
        const url = `https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabCustomQuiz?quizid=${quizID}${password ? `&password=${password}` : ''}`;
        const res = await fetch(url);
        const data = await res.json();
        const quiz = data.data;

        setQuizData(quiz);
      } catch (error) {
        console.error('Failed to fetch quiz data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuizData();
  }, [quizID]);

  const handleStartQuiz = () => {
    navigate(`/quizstarted/${quizID}`, {
      state: {
        password,
        from: location.pathname
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
            onClick={() => navigate('/allcustomquizzes', { state: { from: location.pathname } })}
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
            <BackButton />
          </div>
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-gradient-primary">
            {quizData.metadata?.title || quizData.title || 'Custom Quiz'}
          </h2>
          <p className="text-secondary">
            Ready to start your quiz?
          </p>
        </div>

        <div className="space-y-6">
          {/* Quiz instructions or additional settings could go here */}
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