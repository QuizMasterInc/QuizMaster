import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import flashcardService from '../../services/flashcards/flashcardService';
import CardCreation from './CardCreation';

export default function DeckManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const saveDeck = async (deckData) => {
    if (!currentUser) {
      setError('Please sign in to create flashcard decks.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Create deck input for validation
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

      // Validate and create deck object
      const validationResult = flashcardService.createValidatedDeckObject(deckInput);
      
      if (!validationResult.success) {
        setError(validationResult.error);
        return;
      }

      // Submit to Firebase
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
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            Creating your flashcard deck...
          </div>
        )}

        {/* Only show the creation form */}
        <CardCreation saveDeck={saveDeck} isLoading={isLoading} />
        
        {/* Quick nav to view existing decks */}
        <div className="mt-8 text-center">
          <p className="text-gray-300 mb-4">
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
