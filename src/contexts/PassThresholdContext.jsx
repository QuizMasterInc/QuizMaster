// PassThresholdContext.js
import React, { createContext, useState, useEffect } from 'react';

const PassThresholdContext = createContext();

export const PassThresholdProvider = ({ children }) => {
  const [passThreshold, setPassThresholdState] = useState(() => {
    // Check if there's a saved threshold in localStorage
    const savedThreshold = localStorage.getItem('passThreshold');
    return savedThreshold ? parseInt(savedThreshold, 10) : 90; // Default threshold is 90
  });

  const setPassThreshold = (value) => {
    // Update the threshold state
    setPassThresholdState(value);
    // Save the new threshold to localStorage
    localStorage.setItem('passThreshold', value.toString());
  };

  return (
    <PassThresholdContext.Provider value={{ passThreshold, setPassThreshold }}>
      {children}
    </PassThresholdContext.Provider>
  );
};

export const usePassThreshold = () => React.useContext(PassThresholdContext);
