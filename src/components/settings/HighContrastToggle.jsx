import React, { useState, useEffect } from 'react';

const HighContrastToggle = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('high-contrast', isHighContrast);
  }, [isHighContrast]);

  const toggleContrast = () => {
    setIsHighContrast((prev) => !prev);
  };

  return (
    <div className="p-6 rounded-lg bg-gradient-to-br from-indigo-800 to-purple-700 shadow-lg text-white space-y-4">
      <h3 className="text-xl font-bold">High Contrast Mode</h3>
      <p className="text-sm text-gray-300">Improve visibility with a high contrast color scheme.</p>
      <button
        onClick={toggleContrast}
        className="px-4 py-2 rounded-md font-semibold transition bg-white text-gray-900 hover:bg-gray-100"
      >
        {isHighContrast ? 'Disable' : 'Enable'} High Contrast
      </button>
    </div>
  );
};

export default HighContrastToggle;
