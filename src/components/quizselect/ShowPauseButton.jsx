import React from 'react';

function ShowPauseButton({ togglePauseButtonVisibility, showPauseButton }) {
  return (
    <div className="flex items-center p-4 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg">
      <label className="text-white font-semibold mr-4">Show Pause Button</label>
      <input
        type="checkbox"
        checked={showPauseButton}
        onChange={togglePauseButtonVisibility}
        className="form-checkbox h-5 w-5 text-white border-white focus:ring-white"
      />
      <span className="ml-4 text-white text-sm">
        {showPauseButton ? 'Pause Button is visible' : 'Pause Button is hidden'}
      </span>
    </div>
  );
}

export default ShowPauseButton;
