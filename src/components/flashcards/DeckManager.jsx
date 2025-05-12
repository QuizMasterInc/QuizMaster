import React, { useState } from 'react';
import CardCreation from './CardCreation';

export default function DeckManager() {
  const [decks, setDecks] = useState([]);

  const saveDeck = (newDeck) => {
    setDecks([...decks, newDeck]);

    localStorage.setItem('flashcardDecks', JSON.stringify([...decks, newDeck]));
  };

  return (
    <div className="p-6">
      <CardCreation saveDeck={saveDeck} />

      {decks.length > 0 && (
        <div className="mt-10 text-white">
          <h2 className="text-2xl font-bold mb-4">Your Decks:</h2>
          {decks.map((deck, index) => (
            <div key={index} className="mb-4 p-4 bg-[#2b2555] rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">{deck.name}</h3>
              <ul className="list-disc pl-5">
                {deck.cards.map((card, i) => (
                  <li key={i}>
                    <strong>Front:</strong> {card.front} | <strong>Back:</strong> {card.back}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
