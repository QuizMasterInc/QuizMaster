// BackGroundMusicControl.jsx
//This creates the field area where the user can choose how lud they want thier sound effects to be
import React from 'react';
import { useVolumeSettings } from '../../contexts/VolumeContext';

const BackGroundMusicControl = () => {
  const { backgroundMusicVolume, updateBackgroundMusicVolume } = useVolumeSettings();

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    console.log('Background Music Volume changed:', newVolume); // Log the new volume value   
    updateBackgroundMusicVolume(newVolume);
  };

  return (
    <div>
      <label htmlFor="volume">Background Music Volume: </label>
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
  );
};

export default BackGroundMusicControl;
