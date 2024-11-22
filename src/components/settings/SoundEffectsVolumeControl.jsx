// VolumeControl.jsx
//This creates the field area where the user can choose how loud they want thier sound effects to be
import React from 'react';
import { useVolumeSettings } from '../../contexts/VolumeContext';

const VolumeControl = () => {
  const { volume, setVolume } = useVolumeSettings();

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    console.log('Volume changed:', newVolume); // Log the new volume value   
    setVolume(newVolume);
  };

  return (
    <div>
      <label htmlFor="volume">Sound Effects Volume: </label>
      <input
        type="range"
        id="volume"
        name="volume"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={handleVolumeChange}
      />
      <span>{(volume * 100).toFixed(0)}%</span>
    </div>
  );
};

export default VolumeControl;
