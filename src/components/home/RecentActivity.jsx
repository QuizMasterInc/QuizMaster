import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { useResults } from '../../contexts/ResultsContext';
import { useAuth } from '../../contexts/AuthContext';
import { getRecentSessions } from '../../services/flashcards/studySession';
import resultService from '../../services/quiz/resultService';
import flashcardService from '../../services/flashcards/flashcardService';

const RecentActivity = ({ limit = 6 }) => {
  const { currentUser } = useAuth();
  const { allResults, loading: resultsLoading } = useResults();
  const [sessions, setSessions] = useState([]);
  const [deckTitles, setDeckTitles] = useState({});
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [debugOpen, setDebugOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!currentUser?.uid) {
        setSessions([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const recentSessions = await getRecentSessions(currentUser.uid, 6);
        console.log('[RecentActivity] fetched recentSessions:', recentSessions);
        if (mounted) setSessions(recentSessions || []);
      } catch (err) {
        console.error('Error loading recent sessions:', err);
        if (mounted) setSessions([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => { mounted = false; };
  }, [currentUser?.uid]);

  // Fetch deck titles for any sessions that only have a deckId
  useEffect(() => {
    let mounted = true;
    async function loadDeckTitles() {
      const missing = Array.from(new Set(sessions
        .map(s => s.deckId)
        .filter(Boolean)
        .filter(id => !deckTitles[id])));

      if (missing.length === 0) return;

      try {
        const results = await Promise.all(missing.map(id =>
          flashcardService.getFlashcardDeck(id).catch(err => {
            console.error('Error fetching deck for RecentActivity:', id, err);
            return null;
          })
        ));

        const map = {};
        results.forEach((r, idx) => {
          if (r && r.title) map[missing[idx]] = r.title;
        });

        if (mounted) setDeckTitles(prev => ({ ...prev, ...map }));
      } catch (err) {
        console.error('Error loading deck titles for recent sessions:', err);
      }
    }

    loadDeckTitles();
    return () => { mounted = false; };
  }, [sessions, deckTitles]);

  useEffect(() => {
    let mounted = true;
    async function loadAttempts() {
      if (!currentUser?.uid) {
        setQuizAttempts([]);
        return;
      }

      try {
        const data = await resultService.getUserAttempts(currentUser.uid, { limitCount: limit });
        console.log('[RecentActivity] fetched quizAttempts response:', data);
        if (mounted) setQuizAttempts(data.attempts || []);
      } catch (err) {
        console.error('Error loading quiz attempts:', err);
        if (mounted) setQuizAttempts([]);
      }
    }

    loadAttempts();

    return () => { mounted = false; };
  }, [currentUser?.uid, limit]);

  const quizItems = useMemo(() => {
    return (quizAttempts || []).map(a => ({
      type: 'quiz',
      id: a.id || a.attemptId || `${a.quizId}_${a.submittedAt}`,
      title: a.quizTitle || a.quizName || a.quizId || 'Quiz',
      timestamp: a.submittedAt || a.startedAt || null,
      meta: { score: a.score }
    }));
  }, [quizAttempts]);

  const sessionItems = useMemo(() => {
    return sessions.map(s => ({
      type: 'study',
      id: s.id,
      title: deckTitles[s.deckId] || s.deckTitle || s.deckId || 'Flashcards',
      timestamp: s.lastActivityAt || s.startedAt || null,
      meta: { cardsStudied: s.cardsStudied, deckId: s.deckId }
    }));
  }, [sessions]);

  const merged = useMemo(() => {
    const normalizeTs = (ts) => {
      if (!ts) return null;
      if (typeof ts === 'string') return new Date(ts);
      if (ts.toDate && typeof ts.toDate === 'function') return ts.toDate();
      if (ts._seconds) return new Date(ts._seconds * 1000 + (ts._nanoseconds || 0) / 1e6);
      try { return new Date(ts); } catch (e) { return null; }
    };

    const all = [...quizItems, ...sessionItems]
      .map(i => ({ ...i, ts: normalizeTs(i.timestamp)?.getTime() || 0 }))
      .filter(i => i.ts > 0)
      .sort((a, b) => b.ts - a.ts)
      .slice(0, limit);

    return all;
  }, [quizItems, sessionItems, limit]);

  if (loading || resultsLoading) {
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
          <div className="mb-4 text-right">
            <button onClick={() => setDebugOpen(v => !v)} className="text-sm underline">{debugOpen ? 'Hide debug' : 'Show debug'}</button>
          </div>
          {debugOpen && (
            <div className="mb-4 p-3 bg-[var(--bg-secondary)] rounded text-xs overflow-auto max-h-48">
              <pre className="whitespace-pre-wrap">{JSON.stringify({ sessions, quizAttempts }, null, 2)}</pre>
            </div>
          )}
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
          {debugOpen && (
            <li className="p-3">
              <div className="mb-3 text-xs">Debug: fetched data</div>
              <pre className="text-xs whitespace-pre-wrap max-h-48 overflow-auto">{JSON.stringify({ sessions, quizAttempts, merged }, null, 2)}</pre>
            </li>
          )}
          {merged.map(item => (
            <li key={item.id} className="flex items-center justify-between p-3 rounded-md hover:bg-[var(--bg-secondary)] transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-md bg-[var(--neutral-100)]">
                  {item.type === 'quiz' ? '🧠' : '📚'}
                </div>
                <div>
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-xs text-secondary">{new Date(item.ts).toLocaleString()}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {item.type === 'quiz' ? (
                  <>
                    <button className="btn btn-outline" onClick={() => navigate(`/quizzes/quizstarted`, { state: { attemptId: item.id } })}>
                      View
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        const proceed = window.confirm('Would you like to continue working on this deck?');
                        if (proceed) {
                          const deckId = item.meta?.deckId || (item.title === 'Flashcards' ? '' : item.title);
                          navigate(`/flashcards/study/${deckId}`, { state: { sessionId: item.id } });
                        } else {
                          navigate('/home');
                        }
                      }}
                    >
                      Resume
                    </button>
                  </>
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
