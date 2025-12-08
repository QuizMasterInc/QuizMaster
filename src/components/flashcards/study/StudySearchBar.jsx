/**
 * StudySearchBar Component
 * Search interface and preview mode indicator for flashcard study
 */

export default function StudySearchBar({ 
    searchTerm, 
    onSearchChange, 
    onClearSearch,
    filteredResults,
    onJumpToCard,
    previewMode,
    studyPosition,
    onReturnToStudy
}) {
    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="relative max-w-xl mx-auto">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search for a card..."
                    className="w-full px-4 py-3 rounded-lg bg-input border border-accent text-primary focus:border-accent-hover transition-all"
                />
                
                {/* Clear button */}
                {searchTerm && (
                    <button
                        onClick={onClearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-white"
                    >
                        ✕
                    </button>
                )}

                {/* Search Results Dropdown */}
                {searchTerm && (
                    <div className="absolute w-full mt-2 bg-card border border-accent rounded-xl shadow-xl max-h-60 overflow-y-auto z-20">
                        {filteredResults.length === 0 ? (
                            <div className="p-4 text-secondary text-center">
                                No matching cards found.
                            </div>
                        ) : (
                            filteredResults.map(result => (
                                <button
                                    key={result.index}
                                    onClick={() => onJumpToCard(result.index)}
                                    onTouchEnd={(e) => {
                                        e.preventDefault();
                                        onJumpToCard(result.index);
                                    }}
                                    className="block w-full text-left px-4 py-2 hover:bg-[var(--accent)] hover:text-white transition-all"
                                >
                                    <span className="font-semibold text-primary">
                                        Card {result.index + 1}:
                                    </span>{' '}
                                    {result.front.length > 60
                                        ? result.front.slice(0, 60) + "..."
                                        : result.front}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Preview Mode Banner */}
            {previewMode && (
                <div className="bg-warning/20 border-2 border-warning rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-lg font-semibold text-warning">📖 Preview Mode</span>
                        <button
                            onClick={onReturnToStudy}
                            className="px-4 py-2 bg-[var(--primary-400)] hover:bg-[var(--primary-500)] text-white rounded-lg font-medium transition-all"
                        >
                            ← Return to Study (Card {studyPosition + 1})
                        </button>
                    </div>
                    <p className="text-sm text-secondary mt-2">
                        You can view this card but cannot rate it. Return to your study position to continue rating.
                    </p>
                </div>
            )}
        </div>
    );
}
