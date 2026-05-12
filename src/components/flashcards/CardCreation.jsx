/* Allows the User to make a deck of Flashcards */
import { useState, useEffect } from "react";
import CSVUpload from "./CSVUpload";
import { toast } from 'react-toastify';

export default function CardCreation({ saveDeck, isLoading, initialData }) {
  const isEditMode = Boolean(initialData);
  const [deckName, setDeckName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [difficulty, setDifficulty] = useState("2");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  const [cards, setCards] = useState([]);

  const [editingIndex, setEditingIndex] = useState(-1);

  const [showManual, setShowManual] = useState(true);
  const [showCSV, setShowCSV] = useState(false);

  // Pre-fill form if initialData is provided (Edit Mode)
  useEffect(() => {
    if (initialData) {
      setDeckName(initialData.title || "");
      setDescription(initialData.description || "");
      setCategory(initialData.category || "General");
      setDifficulty(initialData.difficulty || "2");
      setTags(Array.isArray(initialData.tags) ? initialData.tags.join(', ') : (initialData.tags || ""));
      setIsPublic(initialData.isPublic || false);
      // Ensure cards are set correctly
      setCards(initialData.cards || []);
    }
  }, [initialData]);

  const handleAddCard = () => {
    if (front.trim() && back.trim()) {
      if (editingIndex >= 0) {
        const updatedCards = [...cards];
        updatedCards[editingIndex] = { ...updatedCards[editingIndex], front, back };
        setCards(updatedCards);
        setEditingIndex(-1);
        toast.success("Card updated!");
      } else {
        setCards([...cards, { front, back }]);
      }
      setFront("");
      setBack("");
    } else {
      toast.warn("Please fill in both the front and back of the flashcard.");
    }
  };

  const handleSaveDeck = async () => {
    if (!deckName.trim()) {
      toast.warn("Please enter a deck name.");
      return;
    }
    if (cards.length === 0) {
      toast.warn("Please add at least one card to the deck.");
      return;
    }

    const deckData = {
      name: deckName,
      description,
      category,
      difficulty,
      tags,
      isPublic,
      cards,
    };

    const savingToastId = toast.loading(
      isEditMode ? "Saving changes..." : "Saving deck..."
    );

    try {
      await saveDeck(deckData);

      toast.update(savingToastId, {
        render: isEditMode ? "Flashcard deck updated!" : "Flashcard deck saved!",
        type: "success",
        isLoading: false,
        autoClose: 2500,
        closeOnClick: true,
      });
    } catch (error) {
      toast.update(savingToastId, {
        render: error?.message || "Failed to save flashcard deck.",
        type: "error",
        isLoading: false,
        autoClose: 3500,
        closeOnClick: true,
      });
      return;
    }

    // Only reset form if we are NOT in edit mode (creating a new deck)
    if (!initialData) {
      setDeckName("");
      setDescription("");
      setCategory("General");
      setDifficulty("2");
      setTags("");
      setIsPublic(false);
      setCards([]);
      setFront("");
      setBack("");
      setEditingIndex(-1);
    }
  };

  const removeCard = (indexToRemove) => {
    setCards(cards.filter((_, index) => index !== indexToRemove));
    if (indexToRemove === editingIndex) {
      setFront("");
      setBack("");
      setEditingIndex(-1);
    } else if (indexToRemove < editingIndex) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const handleEditCard = (index) => {
    const card = cards[index];
    setFront(card.front);
    setBack(card.back);
    setEditingIndex(index);
    setShowManual(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCSVQuestionsAdded = (newCards) => {
    setCards((prev) => [...prev, ...newCards]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto card border-2 border-accent">
      <h1 className="text-3xl font-bold text-gradient-primary mb-6 text-center">
        {isEditMode ? "Edit Flashcard Deck" : "Create a Flashcard Deck"}
      </h1>

      {/* Deck Information */}
      <div className="space-y-4 mb-6">
        <input
          type="text"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          placeholder="Deck name"
          disabled={isLoading}
          className="w-full p-4 rounded-lg bg-[var(--neutral-200)] placeholder-[var(--neutral-600)] text-black focus:outline-[var(--primary-400)] focus:ring-2 disabled:opacity-50"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deck description (optional)"
          disabled={isLoading}
          rows="3"
          className="w-full p-4 rounded-lg bg-[var(--neutral-200)] placeholder-[var(--neutral-600)] text-black focus:outline-[var(--primary-400)] focus:ring-2 disabled:opacity-50"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isLoading}
            className="p-4 rounded-lg bg-[var(--neutral-200)] text-black focus:outline-[var(--primary-400)] focus:ring-2 disabled:opacity-50"
          >
            <option value="General">General</option>
            <option value="Language">Language</option>
            <option value="Science">Science</option>
            <option value="History">History</option>
            <option value="Math">Math</option>
            <option value="Literature">Literature</option>
            <option value="Geography">Geography</option>
            <option value="Art">Art</option>
            <option value="Music">Music</option>
            <option value="Technology">Technology</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            disabled={isLoading}
            className="p-4 rounded-lg bg-[var(--neutral-200)] text-black focus:outline-[var(--primary-400)] focus:ring-2 disabled:opacity-50"
          >
            <option value="1">Easy</option>
            <option value="2">Medium</option>
            <option value="3">Hard</option>
          </select>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={isLoading}
              className="w-5 h-5 text-[var(--primary-400)] focus:ring-[var(--primary-400)] disabled:opacity-50"
            />
            <label htmlFor="isPublic" className="text-sm font-medium">
              Make Public
            </label>
          </div>
        </div>

        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma-separated, optional)"
          disabled={isLoading}
          className="w-full p-4 rounded-lg bg-[var(--neutral-200)] placeholder-[var(--neutral-600)] text-black focus:outline-[var(--primary-400)] focus:ring-2 disabled:opacity-50"
        />
      </div>

      {/* Accordion: Add Manually */}
      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => setShowManual((prev) => !prev)}
          className="w-full flex justify-between items-center text-left py-3 px-2"
        >
          <span className="text-lg font-semibold">Add Cards Manually</span>
          <span className="text-sm text-[var(--neutral-600)]">
            {showManual ? "▲" : "▼"}
          </span>
        </button>

        {showManual && (
          <div className="space-y-4 pb-4">
            <input
              type="text"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Front of card"
              disabled={isLoading}
              className="w-full p-4 rounded-lg bg-[var(--neutral-200)] placeholder-[var(--neutral-600)] text-black focus:outline-[var(--primary-400)] focus:ring-2 disabled:opacity-50"
            />
            <input
              type="text"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Back of card"
              disabled={isLoading}
              className="w-full p-4 rounded-lg bg-[var(--neutral-200)] placeholder-[var(--neutral-600)] text-black focus:outline-[var(--primary-400)] focus:ring-2 disabled:opacity-50"
            />
            <div className="flex justify-center gap-2">
              <button
                onClick={handleAddCard}
                disabled={isLoading}
                className="px-6 py-2 bg-[var(--primary-400)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent disabled:opacity-50 disabled:transform-none"
              >
                {editingIndex >= 0 ? "Update Card" : "Add Card"}
              </button>
              {editingIndex >= 0 && (
                <button
                  onClick={() => {
                    setFront("");
                    setBack("");
                    setEditingIndex(-1);
                  }}
                  disabled={isLoading}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-accent disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Accordion: Upload CSV */}
      <div className="border-t border-[var(--border)] pt-4 mt-2">
        <button
          type="button"
          onClick={() => setShowCSV((prev) => !prev)}
          className="w-full flex justify-between items-center text-left py-3 px-2"
        >
          <span className="text-lg font-semibold text-primary">Upload Cards from CSV</span>
          <span className="text-sm text-[var(--text-secondary)]">
            {showCSV ? "▲" : "▼"}
          </span>
        </button>

        {showCSV && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 shadow-lg">
            <CSVUpload onQuestionsAdded={handleCSVQuestionsAdded} />
          </div>
        )}
      </div>

      {/* Cards Display */}
      {cards.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            Cards in Deck ({cards.length}):
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {cards.map((card, index) => (
              <div
                key={index}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 shadow-sm flex justify-between items-start gap-4"
              >
                <div className="flex-1 whitespace-pre-line">
                  <div className="mb-2">
                    <span className="font-semibold text-[var(--primary-300)]">Front:</span>
                    <span className="ml-2 text-primary">
                      {card.front}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-green-300">Back:</span>
                    <span className="ml-2 text-primary">
                      {card.back}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => handleEditCard(index)}
                    disabled={isLoading}
                    className="rounded-lg border border-yellow-400/40 bg-yellow-500/20 px-3 py-1 text-sm font-semibold text-yellow-200 transition hover:bg-yellow-500/30 disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeCard(index)}
                    disabled={isLoading}
                    className="rounded-lg border border-red-400/40 bg-red-500/20 px-3 py-1 text-sm font-semibold text-red-200 transition hover:bg-red-500/30 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSaveDeck}
        disabled={isLoading || cards.length === 0 || !deckName.trim()}
        className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isEditMode ? "Save Changes" : "Save Deck"}
      </button>
    </div>
  );
}