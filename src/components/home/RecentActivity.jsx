import { useEffect, useState } from 'react';
import HeroSection from './HeroSection';
import RecentActivity from './RecentActivity';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getRecentSessions } from '../../services/flashcards/studySession';
import resultService from '../../services/quiz/resultService';

const RecentActivity = ({ limit = 6 }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentUser?.uid) {
        if (!cancelled) {
          setSessions([]);
          setQuizAttempts([]);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) setLoading(true);

      try {
        const [recentSessions, attemptsRes] = await Promise.all([
          getRecentSessions(currentUser.uid, limit).catch(() => []),
          resultService.getUserAttempts(currentUser.uid, { limitCount: limit }).catch(() => ({ attempts: [] }))
        ]);

        if (!cancelled) {
          setSessions(Array.isArray(recentSessions) ? recentSessions : []);
          setQuizAttempts(Array.isArray(attemptsRes?.attempts) ? attemptsRes.attempts : []);
        }
      } catch (err) {
        console.error('RecentActivity load error:', err);
        if (!cancelled) {
          setSessions([]);
          setQuizAttempts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.uid, limit]);

  const merged = useMemo(() => {
    const normalizeMs = (ts) => {
      if (!ts) return 0;
      if (typeof ts === 'number') return ts;
      if (typeof ts === 'string') return new Date(ts).getTime() || 0;
      if (ts?.toDate) return ts.toDate().getTime();
      if (ts?._seconds) return ts._seconds * 1000 + (ts._nanoseconds || 0) / 1e6;
      return new Date(ts).getTime() || 0;
    };

    const quizItems = (quizAttempts || []).map((a) => ({
      type: 'quiz',
      id: a.id || a.attemptId || `${a.quizId || 'quiz'}_${a.submittedAt || a.startedAt || ''}`,
      title: a.quizTitle || a.quizName || 'Quiz',
      ts: normalizeMs(a.submittedAt || a.startedAt),
      meta: { attemptId: a.id || a.attemptId }
    }));

    const sessionItems = (sessions || []).map((s) => ({
      type: 'study',
      id: s.id,
      title: s.deckTitle || s.deckId || 'Flashcards',
      ts: normalizeMs(s.lastActivityAt || s.startedAt),
      meta: { deckId: s.deckId, sessionId: s.id }
    }));

    return [...quizItems, ...sessionItems]
      .filter((i) => i.ts > 0)
      .sort((a, b) => b.ts - a.ts)
      .slice(0, limit);
  }, [quizAttempts, sessions, limit]);

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-8 px-4">
        <div className="card p-6 text-sm text-secondary">Loading recent activity...</div>
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
            <button onClick={() => navigate('/typeofquiz')} className="btn btn-primary">Take a Quiz</button>
            <button onClick={() => navigate('/flashcards')} className="btn btn-secondary">Study Flashcards</button>
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
          {merged.map((item) => (
            <li
              key={`${item.type}-${item.id}`}
              className="flex items-center justify-between p-3 rounded-md hover:bg-[var(--bg-secondary)] transition"
            >
              <div>
                <div className="font-semibold">{item.title}</div>
                <div className="text-xs text-secondary">{new Date(item.ts).toLocaleString()}</div>
              </div>

              {item.type === 'quiz' ? (
                <button
                  className="btn btn-outline"
                  onClick={() => navigate('/quizzes/quizstarted', { state: { attemptId: item.meta.attemptId } })}
                >
                  View
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const deckId = item.meta.deckId;
                    if (!deckId) {
                      navigate('/flashcards');
                      return;
                    }
                    navigate(`/flashcards/study/${deckId}`, { state: { sessionId: item.meta.sessionId } });
                  }}
                >
                  Resume
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RecentActivity;
