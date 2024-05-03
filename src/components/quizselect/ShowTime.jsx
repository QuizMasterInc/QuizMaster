import React, { useState } from "react";
export let showTimer;

function TimerButton() {
    const [localShowTimer, setLocalShowTimer] = useState(showTimer);

  const handleToggleTimer = () => {
    showTimer = !showTimer;
    setLocalShowTimer(showTimer);
  };
  

  return (
    <div>
      <button
        onClick={handleToggleTimer}
        className="bg-gray-900 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
      >
        {localShowTimer ? "Hide Time" : "Show Time"}
      </button>
    </div>
  );
}

export default TimerButton;