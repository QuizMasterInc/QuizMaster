/**
 * QuizFilters Component
 * Search, privacy, and sort controls for quiz lists
 */

import FilterSelect from './FilterSelect';

export default function QuizFilters({
  enabledFilters,
  filters,
  onFilterChange,
  onRefresh,
  loading,
  showRefreshButton
}) {
  return (
    <div className="flex justify-center items-center gap-4 mt-4">
      {enabledFilters.includes('search') && (
        <FilterSelect
          type="search"
          label="Search:"
          placeholder="Search"
          value={filters.searchTerm}
          onChange={(searchTerm) => onFilterChange({ searchTerm })}
          inputClassName="w-[150px] p-1 ml-1 text-black"
        />
      )}

      {enabledFilters.includes('privacy') && (
        <FilterSelect
          type="select"
          label="Display:"
          value={filters.privacy}
          onChange={(privacy) => onFilterChange({ privacy })}
          options={[
            { value: "All", label: "All Quizzes" },
            { value: "Public", label: "Public Quizzes" },
            { value: "Private", label: "Private Quizzes" }
          ]}
          selectName="listPrivacyFilter"
        />
      )}

      {enabledFilters.includes('sort') && (
        <FilterSelect
          type="select"
          label="Sort by:"
          value={filters.sortBy}
          onChange={(sortBy) => onFilterChange({ sortBy })}
          options={[
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
            { value: "title", label: "Title, A→Z" },
            { value: "titleReverse", label: "Title, Z→A" },
            { value: "shortest", label: "Shortest" },
            { value: "longest", label: "Longest" }
          ]}
          selectName="listSortMethod"
        />
      )}

      <button
        className="inline-block px-4 py-1 bg-[var(--primary-400)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
        onClick={onRefresh}
        disabled={loading}
      >
        {loading ? 'Loading...' : (showRefreshButton ? 'Refresh' : 'Search & Filter')}
      </button>
    </div>
  );
}
