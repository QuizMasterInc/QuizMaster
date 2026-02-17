import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Priority: username -> creatorName/displayName -> "Unknown"
const getCreatorHandle = (item) => {
  const username = item?.creatorUsername || item?.username;
  if (typeof username === 'string' && username.trim()) {
    return `@${username.replace(/^@/, '')}`;
  }

  const name = item?.creatorName || item?.creatorDisplayName || item?.displayName;
  if (typeof name === 'string' && name.trim()) return name;

  return 'Unknown';
};

const VisibilityPill = ({ isPublic }) => (
  <span
    className={
      'px-2 py-0.5 rounded-full text-xs font-semibold border ' +
      (isPublic
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        : 'bg-gray-500/10 text-gray-300 border-gray-500/30')
    }
  >
    {isPublic ? 'Public' : 'Private'}
  </span>
);

const SectionHeader = ({ title, onViewAll }) => (
  <div className="flex items-center justify-between gap-4 mb-4">
    <h2 className="text-xl font-bold text-gradient-primary">{title}</h2>
    <button
      type="button"
      className="text-sm font-semibold text-[var(--accent)] hover:opacity-80 transition"
      onClick={onViewAll}
    >
      View All
    </button>
  </div>
);

const ItemButton = ({ title, subtitle, rightPill, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full text-left px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition flex items-center justify-between gap-4"
  >
    <div className="min-w-0">
      <div className="font-semibold truncate">{title}</div>
      {subtitle ? <div className="text-xs text-secondary truncate">{subtitle}</div> : null}
    </div>
    <div className="flex items-center gap-2 shrink-0">
      {rightPill}
      <span className="text-secondary">›</span>
    </div>
  </button>
);

const MyStudyMaterial = ({ decks = [], quizzes = [] }) => {
  const navigate = useNavigate();

  const safeDecks = Array.isArray(decks) ? decks : [];
  const safeQuizzes = Array.isArray(quizzes) ? quizzes : [];

  const topDecks = useMemo(() => safeDecks.slice(0, 4), [safeDecks]);
  const topQuizzes = useMemo(() => safeQuizzes.slice(0, 4), [safeQuizzes]);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gradient-primary">My Study Material</h2>
        <p className="text-secondary">Your created quizzes and flashcards — all in one place.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Flashcards */}
        <div>
          <SectionHeader title="Flashcards" onViewAll={() => navigate('/myflashcards')} />
          <div className="space-y-3">
            {topDecks.length === 0 ? (
              <div className="text-secondary">No flashcard decks created yet.</div>
            ) : (
              topDecks.map((deck) => (
                <ItemButton
                  key={deck.id}
                  title={deck.title || 'Untitled Deck'}
                  subtitle={`Created by: ${getCreatorHandle(deck)}`}
                  rightPill={<VisibilityPill isPublic={!!deck.isPublic} />}
                  onClick={() => navigate(`/flashcards/${deck.id}`)}
                />
              ))
            )}
          </div>
        </div>

        {/* Quizzes */}
        <div>
          <SectionHeader title="Quizzes" onViewAll={() => navigate('/myquizzes')} />
          <div className="space-y-3">
            {topQuizzes.length === 0 ? (
              <div className="text-secondary">No quizzes created yet.</div>
            ) : (
              topQuizzes.map((quiz) => (
                <ItemButton
                  key={quiz.id}
                  title={quiz.title || quiz.name || 'Untitled Quiz'}
                  subtitle={`Created by: ${getCreatorHandle(quiz)}`}
                  rightPill={<VisibilityPill isPublic={!!quiz.isPublic} />}
                  onClick={() => navigate(`/quizzes/${quiz.id}`)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyStudyMaterial;