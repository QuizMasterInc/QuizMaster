/**
 * FlashcardCard Component
 * Display single flashcard deck with metadata and actions
 */

import { useNavigate, useLocation } from 'react-router-dom';
import FlashcardPreview from './FlashcardPreview';

const getCreatorLabel = (deck) => {
  const username = deck?.creatorUsername || deck?.creator?.username || deck?.username;
  if (typeof username === 'string' && username.trim()) {
    return `@${username.replace(/^@/, '')}`;
  }

  const name = deck?.creatorName || deck?.creatorDisplayName || deck?.displayName;
  if (typeof name === 'string' && name.trim()) return name;

  return 'Unknown';
};

export default function FlashcardCard({ deck, onDelete, isDeleting }) {
  const navigate = useNavigate();
  const location = useLocation();

  const getDifficultyLabel = (difficulty) => {
    if (difficulty === '1') return 'Easy';
    if (difficulty === '2') return 'Medium';
    if (difficulty === '3') return 'Hard';
    return difficulty;
  };

  const getDifficultyInsight = (difficulty) => {
    if (difficulty === 'easy' || difficulty === '1') {
      return <span className="text-[var(--success)]">Perfect for quick reviews!</span>;
    }
    if (difficulty === 'medium' || difficulty === '2') {
      return <span className="text-[var(--warning)]">Balanced challenge level</span>;
    }
    if (difficulty === 'hard' || difficulty === '3') {
      return <span className="text-[var(--error)]">Advanced content - take your time</span>;
    }
    return null;
  };

  const getStudyDuration = (cardCount) => {
    if (cardCount <= 10) return "Quick study session";
    if (cardCount <= 25) return "Moderate study session";
    return "Extended study session";
  };

  return (
    <div className="w-full md:w-1/2 lg:w-1/3 p-5 text-center">
      <div className="card rounded-lg shadow-lg hover:shadow-xl border border-accent h-full flex flex-col">
        <div className="p-6 flex-grow">
          {/* Title */}
          <div className="text-2xl text-[var(--primary-500)] font-bold mb-3">
            {deck.title}
          </div>

          {/* Deck Metadata */}
          <div className="space-y-2 mb-4">
            <div className="text-base text-secondary">
              <strong>Cards:</strong> {deck.cardCount}
            </div>
            <div className="text-sm text-secondary">
              <strong>Category:</strong> {deck.category}
            </div>
            <div className="text-sm text-secondary">
              <strong>Created by:</strong> {getCreatorLabel(deck)}
            </div>
            <div className="text-sm text-secondary">
              <strong>Difficulty:</strong> {getDifficultyLabel(deck.difficulty)}
            </div>
            <div className="text-sm text-secondary">
              <strong>Visibility:</strong> {deck.isPublic ? 'Public' : 'Private'}
            </div>
          </div>

          {/* Tags */}
          {deck.tags && deck.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 my-4">
              {deck.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="px-3 py-1 bg-[var(--primary-400)] text-white rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {deck.description && (
            <div className="mb-4">
              <div className="text-sm text-[var(--primary-400)] mb-1">
                <strong>Description:</strong>
              </div>
              <div className="text-sm text-primary">{deck.description}</div>
            </div>
          )}

          {/* Interactive Flashcard Preview */}
          <FlashcardPreview cards={deck.cards} />

          {/* Progress Tracking */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-3">
              {/* Deck Status */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-[var(--text-primary)]">Deck Status</span>
                  <span className="text-xs text-[var(--text-muted)]">{deck.isPublic ? 'Public' : 'Private'}</span>
                </div>
                <div className="w-full h-2 bg-[var(--neutral-200)] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      deck.isPublic
                        ? 'bg-gradient-to-r from-green-400 to-green-600'
                        : 'bg-gradient-to-r from-[var(--primary-400)] to-[var(--primary-600)]'
                    }`}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Last Studied */}
              {deck.lastStudiedAt && (
                <div className="text-xs text-[var(--text-muted)]">
                  Last studied: {new Date(deck.lastStudiedAt).toLocaleDateString()}
                </div>
              )}

              {/* Study Insights */}
              <div className="text-xs p-2 bg-[var(--bg-primary)] rounded border-l-2 border-[var(--primary-400)]">
                <div className="space-y-1">
                  <div>{getDifficultyInsight(deck.difficulty)}</div>
                  <div className="text-[var(--text-muted)]">
                    {getStudyDuration(deck.cardCount)}
                    {deck.cardCount > 0 && ` • ~${Math.ceil(deck.cardCount * 0.5)} minute(s)`}
                  </div>
                  {(deck.timesStudied || 0) > 0 && (
                    <div className="text-[var(--text-muted)]">
                      📚 Popular deck • Studied {deck.timesStudied} time{(deck.timesStudied || 0) !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-accent flex gap-2">
          <button
            className="flex-1 px-4 py-2 bg-[var(--primary-400)] hover:bg-[var(--primary-500)] text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
            disabled={isDeleting}
            onClick={() => navigate(`/flashcards/study/${deck.id}`, { state: { from: location.pathname } })}
          >
            Study
          </button>
          <button
            className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
            disabled={isDeleting}
            onClick={() => navigate(`/flashcards/edit/${deck.id}`)}
          >
            Edit
          </button>
          <button
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
            disabled={isDeleting}
            onClick={() => onDelete(deck.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
