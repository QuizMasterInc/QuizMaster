// VolumeContext.js
import React, { createContext, useState, useContext } from 'react';

const VolumeContext = createContext();

export const VolumeProvider = ({ children }) => {
  const [volume, setVolume] = useState(0.5); // Default volume level

  return (
    <VolumeContext.Provider value={{ volume, setVolume }}>
      {children}
    </VolumeContext.Provider>
  );
};

export const useVolume = () => useContext(VolumeContext);
