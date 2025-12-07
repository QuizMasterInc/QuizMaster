import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import flashcardService from '../../services/flashcards/flashcardService';
import CardCreation from './CardCreation';
import CSVUpload from './CSVUpload';

export default function DeckManager() {
  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Controls which input method the user sees
  const [mode, setMode] = useState("manual");

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Handles deck creation for both manual entry and CSV upload
  const saveDeck = async (deckData) => {
    if (!currentUser) {
      setError('Please sign in to create flashcard decks.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Normalized input for the validator
      const deckInput = {
        deckName: deckData.name,
        cards: deckData.cards,
        tags: deckData.tags || '',
        isPublic: deckData.isPublic || false,
        category: deckData.category || 'General',
        difficulty: deckData.difficulty || '2',
        description: deckData.description || '',
        currentUserId: currentUser.uid
      };

      // Validate deck and structure it for Firebase
      const validationResult = flashcardService.createValidatedDeckObject(deckInput);

      if (!validationResult.success) {
        setError(validationResult.error);
        return;
      }

      // Send deck to backend
      const response = await flashcardService.submitFlashcardDeck(validationResult.deckObject);

      
      if (response.success) {
        // Success! Redirect to My Flashcards page
        navigate('/myflashcards');
      } else {
        setError(response.message || 'Failed to create flashcard deck.');
      }
    } catch (error) {
      console.error('Error creating flashcard deck:', error);
      setError('Failed to create flashcard deck. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen py-16 px-4 md:px-20 overflow-hidden">
      <div className="absolute inset-0 z-10 bg-primary" />

      <div className="relative z-10 p-6">

        {/* Shows validation or submission errors */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Shows loading state while saving */}
        {isLoading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            Creating your flashcard deck...
          </div>
        )}

        {/* Switch between manual entry and CSV upload */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setMode("manual")}
            className={`px-4 py-2 rounded-lg font-medium border transition 
              ${mode === "manual" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300"}`}
          >
            Add Manually
          </button>

          <button
            onClick={() => setMode("csv")}
            className={`px-4 py-2 rounded-lg font-medium border transition 
              ${mode === "csv" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300"}`}
          >
            Upload CSV
          </button>
        </div>

        {/* Render the appropriate input UI */}
        {mode === "manual" && (
          <CardCreation saveDeck={saveDeck} isLoading={isLoading} />
        )}

        {mode === "csv" && (
          <CSVUpload saveDeck={saveDeck} />
        )}

        {/* Link to view user's decks */}
        <div className="mt-8 text-center">
          <p className="text-[var(--primary-500)] mb-4">
            Want to view your existing flashcard decks?
          </p>
          <button
            onClick={() => navigate('/myflashcards')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
          >
            View My Flashcards
          </button>
        </div>
      </div>
    </div>
  );
}
