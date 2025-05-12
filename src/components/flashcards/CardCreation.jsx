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

  /* Lets the User create and save the deck */
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
    <div className="w-full max-w-4xl mx-auto bg-[#1b1444] border border-violet-700 rounded-2xl p-8 shadow-lg">
      <h1 className="text-3xl font-bold text-white mb-6 text-center">Create a Deck</h1>

      <input
        type="text" /* Where the user inputs the deck name*/
        value={deckName}
        onChange={(e) => setDeckName(e.target.value)}
        placeholder="Deck name"
        className="w-full p-4 mb-4 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />

      <div className="space-y-4">
        <input
          type="text" /* Where the user inputs the front of the card*/
          value={front}
          onChange={(e) => setFront(e.target.value)}
          placeholder="Front of card"
          className="w-full p-4 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text" /* Where the user inputs the back of the card*/
          value={back}
          onChange={(e) => setBack(e.target.value)}
          placeholder="Back of card"
          className="w-full p-4 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button /* Button that adds the card to the deck*/
          onClick={handleAddCard}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 text-white font-semibold py-3 rounded-lg shadow-md transition"
        >
          Add Card
        </button>
      </div>

      {cards.length > 0 && ( /* How the cards are displayed*/
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-white mb-2">Cards in Deck:</h2>
          <ul className="text-white list-disc pl-6 space-y-1">
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