import { useState, useEffect } from "react";

export default function CardCreation({
  saveDeck,
  isLoading,
  initialCards = [],
  csvMode = false
}) {
  const [deckName, setDeckName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [difficulty, setDifficulty] = useState("2");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  // Manual entry state
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  // All cards (manual OR CSV)
  const [cards, setCards] = useState([]);

  // Load CSV-imported cards
  useEffect(() => {
    if (initialCards.length > 0) {
      setCards(initialCards);
    }
  }, [initialCards]);

  const handleAddCard = () => {
    if (front.trim() && back.trim()) {
      setCards([...cards, { front, back }]);
      setFront("");
      setBack("");
    } else {
      alert("Please fill in both sides of the card.");
    }
  };

  const handleSaveDeck = async () => {
    if (!deckName.trim()) {
      alert("Please enter a deck name.");
      return;
    }
    if (cards.length === 0) {
      alert("Please add at least one card.");
      return;
    }

    const deckData = {
      name: deckName,
      description,
      category,
      difficulty,
      tags,
      isPublic,
      cards
    };

    await saveDeck(deckData);

    setDeckName("");
    setDescription("");
    setCategory("General");
    setDifficulty("2");
    setTags("");
    setIsPublic(false);
    setCards([]);
  };

  const removeCard = (indexToRemove) => {
    setCards(cards.filter((_, index) => index !== indexToRemove));
  };


  return (
    <div className="w-full max-w-4xl mx-auto card border-2 border-accent">
      <h1 className="text-3xl font-bold text-gradient-primary mb-6 text-center">
        Create a Flashcard Deck
      </h1>

      {/* Deck Information */}
      <div className="space-y-4 mb-6">
        <input
          type="text"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          placeholder="Deck name"
          disabled={isLoading}
          className="w-full p-4 rounded-lg bg-[var(--neutral-200)] text-black"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deck description (optional)"
          disabled={isLoading}
          rows="3"
          className="w-full p-4 rounded-lg bg-[var(--neutral-200)] text-black"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isLoading}
            className="p-4 rounded-lg bg-[var(--neutral-200)] text-black"
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
            className="p-4 rounded-lg bg-[var(--neutral-200)] text-black"
          >
            <option value="1">Easy</option>
            <option value="2">Medium</option>
            <option value="3">Hard</option>
          </select>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={isLoading}
              className="w-5 h-5"
            />
            <span>Make Public</span>
          </label>
        </div>

        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma-separated, optional)"
          disabled={isLoading}
          className="w-full p-4 rounded-lg bg-[var(--neutral-200)] text-black"
        />
      </div>

      {/* Manual card creation – hidden in CSV mode */}
      {!csvMode && (
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Add Cards to Your Deck</h2>

          <div className="space-y-4">
            <input
              type="text"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Front of card"
              className="w-full p-4 rounded-lg bg-[var(--neutral-200)] text-black"
            />

            <input
              type="text"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Back of card"
              className="w-full p-4 rounded-lg bg-[var(--neutral-200)] text-black"
            />

            <div className="flex justify-center">
              <button
                onClick={handleAddCard}
                className="px-6 py-2 bg-[var(--primary-400)] rounded-lg font-medium shadow-lg hover:scale-105"
              >
                Add Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card List */}
      {cards.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            Cards in Deck ({cards.length}):
          </h2>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {cards.map((card, index) => (
              <div
                key={index}
                className="bg-[var(--neutral-100)] p-4 rounded-lg border flex justify-between"
              >
                <div className="flex-1 whitespace-pre-line">
                  <p>
                    <strong className="text-blue-600">Front:</strong>{" "}
                    <span>{card.front}</span>
                  </p>
                  <p className="mt-2">
                    <strong className="text-green-600">Back:</strong>
                    <br />
                    {card.back}
                  </p>
                </div>

                <button
                  onClick={() => removeCard(index)}
                  className="ml-4 px-3 py-1 bg-red-500 text-white rounded"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSaveDeck}
        disabled={isLoading || cards.length === 0 || !deckName.trim()}
        className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg shadow-md disabled:opacity-50"
      >
        {isLoading ? "Creating Deck..." : "Save Deck"}
      </button>
    </div>
  );
}
