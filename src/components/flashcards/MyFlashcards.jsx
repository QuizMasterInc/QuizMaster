import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import flashcardService from '../../services/flashcards/flashcardService';

export default function MyFlashcards() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [flashcardDecks, setFlashcardDecks] = useState([]);
  const [filteredDecks, setFilteredDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      fetchUserFlashcards();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  // Filter decks based on search and filters
  useEffect(() => {
    let filtered = flashcardDecks;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(deck =>
        deck.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deck.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deck.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(deck => deck.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(deck => deck.difficulty === selectedDifficulty);
    }

    setFilteredDecks(filtered);
  }, [flashcardDecks, searchTerm, selectedCategory, selectedDifficulty]);

  const fetchUserFlashcards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userDecks = await flashcardService.getUserFlashcardDecks(currentUser.uid);
      const normalizedDecks = userDecks.map(deck => flashcardService.normalizeDeckData(deck));
      setFlashcardDecks(normalizedDecks);
    } catch (error) {
      console.error('Error fetching flashcard decks:', error);
      setError('Failed to load flashcard decks');
      setFlashcardDecks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeck = async (deckId) => {
    if (!window.confirm('Are you sure you want to delete this flashcard deck?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await flashcardService.deleteFlashcardDeck(deckId, currentUser.uid);
      
      // Remove from local state
      setFlashcardDecks(prevDecks => prevDecks.filter(deck => deck.id !== deckId));
      
    } catch (error) {
      console.error('Error deleting flashcard deck:', error);
      setError('Failed to delete flashcard deck. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary relative overflow-hidden py-20 px-6 text-[var(--text-primary)]">
      
      <div className="relative z-10">
        <h1 className="text-4xl font-extrabold text-gradient-primary text-center mb-6 drop-shadow-lg">
          My Flashcard Decks
        </h1>

        {error && (
          <div className="flex mt-5 justify-center items-center">
            <div className="error-message font-medium">
              {error}
            </div>
          </div>
        )}

        <div className="flex justify-center items-center gap-4 mb-8">
          <Link 
            to="/flashcards" 
            className="inline-block px-6 py-3 bg-[var(--primary-400)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
          >
            Create New Deck
          </Link>
          <Link 
            to="/browse-flashcards" 
            className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
          >
            Browse Public Decks
          </Link>
        </div>

        <p className="mt-6 text-center text-lg">
          You have <span className="font-bold text-[var(--primary-400)]">{flashcardDecks.length}</span> flashcard deck{flashcardDecks.length !== 1 ? 's' : ''}
        </p>

        {loading ? (
          <div className="flex justify-center items-center mt-10">
            <div className="text-gradient-primary text-lg">Loading your flashcard decks...</div>
          </div>
        ) : !currentUser ? (
          <div className="flex flex-col items-center mt-10 p-8">
            <div className="text-center text-lg text-secondary mb-6">
              Please sign in to view your flashcard decks.
            </div>
            <Link 
              to="/login" 
              className="inline-block px-8 py-4 bg-[var(--primary-400)] hover:bg-[var(--primary-500)] text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Sign In
            </Link>
          </div>
        ) : flashcardDecks.length === 0 ? (
          <div className="flex flex-col items-center mt-10 p-8">
            <div className="text-center text-lg text-secondary mb-6">
              You haven't created any flashcard decks yet.
            </div>
            <Link 
              to="/flashcards" 
              className="inline-block px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Create Your First Deck
            </Link>
          </div>
        ) : (
          <>
            {/* Search and Filter Controls */}
            <div className="max-w-4xl mx-auto mb-8 space-y-4">
              {/* Search Bar */}
              <div className="flex justify-center">
                <div className="relative w-full max-w-md">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search decks by title, description, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                  onChange={(e) => setSelectedCategory(e.target.value)}
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
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-400)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                >
                  <option value="All">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="text-center text-sm text-[var(--text-muted)]">
                Showing {filteredDecks.length} of {flashcardDecks.length} deck{flashcardDecks.length !== 1 ? 's' : ''}
                {(searchTerm || selectedCategory !== 'All' || selectedDifficulty !== 'All') && (
                  <span className="ml-2">
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('All');
                        setSelectedDifficulty('All');
                      }}
                      className="text-[var(--primary-400)] hover:underline ml-2"
                    >
                      Clear filters
                    </button>
                  </span>
                )}
              </div>
            </div>

            <div id="flashcardDecks" className="flex flex-wrap justify-center gap-8 mt-14 px-6">
              {filteredDecks.length === 0 ? (
                <div className="w-full text-center py-12">
                  <div className="max-w-md mx-auto">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                      No decks found
                    </h3>
                    <p className="text-[var(--text-muted)] mb-4">
                      {searchTerm || selectedCategory !== 'All' || selectedDifficulty !== 'All'
                        ? `No decks match your search for "${searchTerm || 'filters'}"`
                        : "You haven't created any flashcard decks yet"}
                    </p>
                    {(searchTerm || selectedCategory !== 'All' || selectedDifficulty !== 'All') && (
                      <div className="space-y-2">
                        <p className="text-sm text-[var(--text-muted)]">
                          Try searching for different keywords or adjusting your filters
                        </p>
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('All');
                            setSelectedDifficulty('All');
                          }}
                          className="px-4 py-2 bg-[var(--primary-400)] hover:bg-[var(--primary-500)] text-white rounded-lg font-medium transition-colors"
                        >
                          Clear all filters
                        </button>
                      </div>
                    )}
                    {(!searchTerm && selectedCategory === 'All' && selectedDifficulty === 'All') && (
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
              ) : (
              filteredDecks.map((deck, index) => (
              <div key={index} className="w-full md:w-1/2 lg:w-1/3 p-5 text-center">
                <div className="card rounded-lg shadow-lg hover:shadow-xl border border-accent h-full flex flex-col">
                  <div className="p-6 flex-grow">
                    <div className="text-2xl text-[var(--primary-500)] font-bold mb-3">{deck.title}</div>
                    
                    {/* Deck metadata */}
                    <div className="space-y-2 mb-4">
                      <div className="text-base text-secondary">
                        <strong>Cards:</strong> {deck.cardCount}
                      </div>
                      <div className="text-sm text-secondary">
                        <strong>Category:</strong> {deck.category}
                      </div>
                      <div className="text-sm text-secondary">
                        <strong>Difficulty:</strong> {deck.difficulty === '1' ? 'Easy' : deck.difficulty === '2' ? 'Medium' : 'Hard'}
                      </div>
                      <div className="text-sm text-secondary">
                        <strong>Visibility:</strong> {deck.isPublic ? 'Public' : 'Private'}
                      </div>
                    </div>

                    {/* Tags - centered and prominent */}
                    {deck.tags && deck.tags.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 my-4">
                        {deck.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-3 py-1 bg-[var(--primary-400)] text-white rounded-full text-sm font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {deck.description && (
                      <div className="mb-4">
                        <div className="text-sm text-[var(--primary-400)] mb-1"><strong>Description:</strong></div>
                        <div className="text-sm text-primary">{deck.description}</div>
                      </div>
                    )}
                    
                    {/* Preview of first few cards */}
                    {deck.cards && Object.keys(deck.cards).length > 0 && (
                      <div className="mt-4 text-left">
                        <div className="text-sm text-primary mb-2"><strong>Preview:</strong></div>
                        <div className="max-h-32 overflow-y-auto text-xs">
                          {Object.entries(deck.cards).slice(0, 3).map(([cardId, card], cardIndex) => (
                            <div key={cardId} className="mb-2">
                              <div className="text-primary">
                                <span className="font-bold text-[var(--primary-400)]">Front:</span> {card.front}
                              </div>
                              <div className="text-primary">
                                <span className="font-bold text-[var(--primary-400)]">Back:</span> {card.back}
                              </div>
                            </div>
                          ))}
                          {Object.keys(deck.cards).length > 3 && (
                            <div className="text-center text-white/70 mt-2">
                              ...and {Object.keys(deck.cards).length - 3} more cards
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Enhanced Progress Tracking */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="space-y-3">
                        {/* Deck Status */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-[var(--text-primary)]">Deck Status</span>
                            <span className="text-xs text-[var(--text-muted)]">
                              {deck.isPublic ? 'Public' : 'Private'}
                            </span>
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
                            {/* Difficulty-based insight */}
                            <div>
                              {deck.difficulty === 'easy' && (
                                <span className="text-[var(--success)]">Perfect for quick reviews!</span>
                              )}
                              {deck.difficulty === 'medium' && (
                                <span className="text-[var(--warning)]">Balanced challenge level</span>
                              )}
                              {deck.difficulty === 'hard' && (
                                <span className="text-[var(--error)]">Advanced content - take your time</span>
                              )}
                            </div>

                            {/* Card count insight */}
                            <div className="text-[var(--text-muted)]">
                              {deck.cardCount <= 10 && "Quick study session"}
                              {deck.cardCount > 10 && deck.cardCount <= 25 && "Moderate study session"}
                              {deck.cardCount > 25 && "Extended study session"}
                              {deck.cardCount > 0 && ` • ~${Math.ceil(deck.cardCount * 0.5)} minute(s)`}
                            </div>

                            {/* Popularity insight */}
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
                  
                  <div className="p-4 border-t border-accent flex gap-2">
                    <button
                      className="flex-1 px-4 py-2 bg-[var(--primary-400)] hover:bg-[var(--primary-500)] text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                      disabled={loading}
                      onClick={() => navigate(`/flashcards/study/${deck.id}`)}
                    >
                      Study
                    </button>
                    <button
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                      disabled={loading}
                      onClick={() => handleDeleteDeck(deck.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )))}
            </div>

          </>
        )}

      </div>
    </div>
  );
}