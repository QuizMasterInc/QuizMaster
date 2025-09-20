/* Allows the User to make a deck of Flashcards */
import React, { useState } from 'react';

export default function CardCreation({ saveDeck }) {
  const [deckName, setDeckName] = useState('');
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

  const handleSaveDeck = () => {
    if (!deckName.trim()) {
      alert('Please enter a deck name.');
      return;
    }
    if (cards.length === 0) {
      alert('Please add at least one card to the deck.');
      return;
    }
    saveDeck({ name: deckName, cards });
    setDeckName('');
    setCards([]);
  };


  return (
    <div className="w-full max-w-4xl mx-auto card border-2 border-accent">
      <h1 className="text-3xl font-bold text-gradient-primary mb-6 text-center">Create a Deck</h1>

      <input
        type="text"
        value={deckName}
        onChange={(e) => setDeckName(e.target.value)}
        placeholder="Deck name"
        className="w-full p-4 mb-4 rounded-lg bg-[var(--neutral-200)] placeholder-[var(--neutral-600)] text-black focus:outline-[var(--primary-400)] focus:ring-2"
      />

      <div className="space-y-4">
        <input
          type="text"
          value={front}
          onChange={(e) => setFront(e.target.value)}
          placeholder="Front of card"
          className="w-full p-4 mb-4 rounded-lg bg-[var(--neutral-200)] placeholder-[var(--neutral-600)] text-black focus:outline-[var(--primary-400)] focus:ring-2"
        />
        <input
          type="text"
          value={back}
          onChange={(e) => setBack(e.target.value)}
          placeholder="Back of card"
          className="w-full p-4 mb-4 rounded-lg bg-[var(--neutral-200)] placeholder-[var(--neutral-600)] text-black focus:outline-[var(--primary-400)] focus:ring-2"
        />
        <div className="flex justify-center align-center">
          <button
          onClick={handleAddCard}
          className="inline-block px-4 py-1 bg-[var(--primary-400)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
          >
            Add Card
          </button>
        </div>
        
      </div>

      {cards.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Cards in Deck:</h2>
          <ul className="list-disc pl-6 space-y-1">
            {cards.map((card, index) => (
              <li key={index}>
                <strong>Front:</strong> {card.front}, <strong>Back:</strong> {card.back}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button /* Button that saves the deck*/
        onClick={handleSaveDeck}
        className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg shadow-md transition"
      >
        Save Deck
      </button>
    </div>
  );
}