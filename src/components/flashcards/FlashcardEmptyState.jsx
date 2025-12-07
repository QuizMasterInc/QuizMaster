/**
 * FlashcardEmptyState Component
 * Display when no flashcards match filters or none exist
 */

import { useNavigate } from 'react-router-dom';

export default function FlashcardEmptyState({
  hasActiveFilters,
  searchTerm,
  onClearFilters
}) {
  const navigate = useNavigate();

  return (
    <div className="w-full text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          No decks found
        </h3>
        <p className="text-[var(--text-muted)] mb-4">
          {hasActiveFilters
            ? `No decks match your search for "${searchTerm || 'filters'}"`
            : "You haven't created any flashcard decks yet"}
        </p>
        {hasActiveFilters ? (
          <div className="space-y-2">
            <p className="text-sm text-[var(--text-muted)]">
              Try searching for different keywords or adjusting your filters
            </p>
            <button
              onClick={onClearFilters}
              className="px-4 py-2 bg-[var(--primary-400)] hover:bg-[var(--primary-500)] text-white rounded-lg font-medium transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-[var(--text-muted)]">
              Create your first flashcard deck to get started!
            </p>
            <button
              onClick={() => navigate('/flashcards/create')}
              className="px-4 py-2 bg-[var(--primary-400)] hover:bg-[var(--primary-500)] text-white rounded-lg font-medium transition-colors"
            >
              Create Flashcard Deck
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
