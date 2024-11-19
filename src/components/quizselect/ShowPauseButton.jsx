import React from 'react';

function ShowPauseButton({ togglePauseButtonVisibility, showPauseButton }) {
  return (
    <div className="flex items-center my-4 p-3 bg-gray-800 rounded-md shadow-md transition-all duration-300 hover:bg-gray-700">
      <label 
        htmlFor="show-timer" 
        className="text-gray-200 mr-3 font-semibold cursor-pointer"
      >
        Show Pause Button
      </label>
      <input 
        id="show-timer"
        type="checkbox" 
        checked={showPauseButton} 
        onChange={togglePauseButtonVisibility}
        className="form-checkbox h-5 w-5 text-indigo-600 focus:ring-indigo-500 focus:ring-2"
      />
      <span 
        className="ml-3 text-gray-400 text-sm"
        title="Toggle to show or hide the Pause Button."
      >
        {showPauseButton ? 'Pause Button is visible' : 'Pause Button is hidden'}
      </span>
    </div>
  );
}

export default ShowPauseButton;
