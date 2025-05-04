import React from 'react';
import { useCategory } from '../../contexts/CategoryContext';

const TimerLength = () => {
  const { duration, updateDuration } = useCategory();

  const handleChange = (e) => {
    const newVal = e.target.value;
    if (!isNaN(newVal) && newVal > 0) {
      updateDuration(newVal);
    }
  };

  return (
    <div className="text-center mt-6">
      <h2 className="text-2xl font-semibold text-purple-200 mb-2">Select Quiz Duration (In minutes)</h2>
      <input
        type="number"
        min="1"
        value={duration}
        onChange={handleChange}
        className="p-2 w-20 bg-gray-900 text-white rounded text-center border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </div>
  );
};

export default TimerLength;
