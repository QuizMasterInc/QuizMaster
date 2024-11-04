// GlobalThresholdInput.js
//This file is were the user can adjust thier GlobalThresholdInput parameter by entering a number to the input field
import React from 'react';
import { useVolumeSettings } from '../../contexts/VolumeContext';

const GlobalThresholdInput = () => {
  const { passThreshold, setPassThreshold } = useVolumeSettings();

  return (
    <div className="mb-4">
      <label htmlFor="globalThreshold" className="mr-2">Global Quiz Pass Threshold:</label>
      <input
        type="number"
        id="globalThreshold"
        min="0"
        max="100"
        value={passThreshold || ''} // Set value to 0 string if passThreshold is NaN
        onChange={(e) => {
            const newValue = parseInt(e.target.value);
            console.log('Global threshold changed:', newValue); // Log the new global threshold value
            if (!isNaN(newValue)) { // Check if newValue is a valid number
            setPassThreshold(newValue);
            } else {
            setPassThreshold(''); // If not a number, set passThreshold to empty string
            }
        }}
        className="bg-gray-800 text-white p-2 rounded"
        />
      <span className="ml-2">%</span>
    </div>
  );
};

export default GlobalThresholdInput;
