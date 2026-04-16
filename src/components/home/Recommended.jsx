import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { useAuth } from '../../contexts/AuthContext';
import quizRetrievalService from '../../services/quiz/quizRetrievalService';
 
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
 
// Difficulty badge color
const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'var(--success, #22c55e)';
    case 'medium': return 'var(--warning, #f59e0b)';
    case 'hard': return 'var(--error, #ef4444)';
    default: return 'var(--primary-400)';
  }
};
 
const Recommended = ({ limit = 3 }) => {
  const { currentUser } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
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
    const cardWidth = el.querySelector('.rec-card')?.offsetWidth || 300;
    const gap = 16;
    el.scrollBy({ left: (cardWidth + gap) * (direction === 'left' ? -1 : 1), behavior: 'smooth' });
    setTimeout(checkScrollability, 350);
  };
 
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
        const options = {
          privacy: 'public',
          limit: 50,
          currentUserId: currentUser.uid,
          useIndexes: true
        };
 
        const result = await quizRetrievalService.browseCustomQuizzes(options);
        const allQuizzes = result?.quizzes || [];
 
        const normalizedQuizzes = allQuizzes
          .map(quiz => quizRetrievalService.normalizeQuizData(quiz))
          .filter(Boolean);
 
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
 
  // Check scrollability after data loads
  useEffect(() => {
    if (!loading) setTimeout(checkScrollability, 100);
  }, [loading, checkScrollability]);
 
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
      <h3 className="text-xl font-bold mb-4">Recommended for You</h3>
 
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
 
          {quizzes.map(quiz => {
            const diffColor = getDifficultyColor(quiz.difficulty);
            return (
              <div
                key={quiz.id}
                className="rec-card flex-shrink-0 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:border-[var(--primary-400)]"
                style={{ width: 'calc(33.333% - 11px)', minWidth: '260px', maxWidth: '360px' }}
              >
                {/* Accent bar */}
                <div className="h-1 rounded-full mb-4 w-12" style={{ backgroundColor: diffColor }} />
 
                {/* Icon + badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">📝</span>
                  {quiz.difficulty && (
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: diffColor + '18', color: diffColor }}
                    >
                      {quiz.difficulty}
                    </span>
                  )}
                </div>
 
                {/* Title */}
                <h4 className="font-bold text-base mb-1 line-clamp-2 leading-snug">{quiz.title}</h4>
 
                {/* Meta info */}
                <p className="text-xs text-secondary mb-1">
                  {quiz.numQuestions} questions
                  {quiz.category && <span className="ml-1">· {quiz.category}</span>}
                </p>
 
                {/* Spacer to push button down */}
                <div className="mb-4" />
 
                {/* Action button */}
                <button
                  className="btn btn-primary w-full mt-auto"
                  onClick={() => navigate(`/quizstarted/${quiz.id}`, { state: { from: location.pathname } })}
                >
                  Take Quiz
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
 
export default Recommended;