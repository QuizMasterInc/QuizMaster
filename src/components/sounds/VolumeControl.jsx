import React from 'react';
import { useVolume } from './VolumeContext';

const VolumeControl = () => {
  const { volume, setVolume } = useVolume();

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
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
