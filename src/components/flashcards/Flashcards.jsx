import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CardCreation from './CardCreation.jsx';
import { useAuth } from '../../contexts/AuthContext';
import './Flashcards.css'; // Make sure you have the flip effect styles here

export default function Flashcards() {
  const [flashcards, setFlashcards] = useState([]); // Store flashcards
  const [flipped, setFlipped] = useState([]); // Track which cards are flipped

  const navigate = useNavigate()
  
  const addCard = (newCard) => {
    setFlashcards([...flashcards, newCard]);
    setFlipped([...flipped, false]); // Ensure the new card starts face down
  };

  const handleFlip = (index) => {
    const newFlipped = [...flipped];
    newFlipped[index] = !newFlipped[index]; // Toggle flip state for the card
    setFlipped(newFlipped);
  };

  return (
    <div className="flashcards-container">
      <CardCreation addCard={addCard} /> {/* Pass addCard function to CardCreation */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {flashcards.map((flashcard, index) => (
          <div
            key={index}
            className="relative w-full h-40 p-6 bg-gray-800 rounded-md cursor-pointer"
            onClick={() => handleFlip(index)} // Flip the card when clicked
          >
            <div
              className={`absolute w-full h-full bg-gray-800 text-white p-4 flex justify-center items-center rounded-md transition-all duration-500 ease-in-out transform ${
                flipped[index] ? 'flip-card-back' : 'flip-card-front'
              }`}
            >
              {flipped[index] ? flashcard.back : flashcard.front}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}