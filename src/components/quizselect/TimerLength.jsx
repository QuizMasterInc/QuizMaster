// TimerLegnth.jsx
import React from 'react';
import { useCategory } from '../../contexts/CategoryContext';

const TimerLegnth = () => {
  const { duration, updateDuration } = useCategory(); // Get duration and update function from context

  const handleDurationChange = (event) => {
    const newDuration = event.target.value;
    if (!isNaN(newDuration) && newDuration > 0) {
      updateDuration(newDuration); // Update duration using the context function
    }
  };

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold text-gray-300">Select Quiz Duration (In minutes)</h2>
      <input
        type="number"
        min="1"
        className="mt-2 p-2 w-16 bg-gray-900 text-white rounded"
        value={duration}
        onChange={handleDurationChange}
      />
    </div>
  );
};

export default TimerLegnth;
