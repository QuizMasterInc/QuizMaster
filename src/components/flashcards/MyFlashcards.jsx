import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import flashcardService from '../../services/flashcards/flashcardService';

export default function MyFlashcards() {
  const { currentUser } = useAuth();
  const [flashcardDecks, setFlashcardDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          <div id="flashcardDecks" className="flex flex-wrap justify-center gap-8 mt-14 px-6">
            {flashcardDecks.map((deck, index) => (
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
                      {deck.tags && deck.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {deck.tags.map((tag, tagIndex) => (
                            <span key={tagIndex} className="px-2 py-1 bg-[var(--primary-100)] text-[var(--primary-700)] rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

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

                    {/* Analytics if available */}
                    {(deck.timesStudied > 0 || deck.averageScore > 0) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-sm text-secondary space-y-1">
                          {deck.timesStudied > 0 && (
                            <div><strong>Times Studied:</strong> {deck.timesStudied}</div>
                          )}
                          {deck.averageScore > 0 && (
                            <div><strong>Average Score:</strong> {deck.averageScore}%</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 border-t border-accent flex gap-2">
                    <button
                      className="flex-1 px-4 py-2 bg-[var(--primary-400)] hover:bg-[var(--primary-500)] text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                      disabled={loading}
                      onClick={() => {
                        // TODO: Implement study mode
                        alert('Study mode coming soon!');
                      }}
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
            ))}
          </div>
        )}

      </div>
    </div>
  );
}