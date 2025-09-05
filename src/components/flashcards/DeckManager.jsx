import React, { useState } from 'react';
import CardCreation from './CardCreation';

export default function DeckManager() {
  const [decks, setDecks] = useState([]);

  const saveDeck = (newDeck) => {
    setDecks([...decks, newDeck]);

    localStorage.setItem('flashcardDecks', JSON.stringify([...decks, newDeck]));
  };

  return (
    <div className="relative min-h-screen text-white py-16 px-4 md:px-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-[url('data:image/svg+xml,...')] bg-[#14002e] bg-repeat bg-[length:100px_100px]" />
      <div className="absolute top-[-150px] left-[-150px] w-[400px] h-[400px] bg-purple-500 blur-[140px] opacity-30 rounded-full z-0" />
      <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-pink-500 blur-[140px] opacity-30 rounded-full z-0" />

      {/* Foreground */}
      <div className="relative z-10 p-6">
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
    </div>
  );
}
