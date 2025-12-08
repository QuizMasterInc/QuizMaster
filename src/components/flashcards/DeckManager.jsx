import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import flashcardService from "../../services/flashcards/flashcardService";
import CardCreation from "./CardCreation";

export default function DeckManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const saveDeck = async (deckData) => {
    if (!currentUser) {
      setError("Please sign in to create flashcard decks.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const deckInput = {
        deckName: deckData.name,
        cards: deckData.cards,
        tags: deckData.tags || "",
        isPublic: deckData.isPublic || false,
        category: deckData.category || "General",
        difficulty: deckData.difficulty || "2",
        description: deckData.description || "",
        currentUserId: currentUser.uid,
      };

      const validationResult = flashcardService.createValidatedDeckObject(
        deckInput
      );

      if (!validationResult.success) {
        setError(validationResult.error);
        return;
      }

      const response = await flashcardService.submitFlashcardDeck(
        validationResult.deckObject
      );

      if (response.success) {
        navigate("/myflashcards");
      } else {
        setError(response.message || "Failed to create flashcard deck.");
      }
    } catch (err) {
      console.error("Error creating flashcard deck:", err);
      setError("Failed to create flashcard deck. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen py-16 px-4 md:px-20 overflow-hidden">
      <div className="absolute inset-0 z-10 bg-primary" />

      <div className="relative z-10 p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            Creating your flashcard deck...
          </div>
        )}

        <CardCreation saveDeck={saveDeck} isLoading={isLoading} />
      </div>
    </div>
  );
}
