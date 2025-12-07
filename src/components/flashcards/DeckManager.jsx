import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import flashcardService from "../../services/flashcards/flashcardService";
import CardCreation from "./CardCreation";
import CSVUpload from "./CSVUpload";

export default function DeckManager() {
  const [mode, setMode] = useState("manual");
  const [csvCards, setCsvCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  
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

      const input = {
        deckName: deckData.name,
        cards: deckData.cards,
        tags: deckData.tags || "",
        isPublic: deckData.isPublic || false,
        category: deckData.category || "General",
        difficulty: deckData.difficulty || "2",
        description: deckData.description || "",
        currentUserId: currentUser.uid,
      };

      const validation = flashcardService.createValidatedDeckObject(input);

      if (!validation.success) {
        setError(validation.error);
        return;
      }

      const res = await flashcardService.submitFlashcardDeck(validation.deckObject);

      if (res.success) navigate("/myflashcards");
      else setError(res.message || "Failed to create deck.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen py-16 px-4 md:px-20">
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

        {/* Mode toggle buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setMode("manual")}
            className={`px-4 py-2 rounded-lg ${
              mode === "manual"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-300"
            }`}
          >
            Add Manually
          </button>

          <button
            onClick={() => setMode("csv")}
            className={`px-4 py-2 rounded-lg ${
              mode === "csv"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-300"
            }`}
          >
            Upload CSV
          </button>
        </div>

        {/* Show CSV upload UI when in CSV mode */}
        {mode === "csv" && (
          <CSVUpload onQuestionsAdded={(cards) => setCsvCards(cards)} />
        )}

        {/* Card creation ALWAYS shows so users can save deck */}
        <CardCreation
          saveDeck={saveDeck}
          isLoading={isLoading}
          initialCards={csvCards}
          csvMode={mode === "csv"}
        />

      </div>
    </div>
  );
}
