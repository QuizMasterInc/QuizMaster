import { useState, useEffect } from "react";

export default function CardCreation({ saveDeck, isLoading, initialCards = [] }) {
  const [deckName, setDeckName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [difficulty, setDifficulty] = useState("2");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  const [cards, setCards] = useState([]);

  useEffect(() => {
    if (initialCards.length > 0) {
      setCards(initialCards);
    }
  }, [initialCards]);

  const handleAddCard = () => {
    if (!front.trim() || !back.trim()) {
      alert("Both front and back are required.");
      return;
    }

    setCards([...cards, { front, back }]);
    setFront("");
    setBack("");
  };

  const handleSaveDeck = () => {
    if (!deckName.trim()) return alert("Deck name is required.");
    if (cards.length === 0) return alert("Add at least one flashcard.");

    const deckData = {
      name: deckName,
      description,
      category,
      difficulty,
      tags,
      isPublic,
      cards,
    };

    saveDeck(deckData);

    setDeckName("");
    setDescription("");
    setCategory("General");
    setDifficulty("2");
    setTags("");
    setIsPublic(false);
    setCards([]);
  };

  const removeCard = (i) => {
    setCards(cards.filter((_, index) => index !== i));
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-900 p-8 rounded-xl border border-purple-600 shadow-lg">
      <h1 className="text-3xl font-bold text-purple-300 mb-6 text-center">
        Create a Flashcard Deck
      </h1>

      {/* Deck Info */}
      <div className="space-y-4 mb-6">
        <input
          type="text"
          className="w-full p-4 rounded bg-gray-800 text-white"
          placeholder="Deck name"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
        />

        <textarea
          rows="3"
          className="w-full p-4 rounded bg-gray-800 text-white"
          placeholder="Deck description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            className="p-4 rounded bg-gray-800 text-white"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>General</option>
            <option>Language</option>
            <option>Science</option>
            <option>History</option>
            <option>Math</option>
            <option>Literature</option>
            <option>Geography</option>
            <option>Art</option>
            <option>Music</option>
            <option>Technology</option>
            <option>Other</option>
          </select>

          <select
            className="p-4 rounded bg-gray-800 text-white"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="1">Easy</option>
            <option value="2">Medium</option>
            <option value="3">Hard</option>
          </select>

          <label className="flex items-center gap-2 text-white">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Make Public
          </label>
        </div>

        <input
          type="text"
          className="w-full p-4 rounded bg-gray-800 text-white"
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>

      {/* Add Card */}
      <div className="border-t border-gray-700 pt-6">
        <h2 className="text-xl text-purple-300 font-semibold mb-4">Add Cards</h2>

        <input
          type="text"
          className="w-full p-4 rounded bg-gray-800 text-white mb-4"
          placeholder="Front"
          value={front}
          onChange={(e) => setFront(e.target.value)}
        />

        <input
          type="text"
          className="w-full p-4 rounded bg-gray-800 text-white mb-4"
          placeholder="Back"
          value={back}
          onChange={(e) => setBack(e.target.value)}
        />

        <button
          onClick={handleAddCard}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded"
        >
          Add Card
        </button>
      </div>

      {/* Card List */}
      {cards.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl text-purple-300 font-semibold mb-4">
            Cards in Deck ({cards.length})
          </h2>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {cards.map((c, index) => (
              <div
                key={index}
                className="bg-gray-800 p-4 rounded flex justify-between items-start border border-gray-700"
              >
                <div className="text-white">
                  <p>
                    <strong className="text-blue-300">Front:</strong> {c.front}
                  </p>
                  <p>
                    <strong className="text-green-300">Back:</strong> {c.back}
                  </p>
                </div>

                <button
                  onClick={() => removeCard(index)}
                  className="ml-4 px-3 py-1 bg-red-600 text-white rounded"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Deck */}
      <button
        onClick={handleSaveDeck}
        className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg"
      >
        {isLoading ? "Saving..." : "Save Deck"}
      </button>
    </div>
  );
}
