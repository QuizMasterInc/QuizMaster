// HighContrastToggle.jsx
import React, { useState } from 'react';

const HighContrastToggle = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  const toggleContrast = () => {
    setIsHighContrast(!isHighContrast);
    // Placeholder: You can add actual functionality here to change the theme.
  };

  return (
    <div className="mb-4 flex justify-center items-center">
      <label className="flex items-center cursor-pointer">
        <span className="mr-4 text-gray-200">High Contrast Mode</span>
        <div className="relative">
          <input 
            type="checkbox" 
            checked={isHighContrast} 
            onChange={toggleContrast} 
            className="sr-only" 
          />
          <div 
            className={`w-12 h-6 bg-gray-700 rounded-full ${isHighContrast ? 'bg-blue-500' : ''} transition-colors duration-200`}
          ></div>
          <div
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transform ${isHighContrast ? 'translate-x-6' : ''} transition-transform duration-200`}
          ></div>
        </div>
      </label>
    </div>
  );
};

export default HighContrastToggle;
