// VolumeContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const VolumeContext = createContext();

export const VolumeProvider = ({ children }) => {
  // Initialize volume state, use stored value if available
  const [volume, setVolume] = useState(() => {
    const storedVolume = localStorage.getItem('volume');
    return storedVolume !== null ? parseFloat(storedVolume) : 1; // Default volume level
  });

  // Update localStorage when volume changes
  useEffect(() => {
    localStorage.setItem('volume', volume.toString());
  }, [volume]);

  return (
    <VolumeContext.Provider value={{ volume, setVolume }}>
      {children}
    </VolumeContext.Provider>
  );
};

export const useVolume = () => useContext(VolumeContext);
