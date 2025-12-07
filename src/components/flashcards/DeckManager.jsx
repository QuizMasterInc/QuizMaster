import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import flashcardService from "../../services/flashcards/flashcardService";
import CardCreation from "./CardCreation";
import CSVUpload from "./CSVUpload";

export default function DeckManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [mode, setMode] = useState("manual");
  const [csvCards, setCsvCards] = useState([]);

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

      const validation = flashcardService.createValidatedDeckObject(deckInput);

      if (!validation.success) {
        setError(validation.error);
        return;
      }

      const response = await flashcardService.submitFlashcardDeck(validation.deckObject);

      if (response.success) navigate("/myflashcards");
      else setError("Failed to create flashcard deck.");
    } catch {
      setError("Something went wrong while creating the deck.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen py-16 px-4 md:px-20">
      <div className="relative z-10 p-6">

        {error && (
          <div className="bg-red-200 text-red-800 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-4 mb-6">
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

        {mode === "csv" && (
          <CSVUpload onQuestionsAdded={setCsvCards} />
        )}

        {mode === "manual" && (
          <CardCreation
            saveDeck={saveDeck}
            isLoading={isLoading}
            initialCards={csvCards}
          />
        )}
      </div>
    </div>
  );
}
