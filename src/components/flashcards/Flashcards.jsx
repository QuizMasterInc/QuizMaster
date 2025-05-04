import React, { useState } from 'react';
import CardCreation from './CardCreation';

export default function Flashcards() {
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState([]);

  const addCard = (card) => {
    setFlashcards((prev) => [...prev, card]);
    setFlipped((prev) => [...prev, false]);
  };

  const handleFlip = (index) => {
    const updated = [...flipped];
    updated[index] = !updated[index];
    setFlipped(updated);
  };

  return (
    <div className="relative min-h-screen text-white py-16 px-4 md:px-20 overflow-hidden">
      {/* Diagonal Purple Background */}
      <div className="absolute inset-0 z-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2280%22%20height%3D%2280%22%20viewBox%3D%220%200%2080%2080%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22%236b21a8%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M0%2080L80%200H70L0%2070zM10%2080L80%2010V0L0%2080zM30%2080L80%2030V20L20%2080zM50%2080L80%2050V40L40%2080zM70%2080L80%2070V60L60%2080z%22/%3E%3C/g%3E%3C/svg%3E')] bg-[#14002e] bg-repeat bg-[length:100px_100px]" />

      {/* Glow Effects */}
      <div className="absolute top-[-150px] left-[-150px] w-[400px] h-[400px] bg-purple-500 blur-[140px] opacity-30 rounded-full z-0" />
      <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-pink-500 blur-[140px] opacity-30 rounded-full z-0" />

      {/* Foreground Content */}
      <div className="relative z-10">
        <CardCreation addCard={addCard} />

        {flashcards.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
              Your Flashcards
            </h2>
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {flashcards.map((card, index) => (
                <div
                  key={index}
                  className="relative w-full h-48 perspective cursor-pointer"
                  onClick={() => handleFlip(index)}
                >
                  <div className={`w-full h-full transition-transform duration-700 transform-style-preserve-3d ${flipped[index] ? 'rotate-y-180' : ''}`}>
                    <div className="flip-card-front absolute w-full h-full bg-violet-700 text-white flex items-center justify-center rounded-xl p-6 shadow-md">
                      {card.front}
                    </div>
                    <div className="flip-card-back absolute w-full h-full bg-blue-600 text-white flex items-center justify-center rounded-xl p-6 shadow-md rotate-y-180">
                      {card.back}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
