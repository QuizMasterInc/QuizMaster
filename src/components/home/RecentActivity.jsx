import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { useAuth } from '../../contexts/AuthContext';
import { getRecentSessions } from '../../services/flashcards/studySession';
import quizDraftService from '../../services/quiz/quizDraftService';
import resultService from '../../services/quiz/resultService';
import { fetchUsernamesByUids, isValidUsername } from '../../services/firebase/usernameService';

// Helper to convert Firestore timestamp or ISO string to milliseconds
const toTimestamp = (ts) => {
  if (!ts) return 0;
  if (ts.seconds) return ts.seconds * 1000;
  return new Date(ts).getTime();
};

// Format relative time
const formatRelativeTime = (timestamp) => {
  const now = Date.now();
  const diff = now - toTimestamp(timestamp);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(toTimestamp(timestamp)).toLocaleDateString();
};

// Best-effort: pull a creator UID off any shape of item we might get back
// from the various services (quiz attempts, drafts, study sessions).
const collectCreatorUid = (item) => {
  if (!item) return null;
  const createdBy = item.createdBy;
  return (
    item.creator?.uid ||
    item.creator?.userId ||
    item.creator?.id ||
    item.creatorId ||
    item.creatorID ||
    item.ownerId ||
    item.ownerID ||
    item.uidOfCreator ||
    (typeof createdBy === 'string' ? createdBy : null) ||
    createdBy?.uid ||
    createdBy?.userId ||
    createdBy?.id ||
    item.metadata?.creatorId ||
    item.metadata?.creatorID ||
    item.metadata?.creator?.uid ||
    null
  );
};

// Best-effort: pull an inline creator username if it's already on the item
const collectInlineUsername = (item) => {
  if (!item) return null;
  const raw = (
    item.creatorUsername ||
    item.creator?.username ||
    item.username ||
    ''
  ).toString().trim().replace(/^@/, '');
  return raw && isValidUsername(raw) ? raw : null;
};

// Mirrors CustomQuizSelectButton's getCreatorProfilePath
const getCreatorProfilePath = (username, creatorId) => {
  const cleaned = (username || '').toString().trim().replace(/^@/, '');
  if (cleaned) return `/u/${cleaned}`;
  if (creatorId) return `/user/${creatorId}`;
  return null;
};

// Shared arrow button
const ArrowButton = ({ direction, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={direction === 'left' ? 'Previous' : 'Next'}
    className="absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-[var(--bg-primary)] border border-[var(--border)] shadow-md hover:bg-[var(--bg-secondary)] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[var(--bg-primary)]"
    style={{ [direction === 'left' ? 'left' : 'right']: '-20px' }}
  >
    <svg
      width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: direction === 'left' ? 'rotate(180deg)' : 'none' }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  </button>
);

