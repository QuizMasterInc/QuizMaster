import React, { useState } from 'react';
import CardCreation from './CardCreation';

export default function DeckManager() {
  const [decks, setDecks] = useState([]);

  const saveDeck = (newDeck) => {
    setDecks([...decks, newDeck]);

    localStorage.setItem('flashcardDecks', JSON.stringify([...decks, newDeck]));
  };

  return (
    <div className="relative min-h-screen py-16 px-4 md:px-20 overflow-hidden">
      <div className="absolute inset-0 z-10 bg-primary" />

      <div className="relative z-10 p-6">
        <CardCreation saveDeck={saveDeck} />

        {decks.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Your Decks:</h2>
            {decks.map((deck, index) => (
              <div key={index} className="card">
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
    </div>
  );
}
