import React, { useState } from 'react';

const ThresholdInput = () => {
  const [threshold, setThreshold] = useState(30);

  const handleSliderChange = (e) => {
    setThreshold(Number(e.target.value));
  };

  return (
    <div className="p-6 rounded-lg bg-gradient-to-br from-purple-800 to-blue-800 shadow-lg text-white space-y-4">
      <h3 className="text-xl font-bold">Global Threshold</h3>
      <p className="text-sm text-gray-300">
        Adjust the global threshold level. This affects quiz behavior globally.
      </p>
      <div className="flex items-center justify-between gap-4">
        <input
          type="range"
          min="0"
          max="100"
          value={threshold}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
        />
        <span className="text-white font-semibold min-w-[50px] text-right">{threshold}%</span>
      </div>
    </div>
  );
};

export default ThresholdInput;
