// VolumeConext.js

/*
This context will share the volume settings/state with any child component 
*/
import React, { createContext, useState, useEffect } from 'react';

const VolumeSettingsContext = createContext();

export const VolumeSettingsProvider = ({ children }) => {
  // Pass threshold state
  const [passThreshold, setPassThresholdState] = useState(() => {
    const savedThreshold = localStorage.getItem('passThreshold');
    return savedThreshold ? parseInt(savedThreshold, 10) : 90; // Default threshold is 90
  });

  // Volume sound effects state
  const [volume, setVolumeState] = useState(() => {
    const storedVolume = localStorage.getItem('volume');
    return storedVolume !== null ? parseFloat(storedVolume) : 1; // Default volume level
  });

   // Background music volume state
   const [backgroundMusicVolume, setBackgroundMusicVolume] = useState(() => {
    const storedVolume = localStorage.getItem('backgroundMusicVolume');
    return storedVolume !== null ? parseFloat(storedVolume) : 1; // Default volume level
  });

  // Set pass threshold
  const setPassThreshold = (value) => {
    setPassThresholdState(value);
    localStorage.setItem('passThreshold', value.toString());
  };

  // Set Sound effects volume
  const setVolume = (value) => {
    setVolumeState(value);
    localStorage.setItem('volume', value.toString());
  };

    // Set background music volume
    const updateBackgroundMusicVolume = (value) => {
      setBackgroundMusicVolume(value);
      localStorage.setItem('backgroundMusicVolume', value.toString());
    };

  // Provide both passThreshold and volume settings through the context
  return (
    <VolumeSettingsContext.Provider value={{ passThreshold, setPassThreshold, volume, setVolume, backgroundMusicVolume, updateBackgroundMusicVolume  }}>
      {children}
    </VolumeSettingsContext.Provider>
  );
};

export const useVolumeSettings = () => React.useContext(VolumeSettingsContext);
