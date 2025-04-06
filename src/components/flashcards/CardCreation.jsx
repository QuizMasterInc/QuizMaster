import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const handleLogout = async () => {
    try {
      await logout();
      setLoading(true);
      localStorage.setItem('isAuthenticated', 'false');
      return <Navigate to="/signin" />;
    } catch {
      alert('Failed to logout');
    }
    setLoading(false);
  };


export default function CardCreation({ addCard }) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const handleFrontChange = (e) => setFront(e.target.value);
  const handleBackChange = (e) => setBack(e.target.value);

  const handleSubmit = () => {
    if (front.trim() !== '' && back.trim() !== '') {
      const newCard = { front, back };
      addCard(newCard); // Pass the new card to the parent component (Flashcards)
      setFront(''); // Reset the front input
      setBack('');  // Reset the back input
    } else {
      alert('Please fill in both the front and back text for the card.');
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 md:px-20 bg-black text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">Create a Flashcard Set</h1>

        <h2 className="text-3xl font-semibold mb-4">Add a Flashcard</h2>

        <div className="space-y-4">
          <input
            type="text"
            value={front}
            onChange={handleFrontChange}
            className="w-full p-3 text-black rounded-md"
            placeholder="Enter the front of the flashcard"
          />

          <input
            type="text"
            value={back}
            onChange={handleBackChange}
            className="w-full p-3 text-black rounded-md"
            placeholder="Enter the back of the flashcard"
          />
        </div>

        <div className="grid grid-cols-2 gap-6 mt-10">
          <button
            onClick={handleSubmit} // Trigger handleSubmit when the button is clicked
            className="bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-md font-semibold"
          >
            Add Flashcard
          </button>
        </div>
      </div>
    </div>
  );
}
