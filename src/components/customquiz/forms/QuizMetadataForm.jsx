/**
 * QuizMetadataForm Component
 * Handles quiz name and category/tag selection
 */

import { APPROVED_CATEGORIES } from '../../../constants/approvedCategories';

export default function QuizMetadataForm({
  quizName,
  onQuizNameChange,
  selectedCategories,
  onCategoryChange,
  showCategoryError
}) {
  return (
    <div className="bg-card border border-primary rounded-xl p-6 md:p-8 shadow-lg">
      <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4 md:mb-6">
        📝 Quiz Information
      </h2>

      <div className="space-y-6">
        {/* Quiz Name */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <label className="text-secondary font-medium md:text-right">
            Quiz Name:
          </label>
          <div className="md:col-span-3">
            <input
              type="text"
              value={quizName}
              onChange={onQuizNameChange}
              className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
              placeholder="Enter your quiz name"
            />
          </div>
        </div>

        {/* Quiz Tags (Dropdown Multi-select) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
          <label className="text-secondary font-medium md:text-right">
            Quiz Category/Tags:
          </label>
          <div className="md:col-span-3">
            <select
              multiple
              value={selectedCategories}
              onChange={onCategoryChange}
              className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-1 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 cursor-pointer"
              style={{
                minHeight: '200px',
                maxHeight: '320px',
                overflowY: 'auto',
                scrollbarWidth: 'thin'
              }}
            >
              {APPROVED_CATEGORIES.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                  style={{ padding: '4px 4px', margin: '1px 0', fontSize: '1rem' }}
                >
                  {cat}
                </option>
              ))}
            </select>
            <p className="text-xs text-secondary mt-2">
              Hold Ctrl (Windows) or Cmd (Mac) to select multiple categories.
            </p>
            {showCategoryError && selectedCategories.length === 0 && (
              <p className="text-sm text-error mt-2">
                Please select at least one category/tag for your quiz.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
