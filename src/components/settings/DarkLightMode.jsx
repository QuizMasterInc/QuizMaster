import React, { useEffect, useState } from 'react';

const DarkLightMode = () => {
  const [mode, setMode] = useState('dark');

  useEffect(() => {
    document.body.classList.remove('dark-mode', 'light-mode');
    document.body.classList.add(`${mode}-mode`);
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="p-6 rounded-lg bg-gradient-to-br from-purple-800 to-blue-800 shadow-lg text-white space-y-4">
      <h3 className="text-xl font-bold">Dark / Light Mode</h3>
      <p className="text-sm text-gray-300">Toggle the theme for your experience.</p>
      <button
        onClick={toggleMode}
        className="px-4 py-2 rounded-md font-semibold transition bg-white text-gray-900 hover:bg-gray-100"
      >
        Switch to {mode === 'dark' ? 'Light' : 'Dark'} Mode
      </button>
    </div>
  );
};

export default DarkLightMode;
