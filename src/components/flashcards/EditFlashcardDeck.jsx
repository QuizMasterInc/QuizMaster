import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import flashcardService from "../../services/flashcards/flashcardService";
import CardCreation from "./CardCreation";
import { toast } from 'react-toastify';

export default function EditFlashcardDeck() {
  const { deckId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [deck, setDeck] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDeck() {
      if (!deckId || !currentUser) return;
      try {
        setLoading(true);
        // Fetch the existing deck data
        const response = await flashcardService.getFlashcardDeck(deckId);
        
        let deckData = response;
        if (response && response.data) {
            deckData = response.data;
        }

        if (!deckData) {
            setError("Deck not found");
        } else {
            // Simple authorization check
            if (deckData.creatorId && deckData.creatorId !== currentUser.uid) {
                toast.error("You do not have permission to edit this deck.");
                navigate("/myflashcards");
                return;
            }
            setDeck(deckData);
        }
      } catch (err) {
        console.error("Error fetching deck:", err);
        setError("Failed to load deck details.");
      } finally {
        setLoading(false);
      }
    }
    fetchDeck();
  }, [deckId, currentUser, navigate]);

  const handleUpdate = async (deckData) => {
    try {
        setLoading(true);
        const updatePayload = {
            deckId: deckId,
            userId: currentUser.uid,
            title: deckData.name,
            description: deckData.description,
            cards: deckData.cards,
            category: deckData.category,
            difficulty: deckData.difficulty,
            tags: deckData.tags,
            isPublic: deckData.isPublic
        };

        // Call service to update
        const response = await flashcardService.updateFlashcardDeck(updatePayload);
        
        if (response.success) {
            toast.success("Deck updated successfully!");
            navigate("/myflashcards");
        } else {
            toast.error(response.message || "Failed to update deck");
        }
    } catch (err) {
        console.error(err);
        toast.error(`An error occurred while updating: ${err.message || "Unknown error"}`);
    } finally {
        setLoading(false);
    }
  };

  if (loading && !deck) return <div className="p-20 text-center text-xl">Loading deck details...</div>;
  if (error) return <div className="p-20 text-center text-xl text-red-500">{error}</div>;

  return (
    <div className="relative min-h-screen py-16 px-4 md:px-20 overflow-hidden bg-primary">
      <div className="relative z-10 p-6">
         <CardCreation saveDeck={handleUpdate} isLoading={loading} initialData={deck} />
      </div>
    </div>
  );
}