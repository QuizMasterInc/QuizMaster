/* Allows the User to make a deck of Flashcards */
import { useState } from 'react';

export default function CardCreation({ saveDeck, isLoading }) {
  const [deckName, setDeckName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [difficulty, setDifficulty] = useState('2');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [cards, setCards] = useState([]);

  const handleAddCard = () => {
    if (front.trim() && back.trim()) {
      setCards([...cards, { front, back }]);
      setFront('');
      setBack('');
    } else {
      alert('Please fill in both the front and back of the flashcard.');
    }
  };

  const handleSaveDeck = async () => {
    if (!deckName.trim()) {
      alert('Please enter a deck name.');
      return;
    }
    if (cards.length === 0) {
      alert('Please add at least one card to the deck.');
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
    
    // Reset form on successful save
    setDeckName('');
    setDescription('');
    setCategory('General');
    setDifficulty('2');
    setTags('');
    setIsPublic(false);
    setCards([]);
  };

  const removeCard = (indexToRemove) => {
    setCards(cards.filter((_, index) => index !== indexToRemove));
  };


  return (
    <div className="w-full max-w-4xl mx-auto card border-2 border-accent">
      <h1 className="text-3xl font-bold text-gradient-primary mb-6 text-center">Create a Flashcard Deck</h1>

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

      {/* Card Creation Section */}
      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Add Cards to Your Deck</h2>
        <div className="space-y-4">
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
          <div className="flex justify-center">
            <button
              onClick={handleAddCard}
              disabled={isLoading}
              className="px-6 py-2 bg-[var(--primary-400)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent disabled:opacity-50 disabled:transform-none"
            >
              Add Card
            </button>
          </div>
        </div>
      </div>

      {/* Cards Display */}
      {cards.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Cards in Deck ({cards.length}):</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {cards.map((card, index) => (
              <div key={index} className="bg-[var(--neutral-100)] p-4 rounded-lg border flex justify-between items-start">
                <div className="flex-1">
                  <div className="mb-2">
                    <span className="font-semibold text-blue-600">Front:</span> 
                    <span className="ml-2 text-[var(--neutral-600)]">{card.front}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-green-600">Back:</span> 
                    <span className="ml-2 text-[var(--neutral-600)]">{card.back}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeCard(index)}
                  disabled={isLoading}
                  className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
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
        className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Creating Deck...' : 'Save Deck'}
      </button>
    </div>
  );
}