const RecentActivity = ({ limit = 6 }) => {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [quizDrafts, setQuizDrafts] = useState([]);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [usernameMap, setUsernameMap] = useState({}); // uid -> username
  const [creatorUidMap, setCreatorUidMap] = useState({}); // "quiz:abc"|"deck:xyz" -> uid
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [checkScrollability]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('.activity-card')?.offsetWidth || 300;
    const gap = 16;
    el.scrollBy({ left: (cardWidth + gap) * (direction === 'left' ? -1 : 1), behavior: 'smooth' });
    setTimeout(checkScrollability, 350);
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!currentUser?.uid) {
        setSessions([]);
        setQuizDrafts([]);
        setCompletedQuizzes([]);
        setUsernameMap({});
        setCreatorUidMap({});
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const recentSessions = await getRecentSessions(currentUser.uid, limit);
        if (mounted) setSessions(recentSessions || []);

        const drafts = await quizDraftService.getUserDrafts(currentUser.uid, limit);
        if (mounted) setQuizDrafts(drafts || []);

        const quizData = await resultService.getUserAttempts(currentUser.uid, { limitCount: limit });
        if (mounted) setCompletedQuizzes(quizData.attempts || []);

        // --- Look up creator UIDs from the source quiz/deck docs ---
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../../services/firebase/firebaseService');

        const quizIds = Array.from(new Set([
          ...(drafts || []).map(d => d.quizId),
          ...((quizData?.attempts) || []).map(a => a.quizId),
        ].filter(Boolean)));

        const deckIds = Array.from(new Set(
          (recentSessions || []).map(s => s.deckId).filter(Boolean)
        ));

        const idToCreatorUid = {};

        await Promise.all([
          ...quizIds.map(async (qid) => {
            try {
              const snap = await getDoc(doc(db, 'custom_quizzes', qid));
              if (snap.exists()) {
                const data = snap.data() || {};
                const uid = data?.creator?.uid || data?.creatorId || null;
                if (uid) idToCreatorUid[`quiz:${qid}`] = uid;
              }
            } catch (e) {
              // private/inaccessible/deleted quiz — skip silently
            }
          }),
          ...deckIds.map(async (did) => {
            try {
              const snap = await getDoc(doc(db, 'flashcard_decks', did));
              if (snap.exists()) {
                const data = snap.data() || {};
                const uid = data?.creatorId || data?.creator?.uid || null;
                if (uid) idToCreatorUid[`deck:${did}`] = uid;
              }
            } catch (e) {
              // private/inaccessible/deleted deck — skip silently
            }
          }),
        ]);

        if (mounted) setCreatorUidMap(idToCreatorUid);

        // Batch resolve UIDs -> usernames
        const uids = Array.from(new Set(Object.values(idToCreatorUid)));
        if (uids.length > 0) {
          try {
            const map = await fetchUsernamesByUids(uids);
            if (mounted) setUsernameMap(map || {});
          } catch (e) {
            console.warn('Username enrichment failed in RecentActivity; continuing without usernames.', e);
            if (mounted) setUsernameMap({});
          }
        } else if (mounted) {
          setUsernameMap({});
        }
      } catch (err) {
        console.error('Error loading recent activity:', err);
        if (mounted) {
          setSessions([]);
          setQuizDrafts([]);
          setCompletedQuizzes([]);
          setUsernameMap({});
          setCreatorUidMap({});
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [currentUser?.uid, limit]);

  // Check scrollability after data loads
  useEffect(() => {
    if (!loading) setTimeout(checkScrollability, 100);
  }, [loading, checkScrollability]);

  // Resolve a clean { username, creatorId } pair using the source quiz/deck lookup.
  const resolveCreator = useCallback((lookupKey, rawItem) => {
    const creatorId =
      (lookupKey && creatorUidMap[lookupKey]) ||
      collectCreatorUid(rawItem); // fallback in case service ever does include it
    const inline = collectInlineUsername(rawItem);
    const fromMap = creatorId && usernameMap[creatorId]
      ? String(usernameMap[creatorId]).replace(/^@/, '')
      : null;
    const username = (fromMap && isValidUsername(fromMap) ? fromMap : null) || inline;
    return { creatorId, username };
  }, [usernameMap, creatorUidMap]);

  const quizItems = useMemo(() => {
    const quizMap = new Map();

    completedQuizzes.forEach(q => {
      if (!q.quizId) return;
      const existing = quizMap.get(q.quizId);
      const newTs = toTimestamp(q.submittedAt);
      const existingTs = existing ? toTimestamp(existing.timestamp) : 0;

      if (!existing || newTs > existingTs) {
        const { creatorId, username } = resolveCreator(`quiz:${q.quizId}`, q);
        quizMap.set(q.quizId, {
          type: 'completed', id: q.id, quizId: q.quizId,
          title: q.quizTitle || q.category || 'Quiz',
          timestamp: q.submittedAt,
          creatorId,
          creatorUsername: username,
          meta: { score: q.score, totalQuestions: q.totalQuestions, quizType: q.quizType }
        });
      }
    });

    quizDrafts.forEach(d => {
      if (!d.quizId) return;
      const { creatorId, username } = resolveCreator(`quiz:${d.quizId}`, d);
      quizMap.set(d.quizId, {
        type: 'draft', id: d.id, quizId: d.quizId,
        title: d.quizTitle || d.category || 'Quiz',
        timestamp: d.updatedAt || d.createdAt,
        creatorId,
        creatorUsername: username,
        meta: {
          answeredCount: d.answeredCount || Object.keys(d.userAnswers || {}).length,
          totalQuestions: d.amount || d.questions?.length || 0,
          quizType: d.quizType
        }
      });
    });

    return Array.from(quizMap.values());
  }, [quizDrafts, completedQuizzes, resolveCreator]);

  const sessionItems = useMemo(() => {
    const seenDecks = new Set();
    return sessions
      .filter(s => {
        if (seenDecks.has(s.deckId)) return false;
        seenDecks.add(s.deckId);
        return true;
      })
      .map(s => {
        const { creatorId, username } = resolveCreator(`deck:${s.deckId}`, s);
        return {
          type: 'study', id: s.id,
          title: s.deckTitle || s.deckId || 'Flashcards',
          timestamp: s.lastActivityAt || s.startedAt || null,
          creatorId,
          creatorUsername: username,
          meta: { deckId: s.deckId, trackProgress: s.trackProgress ?? false }
        };
      });
  }, [sessions, resolveCreator]);

  const merged = useMemo(() => {
    return [...quizItems, ...sessionItems]
      .filter(i => i.timestamp)
      .sort((a, b) => toTimestamp(b.timestamp) - toTimestamp(a.timestamp))
      .slice(0, limit);
  }, [quizItems, sessionItems, limit]);

  // Card config per type
  const getCardConfig = (item) => {
    switch (item.type) {
      case 'draft':
        return {
          icon: '📝', accent: 'var(--warning, #f59e0b)', label: 'In Progress',
          sublabel: item.meta?.answeredCount > 0 ? `${item.meta.answeredCount}/${item.meta.totalQuestions} answered` : null,
          buttonText: 'Resume',
          onClick: () => navigate(`/quizstarted/${item.quizId}`, { state: { resumeDraft: true, from: location.pathname } })
        };
      case 'completed':
        return {
          icon: '✅', accent: 'var(--success, #22c55e)', label: 'Completed',
          sublabel: item.meta?.score !== undefined ? `Score: ${item.meta.score}/${item.meta.totalQuestions}` : null,
          buttonText: 'Take Again',
          onClick: () => navigate(`/quizstarted/${item.quizId}`, { state: { from: location.pathname } })
        };
      case 'study':
        return {
          icon: '📚', accent: 'var(--primary-400)', label: 'Flashcards',
          sublabel: null,
          buttonText: item.meta.trackProgress ? 'Resume' : 'Study',
          onClick: () => navigate(`/flashcards/study/${item.meta.deckId}`, { state: { from: location.pathname } })
        };
      default:
        return {};
    }
  };

  // Renders the "by @username" line if we have anything to link to.
  const renderCreator = (item) => {
    const profilePath = getCreatorProfilePath(item.creatorUsername, item.creatorId);
    if (!profilePath) return null;

    const label = item.creatorUsername
      ? `@${item.creatorUsername.replace(/^@/, '')}`
      : 'creator';

    return (
      <p className="text-xs text-secondary mb-1">
        by{' '}
        <Link
          to={profilePath}
          state={{ from: location.pathname }}
          onClick={(e) => e.stopPropagation()}
          className="text-[var(--primary-400)] hover:underline"
        >
          {label}
        </Link>
      </p>
    );
  };

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
            <button onClick={() => navigate('/allcustomquizzes', { state: { from: location.pathname } })} className="btn btn-primary">Take a Quiz</button>
            <button onClick={() => navigate('/flashcards', { state: { from: location.pathname } })} className="btn btn-secondary">Study Flashcards</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <h3 className="text-xl font-bold mb-4">Recently</h3>

      <div className="relative">
        <ArrowButton direction="left" onClick={() => scroll('left')} disabled={!canScrollLeft} />
        <ArrowButton direction="right" onClick={() => scroll('right')} disabled={!canScrollRight} />

        <div
          ref={scrollRef}
          onScroll={checkScrollability}
          className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>

          {merged.map(item => {
            const config = getCardConfig(item);
            return (
              <div
                key={item.id}
                className="activity-card flex-shrink-0 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:border-[var(--primary-400)]"
                style={{ width: 'calc(33.333% - 11px)', minWidth: '260px', maxWidth: '360px' }}
              >
                {/* Accent bar */}
                <div className="h-1 rounded-full mb-4 w-12" style={{ backgroundColor: config.accent }} />

                {/* Icon + badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{config.icon}</span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: config.accent + '18', color: config.accent }}
                  >
                    {config.label}
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-bold text-base mb-1 line-clamp-2 leading-snug">{item.title}</h4>

                {/* Creator (clickable) */}
                {renderCreator(item)}

                {/* Sublabel */}
                {config.sublabel && <p className="text-xs text-secondary mb-1">{config.sublabel}</p>}

                {/* Relative time */}
                <p className="text-xs text-secondary mb-4">{formatRelativeTime(item.timestamp)}</p>

                {/* Action button */}
                <button className="btn btn-primary w-full mt-auto" onClick={config.onClick}>
                  {config.buttonText}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;