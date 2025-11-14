import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import flashcardService from '../../services/flashcards/flashcardService';

export default function BrowsePublicFlashcards() {
  const navigate = useNavigate();
  const [flashcardDecks, setFlashcardDecks] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    sortBy: 'recent'
  });

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch flashcards when filters change
  useEffect(() => {
    fetchPublicFlashcards();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const cats = await flashcardService.getPublicFlashcardCategories();
      setCategories(['all', ...cats]);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Keep default 'all'
    }
  };

  const fetchPublicFlashcards = async () => {
    try {
      setLoading(true);
      setError(null);

      const decks = await flashcardService.browsePublicFlashcards({
        category: filters.category,
        difficulty: filters.difficulty,
        sortBy: filters.sortBy,
        limitCount: 50
      });

      setFlashcardDecks(decks);
    } catch (error) {
      console.error('Error fetching public flashcards:', error);
      setError('Failed to load public flashcard decks');
      setFlashcardDecks([]);
    } finally {
      setLoading(false);
    }
  };

  const difficulties = ['all', '1', '2', '3'];

  return (
    <div className="min-h-screen bg-primary relative overflow-hidden py-20 px-6 text-[var(--text-primary)]">
      <div className="relative z-10">
        <h1 className="text-4xl font-extrabold text-gradient-primary text-center mb-6 drop-shadow-lg">
          Browse Public Flashcard Decks
        </h1>

        {/* Navigation */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <Link 
            to="/myflashcards" 
            className="inline-block px-6 py-3 bg-[var(--btn-primary-bg)] hover:bg-[var(--accent-hover)] text-[var(--btn-primary-text)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-[var(--accent)]"
          >
            My Flashcards
          </Link>
          <Link 
            to="/flashcards" 
            className="inline-block px-6 py-3 bg-[var(--success)] hover:bg-[var(--success)] hover:opacity-90 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-[var(--accent)]"
          >
            Create New Deck
          </Link>
        </div>

        {/* Filters */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="card p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--card-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                  Difficulty
                </label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--card-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <option value="all">All Difficulties</option>
                  <option value="1">Easy</option>
                  <option value="2">Medium</option>
                  <option value="3">Hard</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--card-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                  <option value="popular">Most Studied</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex mt-5 justify-center items-center">
            <div className="error-message font-medium">
              {error}
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-lg">
          Found <span className="font-bold text-[var(--accent)]">{flashcardDecks.length}</span> public deck{flashcardDecks.length !== 1 ? 's' : ''}
        </p>

        {loading ? (
          <div className="flex justify-center items-center mt-10">
            <div className="text-gradient-primary text-lg">Loading public flashcard decks...</div>
          </div>
        ) : flashcardDecks.length === 0 ? (
          <div className="flex flex-col items-center mt-10 p-8">
            <div className="text-center text-lg text-[var(--text-secondary)] mb-6">
              No public flashcard decks found with the selected filters.
            </div>
          </div>
        ) : (
          <div id="flashcardDecks" className="flex flex-wrap justify-center gap-8 mt-14 px-6">
            {flashcardDecks.map((deck, index) => (
              <div key={deck.id || index} className="w-full md:w-1/2 lg:w-1/3 p-5 text-center">
                <div className="card rounded-lg shadow-lg hover:shadow-xl border border-[var(--border)] h-full flex flex-col">
                  <div className="p-6 flex-grow">
                    <div className="text-2xl text-[var(--accent)] font-bold mb-3">{deck.title}</div>
                    
                    {/* Creator info */}
                    {deck.creator && (
                      <div className="text-sm text-[var(--text-secondary)] mb-3">
                        <strong>By:</strong> {deck.creator.displayName || 'Anonymous'}
                      </div>
                    )}

                    {/* Deck metadata */}
                    <div className="space-y-2 mb-4">
                      <div className="text-base text-[var(--text-secondary)]">
                        <strong>Cards:</strong> {deck.cardCount}
                      </div>
                      <div className="text-sm text-[var(--text-secondary)]">
                        <strong>Category:</strong> {deck.category}
                      </div>
                      <div className="text-sm text-[var(--text-secondary)]">
                        <strong>Difficulty:</strong> {deck.difficulty === '1' ? 'Easy' : deck.difficulty === '2' ? 'Medium' : 'Hard'}
                      </div>
                    </div>

                    {/* Tags - centered and prominent */}
                    {deck.tags && deck.tags.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 my-4">
                        {deck.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-3 py-1 bg-[var(--accent)] text-white rounded-full text-sm font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {deck.description && (
                      <div className="mb-4">
                        <div className="text-sm text-[var(--accent)] mb-1"><strong>Description:</strong></div>
                        <div className="text-sm text-[var(--text-primary)]">{deck.description}</div>
                      </div>
                    )}
                    
                    {/* Preview of first card */}
                    {deck.cards && Object.keys(deck.cards).length > 0 && (
                      <div className="mt-4 text-left">
                        <div className="text-sm text-[var(--text-primary)] mb-2"><strong>Preview:</strong></div>
                        <div className="text-xs bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border)]">
                          {Object.entries(deck.cards).slice(0, 1).map(([cardId, card]) => (
                            <div key={cardId}>
                              <div className="text-[var(--text-primary)] mb-1">
                                <span className="font-bold text-[var(--accent)]">Front:</span> {card.front}
                              </div>
                              <div className="text-[var(--text-primary)]">
                                <span className="font-bold text-[var(--accent)]">Back:</span> {card.back}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Analytics */}
                    {deck.timesStudied > 0 && (
                      <div className="mt-4 pt-4 border-t border-[var(--border)]">
                        <div className="text-sm text-[var(--text-secondary)]">
                          <strong>Times Studied:</strong> {deck.timesStudied}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 border-t border-[var(--border)]">
                    <button
                      className="w-full px-4 py-2 bg-[var(--btn-primary-bg)] hover:bg-[var(--accent-hover)] text-[var(--btn-primary-text)] rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                      onClick={() => navigate(`/flashcards/study/${deck.id}`)}
                    >
                      Study This Deck
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
