import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ScaleLoader } from 'react-spinners';
import { BackButton } from '../ui/index.jsx';
import { useAuth } from '../../contexts/AuthContext';
import quizDraftService from '../../services/quiz/quizDraftService';

function CustomQuizSettings() {
  const { quizID } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const password = location.state?.password;
  const quizDescription = quizData?.metadata?.description || '';
  const questionCount = quizData?.metadata?.questionCount || 0;
  const category = quizData?.metadata?.category || '';
  const tags = quizData?.metadata?.tags || '';
  const difficulty = quizData?.metadata?.difficulty || '';

  const fetchQuizData = async (quizPassword) => {
    try {
      setLoading(true);
      setNeedsPassword(false);

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

      const data = await res.json();
      const quiz = data.data;

      setQuizData(quiz);

      if (currentUser?.uid) {
        const draft = await quizDraftService.loadDraft({
          userId: currentUser.uid,
          quizId: quizID
        });
        setHasDraft(!!draft);
      }
    } catch (error) {
      console.error('Failed to fetch quiz data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizData(password || null);
  }, [quizID, currentUser?.uid, password]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setPasswordError('Please enter a password');
      return;
    }
    setPasswordError('');
    fetchQuizData(passwordInput.trim());
  };

  const handleStartQuiz = () => {
    navigate(`/quizstarted/${quizID}`, {
      state: {
        password: password || passwordInput || null,
        resumeDraft: hasDraft,
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

  if (needsPassword) {
    return (
      <div className="min-h-screen py-20 px-6 bg-primary text-primary flex justify-center items-center">
        <div className="bg-card rounded-2xl p-8 shadow-xl border border-accent max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-2 text-gradient-primary">
            Password Required
          </h2>
          <p className="text-sm text-secondary text-center mb-6">
            This quiz is private. Enter the password to continue.
          </p>
          <div>
            <input
              type="text"
              autoComplete="off"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setPasswordError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePasswordSubmit(e);
              }}
              placeholder="Enter quiz password"
              className="w-full px-4 py-3 rounded-lg bg-input text-primary border border-accent mb-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary-400)]"
              autoFocus
            />
            {passwordError && (
              <p className="text-red-500 text-sm mb-3">{passwordError}</p>
            )}
            <button
              onClick={handlePasswordSubmit}
              className="w-full px-6 py-3 bg-accent hover:bg-accent-hover text-btn-primary rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Submit
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full mt-3 px-6 py-3 bg-transparent border border-accent text-secondary rounded-lg font-medium transition-all duration-200 hover:bg-[var(--bg-secondary)]"
            >
              Go Back
            </button>
          </div>
        </div>
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
    <div className="min-h-screen bg-primary text-primary relative overflow-hidden px-4 pt-10 pb-24">
      <div className="card rounded-3xl shadow-2xl px-8 py-10 space-y-8 z-10 w-full max-w-[600px] mx-auto border border-[var(--border-primary)]">
        <div className="flex justify-between items-center gap-4">
          <h1 className="text-4xl font-extrabold text-primary">
            Quiz Overview
          </h1>
          <div className="transition duration-200 opacity-90">
            <BackButton />
          </div>
        </div>

        <div className="text-center space-y-3">
          <h2 className="text-2xl font-semibold text-primary">
            {quizData.metadata?.title || quizData.title || 'Custom Quiz'}
          </h2>
          <p className="text-secondary">
            {hasDraft ? 'You have an in-progress attempt.' : 'Review the quiz details before you begin.'}
          </p>

          {(questionCount || category || tags || difficulty) && (
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {questionCount ? (
                <span className="px-3 py-1 rounded-full text-sm bg-[var(--bg-secondary)] text-secondary border border-[var(--border-primary)]">
                  {questionCount} {questionCount === 1 ? 'Question' : 'Questions'}
                </span>
              ) : null}
              {category ? (
                <span className="px-3 py-1 rounded-full text-sm bg-[var(--bg-secondary)] text-secondary border border-[var(--border-primary)]">
                  {category}
                </span>
              ) : null}
              {tags ? (
                <span className="px-3 py-1 rounded-full text-sm bg-[var(--bg-secondary)] text-secondary border border-[var(--border-primary)]">
                  {tags}
                </span>
              ) : null}
              {difficulty ? (
                <span className="px-3 py-1 rounded-full text-sm bg-[var(--bg-secondary)] text-secondary border border-[var(--border-primary)]">
                  Difficulty: {difficulty}
                </span>
              ) : null}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {quizDescription.trim() && (
            <div className="bg-[var(--bg-secondary)] rounded-2xl p-5 border border-[var(--border-primary)] shadow-sm">
              <h3 className="text-lg font-semibold mb-2 text-primary">Description</h3>
              <p className="text-secondary leading-relaxed break-words">{quizDescription}</p>
            </div>
          )}
        </div>

        <div className="pt-4 flex justify-center">
          <button
            onClick={handleStartQuiz}
            className="inline-block px-8 py-3 bg-accent hover:bg-accent-hover text-btn-primary rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border border-accent"
          >
            {hasDraft ? 'Resume Quiz' : 'Start Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomQuizSettings;