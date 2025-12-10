import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import flashcardService from '../../services/flashcards/flashcardService';

// Custom Hook
import { useFlashcardFiltering } from '../../hooks/useFlashcardFiltering';

// Components
import FlashcardFilters from './FlashcardFilters';
import FlashcardCard from './FlashcardCard';
import FlashcardEmptyState from './FlashcardEmptyState';

export default function MyFlashcards() {
  const { currentUser } = useAuth();
  const [flashcardDecks, setFlashcardDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use custom filtering hook
  const {
    filteredDecks,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    clearFilters,
    hasActiveFilters
  } = useFlashcardFiltering(flashcardDecks);

  useEffect(() => {
    if (currentUser) {
      fetchUserFlashcards();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

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
            <FlashcardFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedDifficulty={selectedDifficulty}
              onDifficultyChange={setSelectedDifficulty}
              totalDecks={flashcardDecks.length}
              filteredCount={filteredDecks.length}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />

            <div id="flashcardDecks" className="flex flex-wrap justify-center gap-8 mt-14 px-6">
              {filteredDecks.length === 0 ? (
                <FlashcardEmptyState
                  hasActiveFilters={hasActiveFilters}
                  searchTerm={searchTerm}
                  onClearFilters={clearFilters}
                />
              ) : (
                filteredDecks.map((deck, index) => (
                  <FlashcardCard
                    key={deck.id || index}
                    deck={deck}
                    onDelete={handleDeleteDeck}
                    isDeleting={loading}
                  />
                ))
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}