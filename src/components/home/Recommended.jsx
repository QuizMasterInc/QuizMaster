import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { useAuth } from '../../contexts/AuthContext';
import quizRetrievalService from '../../services/quiz/quizRetrievalService';

const Recommended = ({ limit = 3 }) => {
  const { currentUser } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!currentUser?.uid) {
        setQuizzes([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Fetch public custom quizzes
        const options = {
          privacy: 'public',
          limit: 50, // Fetch more to have variety for random selection
          currentUserId: currentUser.uid,
          useIndexes: true
        };

        const result = await quizRetrievalService.browseCustomQuizzes(options);
        const allQuizzes = result?.quizzes || [];

        // Normalize quiz data
        const normalizedQuizzes = allQuizzes.map(quiz => quizRetrievalService.normalizeQuizData(quiz)).filter(Boolean);

        // Randomly select 'limit' quizzes
        const shuffled = normalizedQuizzes.sort(() => 0.5 - Math.random());
        const selectedQuizzes = shuffled.slice(0, limit);

        if (mounted) setQuizzes(selectedQuizzes);
      } catch (err) {
        console.error('Error loading recommended quizzes:', err);
        if (mounted) setQuizzes([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [currentUser?.uid, limit]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-8 px-4">
        <div className="card p-6 flex items-center gap-4">
          <ClipLoader color="var(--primary-400)" size={28} />
          <div className="text-sm text-secondary">Loading recommended quizzes...</div>
        </div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="max-w-6xl mx-auto mt-8 px-4">
        <div className="card p-6 text-center">
          <h3 className="text-lg font-semibold">No recommended quizzes</h3>
          <p className="text-sm text-secondary">Check back later for personalized quiz recommendations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <div className="card p-6">
        <h3 className="text-xl font-bold mb-4">Recommended for You</h3>
        <ul className="space-y-3">
          {quizzes.map(quiz => (
            <li key={quiz.id} className="flex items-center justify-between p-3 rounded-md hover:bg-[var(--bg-secondary)] transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-md bg-[var(--neutral-100)]">
                  📝
                </div>
                <div>
                  <div className="font-semibold">
                    {quiz.title}
                  </div>
                  <div className="text-xs text-secondary">
                    {quiz.numQuestions} questions
                    {quiz.difficulty && (
                      <span className="ml-2">• {quiz.difficulty}</span>
                    )}
                    {quiz.category && (
                      <span className="ml-2">• {quiz.category}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/quizstarted/${quiz.id}`, {
                    state: { from: location.pathname }
                  })}
                >
                  Take Quiz
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Recommended;