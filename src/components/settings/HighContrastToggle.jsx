import React, { useState, useEffect } from 'react';

const HighContrastToggle = () => {
  const [isHighContrast, setIsHighContrast] = useState(() => {
    // Check localStorage for saved state on initial render
    return localStorage.getItem('isHighContrast') === 'true';
  });

  const toggleContrast = () => {
    setIsHighContrast(prevState => !prevState);
  };

  // Effect to add/remove high-contrast class based on isHighContrast state
  useEffect(() => {
    if (isHighContrast) {
      document.body.classList.add('high-contrast');
      localStorage.setItem('isHighContrast', 'true');  // Save state to localStorage
    } else {
      document.body.classList.remove('high-contrast');
      localStorage.setItem('isHighContrast', 'false'); // Save state to localStorage
    }
  }, [isHighContrast]);

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
            className={`w-12 h-6 rounded-full transition-colors duration-200 ${isHighContrast ? 'bg-blue-500' : 'bg-gray-700'}`}
          ></div>
          <div
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transform transition-transform duration-200 ${isHighContrast ? 'translate-x-6' : ''}`}
          ></div>
        </div>
        <span className={`ml-4 text-sm font-semibold ${isHighContrast ? 'text-blue-500' : 'text-gray-400'}`}>
          {isHighContrast ? 'On' : 'Off'}
        </span>
      </label>
    </div>
  );
};

export default HighContrastToggle;
