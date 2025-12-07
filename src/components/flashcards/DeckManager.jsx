import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import flashcardService from "../../services/flashcards/flashcardService";
import CardCreation from "./CardCreation";
import CSVUpload from "./CSVUpload";

export default function DeckManager() {
  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // toggles UI
  const [mode, setMode] = useState("manual");

  // holds CSV-imported cards
  const [csvCards, setCsvCards] = useState([]);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Handles deck creation for both manual entry and CSV upload
  const saveDeck = async (deckData) => {
    if (!currentUser) {
      setError("Please sign in to create flashcard decks.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Normalized input for the validator
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

      const validation = flashcardService.createValidatedDeckObject(deckInput);

      if (!validation.success) {
        setError(validation.error);
        return;
      }

      const response = await flashcardService.submitFlashcardDeck(
        validation.deckObject
      );

      if (response.success) {
        navigate("/myflashcards");
      } else {
        setError(response.message || "Failed to create flashcard deck.");
      }
    } catch (err) {
      setError("Failed to create flashcard deck. Please try again.");
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
          <div className="bg-red-100 text-red-700 border border-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Shows loading state while saving */}
        {isLoading && (
          <div className="bg-blue-100 text-blue-700 border border-blue-400 px-4 py-3 rounded mb-4">
            Creating your flashcard deck...
          </div>
        )}

        {/* Switch between manual entry and CSV upload */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setMode("manual")}
            className={`px-4 py-2 rounded-lg font-medium transition 
            ${
              mode === "manual"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-300"
            }`}
          >
            Add Manually
          </button>

          <button
            onClick={() => setMode("csv")}
            className={`px-4 py-2 rounded-lg font-medium transition 
            ${
              mode === "csv"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-300"
            }`}
          >
            Upload CSV
          </button>
        </div>

        {mode === "csv" && (
          <CSVUpload onQuestionsAdded={(cards) => setCsvCards(cards)} />
        )}

        {mode === "manual" && (
          <CardCreation
            saveDeck={saveDeck}
            isLoading={isLoading}
            initialCards={csvCards}
          />
        )}

        {mode === "csv" && (
          <CSVUpload onQuestionsAdded={setCsvCards} />
        )}

      </div>
    </div>
  );
}
