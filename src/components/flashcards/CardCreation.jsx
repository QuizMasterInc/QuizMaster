import React, { useState } from 'react';

export default function CardCreation({ addCard }) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const handleFrontChange = (e) => setFront(e.target.value);
  const handleBackChange = (e) => setBack(e.target.value);

  const handleSubmit = () => {
    if (front.trim() !== '' && back.trim() !== '') {
      addCard({ front, back });
      setFront('');
      setBack('');
    } else {
      alert('Please fill in both the front and back of the flashcard.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#1b1444] border border-violet-700 rounded-2xl p-8 shadow-lg">
      <h1 className="text-3xl font-bold text-white mb-6 text-center">
        Create a Flashcard
      </h1>

      <div className="space-y-4">
        <input
          type="text"
          value={front}
          onChange={handleFrontChange}
          placeholder="Front text"
          className="w-full p-4 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={back}
          onChange={handleBackChange}
          placeholder="Back text"
          className="w-full p-4 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 text-white font-semibold py-3 rounded-lg shadow-md transition"
        >
          Add Flashcard
        </button>
      </div>
    </div>
  );
}
