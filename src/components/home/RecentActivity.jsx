import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { useAuth } from '../../contexts/AuthContext';
import { getRecentSessions } from '../../services/flashcards/studySession';
import quizDraftService from '../../services/quiz/quizDraftService';
import resultService from '../../services/quiz/resultService';

const RecentActivity = ({ limit = 6 }) => {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [quizDrafts, setQuizDrafts] = useState([]);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!currentUser?.uid) {
        setSessions([]);
        setQuizDrafts([]);
        setCompletedQuizzes([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const recentSessions = await getRecentSessions(currentUser.uid, 6);
        if (mounted) setSessions(recentSessions || []);
          
        const drafts = await quizDraftService.getUserDrafts(currentUser.uid, 6);
        if (mounted) setQuizDrafts(drafts || []);

        const quizData = await resultService.getUserAttempts(currentUser.uid, { limitCount: 6 });
        if (mounted) setCompletedQuizzes(quizData.attempts || []);
      } catch (err) {
        console.error('Error loading recent activity:', err);
        if (mounted) {
          setSessions([]);
          setQuizDrafts([]);
          setCompletedQuizzes([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [currentUser?.uid]);

  // Build quiz items - one per quizId, drafts take priority over completed
  const quizItems = useMemo(() => {
    const quizMap = new Map();

    // Add completed quizzes first
    completedQuizzes.forEach(q => {
      if (!q.quizId) return;
      quizMap.set(q.quizId, {
        type: 'completed',
        id: q.id,
        quizId: q.quizId,
        title: q.quizTitle || q.category || 'Quiz',
        timestamp: q.submittedAt,
        meta: {
          score: q.score,
          totalQuestions: q.totalQuestions,
          quizType: q.quizType
        }
      });
    });

    // Drafts override completed (if draft exists, show Resume instead of Take Again)
    quizDrafts.forEach(d => {
      if (!d.quizId) return;
      quizMap.set(d.quizId, {
        type: 'draft',
        id: d.id,
        quizId: d.quizId,
        title: d.quizTitle || d.category || 'Quiz',
        timestamp: d.updatedAt || d.createdAt,
        meta: {
          answeredCount: d.answeredCount || Object.keys(d.userAnswers || {}).length,
          totalQuestions: d.amount || d.questions?.length || 0,
          quizType: d.quizType
        }
      });
    });

    return Array.from(quizMap.values());
  }, [quizDrafts, completedQuizzes]);

  // Flashcard sessions - one per deck
  const sessionItems = useMemo(() => {
    const seenDecks = new Set();
    return sessions
      .filter(s => {
        if (seenDecks.has(s.deckId)) return false;
        seenDecks.add(s.deckId);
        return true;
      })
      .map(s => ({
        type: 'study',
        id: s.id,
        title: s.deckTitle || s.deckId || 'Flashcards',
        timestamp: s.lastActivityAt || s.startedAt || null,
        meta: { deckId: s.deckId }
      }));
  }, [sessions]);

  // Merge and sort by timestamp
  const merged = useMemo(() => {
    return [...quizItems, ...sessionItems]
      .filter(i => i.timestamp)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }, [quizItems, sessionItems, limit]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-8 px-4">
        <div className="card p-6 flex items-center gap-4">
          <ClipLoader color="var(--primary-400)" size={28} />
          <div className="text-sm text-secondary">Loading recent activity...</div>
        </div>
      </div>
    );
  }

  if (merged.length === 0) {
    return (
      <div className="max-w-6xl mx-auto mt-8 px-4">
        <div className="card p-6 text-center">
          <h3 className="text-lg font-semibold">No recent activity</h3>
          <p className="text-sm text-secondary">Start a quiz or study some flashcards to see them here.</p>
          <div className="mt-4 flex justify-center gap-3">
            <button onClick={() => navigate('/typeofquiz', { state: { from: location.pathname } })} className="btn btn-primary">Take a Quiz</button>
            <button onClick={() => navigate('/flashcards', { state: { from: location.pathname } })} className="btn btn-secondary">Study Flashcards</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <div className="card p-6">
        <h3 className="text-xl font-bold mb-4">Recently</h3>
        <ul className="space-y-3">
          {merged.map(item => (
            <li key={item.id} className="flex items-center justify-between p-3 rounded-md hover:bg-[var(--bg-secondary)] transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-md bg-[var(--neutral-100)]">
                  {item.type === 'draft' ? '📌' : item.type === 'completed' ? '📄' : '📚'}
                </div>
                <div>
                  <div className="font-semibold">
                    {item.title}
                    {item.type === 'draft' && (
                      <span className="ml-2 text-xs text-yellow-500">(In Progress)</span>
                    )}
                    {item.type === 'completed' && item.meta?.score !== undefined && (
                      <span className="ml-2 text-xs text-green-500">
                        ({item.meta.score}/{item.meta.totalQuestions})
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-secondary">
                    {new Date(item.timestamp).toLocaleString()}
                    {item.type === 'draft' && item.meta?.answeredCount > 0 && (
                      <span className="ml-2">• {item.meta.answeredCount}/{item.meta.totalQuestions} answered</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {item.type === 'draft' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/quizstarted/${item.quizId}`, { 
                      state: { resumeDraft: true, from: location.pathname } 
                    })}
                  >
                    Resume
                  </button>
                )}
                {item.type === 'completed' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/quizstarted/${item.quizId}`, { 
                      state: { from: location.pathname } 
                    })}
                  >
                    Take Again
                  </button>
                )}
                {item.type === 'study' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/flashcards/study/${item.meta.deckId}`, { 
                      state: { from: location.pathname } 
                    })}
                  >
                    Resume
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RecentActivity;