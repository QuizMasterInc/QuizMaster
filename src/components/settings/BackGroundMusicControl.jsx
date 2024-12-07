// BackGroundMusicControl.jsx
//This creates the field area where the user can choose how lud they want thier sound effects to be
import React, { useState } from 'react';
import { useVolumeSettings } from '../../contexts/VolumeContext';

const BackGroundMusicControl = () => {
  const { backgroundMusicVolume, updateBackgroundMusicVolume } = useVolumeSettings();
  const [selectedMusic, setSelectedMusic] = useState('');

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    updateBackgroundMusicVolume(newVolume);
    console.log('Background Music Volume changed:', newVolume);
  };

  const handleMusicChange = (e) => {
    const selectedTrack = e.target.value;
    setSelectedMusic(selectedTrack);
    console.log('Selected Music:', selectedTrack);

    if (selectedTrack) {
      const audio = new Audio(`/SoundAssets/BackGroundMusic/${selectedTrack}`);
      audio.volume = backgroundMusicVolume;
      audio.play();
    }
  };

  const musicOptions = [
    { label: 'Select a Track', value: '' },
    { label: 'Mozart Piano Concerto No. 21', value: 'Mozart_Piano_Concerto_No_21.mp3' },
    { label: 'Mozart Serenade in G major', value: 'Mozart-Serenade-in-G-major.mp3' },
    { label: 'Mozart Sonata No. 3 in B-flat', value: 'Mozart-Sonata-No-3-In-B-Flat.mp3' },
  ];

  return (
    <div>
      {/* Volume Control */}
      <div className="mb-4">
        <label htmlFor="volume">Background Music Volume:</label>
        <input
          type="range"
          id="volume"
          name="volume"
          min="0"
          max="1"
          step="0.01"
          value={backgroundMusicVolume}
          onChange={handleVolumeChange}
        />
        <span>{(backgroundMusicVolume * 100).toFixed(0)}%</span>
      </div>

      {/* Music Selection Dropdown */}
      <div className="mt-4">
        <label htmlFor="music-dropdown">Choose Background Music:</label>
        <select
          id="music-dropdown"
          value={selectedMusic}
          onChange={handleMusicChange}
          className="block w-full bg-gray-800 text-gray-300 rounded-md p-2"
        >
          {musicOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="mt-2">
          {selectedMusic
            ? `Now playing: ${musicOptions.find((option) => option.value === selectedMusic)?.label}`
            : 'No music selected'}
        </p>
      </div>
    </div>
  );
};

export default BackGroundMusicControl;
