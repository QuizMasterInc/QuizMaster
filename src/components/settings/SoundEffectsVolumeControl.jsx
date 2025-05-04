import React, { useState, useEffect } from 'react';

const SoundEffectsVolumeControl = () => {
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('soundEffectsVolume');
    return saved ? parseFloat(saved) : 0.5;
  });

  useEffect(() => {
    localStorage.setItem('soundEffectsVolume', volume);
  }, [volume]);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  return (
    <div className="p-6 rounded-lg bg-gradient-to-br from-purple-700 to-blue-700 shadow-xl text-white space-y-4">
      <h3 className="text-xl font-bold">Sound Effects Volume</h3>
      <p className="text-sm text-gray-300">Adjust the volume of interface sounds.</p>
      <div className="flex items-center space-x-4">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-full accent-pink-500"
        />
        <span className="w-12 text-right text-gray-100">{Math.round(volume * 100)}%</span>
      </div>
    </div>
  );
};

export default SoundEffectsVolumeControl;
