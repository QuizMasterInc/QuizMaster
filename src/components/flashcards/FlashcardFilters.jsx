/**
 * FlashcardFilters Component
 * Search and filter controls for flashcard decks
 */

import { useRef } from 'react';
import { FaSearch } from 'react-icons/fa';

export default function FlashcardFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedDifficulty,
  onDifficultyChange,
  totalDecks,
  filteredCount,
  hasActiveFilters,
  onClearFilters
}) {
  const searchInputRef = useRef(null);

  return (
    <div className="max-w-4xl mx-auto mb-8 space-y-4">
      {/* Search Bar */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-md">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search decks by title, description, or tags..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-3 pl-12 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-400)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
          />
          <div 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] cursor-pointer hover:text-[var(--primary-400)] transition-colors"
            onClick={() => searchInputRef.current?.focus()}
          >
            <FaSearch />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-4">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-400)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
        >
          <option value="All">All Categories</option>
          <option value="General">General</option>
          <option value="Science">Science</option>
          <option value="Mathematics">Mathematics</option>
          <option value="History">History</option>
          <option value="Geography">Geography</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Sports">Sports</option>
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          className="px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-400)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
        >
          <option value="All">All Difficulties</option>
          <option value="1">Easy</option>
          <option value="2">Medium</option>
          <option value="3">Hard</option>
        </select>
      </div>

      {/* Results Count */}
      <div className="text-center text-sm text-[var(--text-muted)]">
        Showing {filteredCount} of {totalDecks} deck{totalDecks !== 1 ? 's' : ''}
        {hasActiveFilters && (
          <span className="ml-2">
            <button
              onClick={onClearFilters}
              className="text-[var(--primary-400)] hover:underline ml-2"
            >
              Clear filters
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
