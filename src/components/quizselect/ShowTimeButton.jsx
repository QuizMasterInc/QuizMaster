import React from 'react';

function ShowTime({ toggleTimerVisibility, showTimer }) {
  return (
    <div className="flex items-center p-4 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg">
      <label className="text-white font-semibold mr-4">Show Timer</label>
      <input
        type="checkbox"
        checked={showTimer}
        onChange={toggleTimerVisibility}
        className="form-checkbox h-5 w-5 text-white border-white focus:ring-white"
      />
      <span className="ml-4 text-white text-sm">
        {showTimer ? 'Timer is visible' : 'Timer is hidden'}
      </span>
    </div>
  );
}

export default ShowTime;
