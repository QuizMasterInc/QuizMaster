/**
 * QuizFilters Component
 * Search, privacy, and sort controls for quiz lists
 */

export default function QuizFilters({
  enabledFilters,
  filters,
  onFilterChange,
  onRefresh,
  loading,
  showRefreshButton
}) {
  const inputBaseClasses =
    "rounded-xl px-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--primary-400)]";

  const labelClasses = "text-[var(--text-primary)] font-semibold text-lg";

  return (
    <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 mt-8 mb-6">
      {enabledFilters.includes('search') && (
        <div className="flex items-center gap-2">
          <label htmlFor="quiz-search-input" className={labelClasses}>
            Search:
          </label>
          <input
            id="quiz-search-input"
            type="text"
            placeholder="Search quizzes..."
            value={filters.searchTerm || ""}
            onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
            className={`${inputBaseClasses} w-[240px] md:w-[340px]`}
          />
        </div>
      )}

	  {enabledFilters.includes('creator') && (
        <div className="flex items-center gap-2">
          <label htmlFor="quiz-creator-search-input" className={labelClasses}>
            Creator:
          </label>
          <input
            id="quiz-creator-search-input"
            type="text"
            placeholder="Search by creator..."
            value={filters.creator || ""}
            onChange={(e) => onFilterChange({ creator: e.target.value })}
            className={`${inputBaseClasses} w-[240px] md:w-[340px]`}
          />
        </div>
      )}

      {enabledFilters.includes('privacy') && (
        <div className="flex items-center gap-2">
          <label htmlFor="quiz-privacy-select" className={labelClasses}>
            Display:
          </label>
          <select
            id="quiz-privacy-select"
            name="listPrivacyFilter"
            value={filters.privacy || "All"}
            onChange={(e) => onFilterChange({ privacy: e.target.value })}
            className={`${inputBaseClasses} min-w-[180px]`}
          >
            <option value="All">All Quizzes</option>
            <option value="Public">Public Quizzes</option>
            <option value="Private">Private Quizzes</option>
          </select>
        </div>
      )}

      {enabledFilters.includes('sort') && (
        <div className="flex items-center gap-2">
          <label htmlFor="quiz-sort-select" className={labelClasses}>
            Sort by:
          </label>
          <select
            id="quiz-sort-select"
            name="listSortMethod"
            value={filters.sortBy || "newest"}
            onChange={(e) => onFilterChange({ sortBy: e.target.value })}
            className={`${inputBaseClasses} min-w-[170px]`}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title">Title, A→Z</option>
            <option value="titleReverse">Title, Z→A</option>
            <option value="shortest">Shortest</option>
            <option value="longest">Longest</option>
          </select>
        </div>
      )}

      <button
        type="button"
        className="px-6 py-3 bg-[var(--btn-primary-bg)] hover:bg-[var(--accent-hover)] text-[var(--btn-primary-text)] rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={onRefresh}
        disabled={loading}
      >
        {loading ? 'Loading...' : (showRefreshButton ? 'Refresh' : 'Search & Filter')}
      </button>
    </div>
  );
}
