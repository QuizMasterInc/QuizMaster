/**
 * This is the timer that gets mounted in the QuizActivity component
 * This determines how long the user has left in their quiz 
 */
import { useState, useEffect } from "react";

function Timer({ timeLimit, onStopTimer, timerFinished, showTimer, loading , showPauseButton}) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isPaused, setIsPaused] = useState(false);
  const [halfTimeAlert, setHalfTimeAlert] = useState(false);
  const [lowTimeAlert, setLowTimeAlert] = useState(false);

  const halfTimeLimit = timeLimit / 2; // Sets the half-time threshold
  const lowTimeLimit = timeLimit * 0.2; // Set 20% left threshold

  useEffect(() => {
    let timer = null;

    if (timeLeft === 0 || timerFinished) {
      onStopTimer();
    } else if (!isPaused && !loading) {
      timer = setTimeout(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }

    if (timeLeft <= halfTimeLimit && !halfTimeAlert) {
      alert("Half of the Time Remains");
      setHalfTimeAlert(true);
    }

    if (timeLeft <= lowTimeLimit && !lowTimeAlert) {
      alert("Time is Nearly Up!");
      setLowTimeAlert(true);
    }

    return () => clearTimeout(timer);
  }, [timeLeft, isPaused, onStopTimer, loading, halfTimeAlert, halfTimeLimit, lowTimeAlert, lowTimeLimit]);

  const handlePauseToggle = () => {
    setIsPaused((prev) => !prev);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = (timeLeft / timeLimit) * circumference;

  return (
    <div style={{position: 'relative', zIndex: 1}}>
      {isPaused && (
        <div style={{
          position:'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', //Adds a semi-transparent overlay
          backdropFilter: 'blur(5px)', //Adds a blurring effect
          zIndex: 5, //Lower z-index allows timer button to still be visible
        }} />
      )}
      <div>
      </div>
      <div style={{ display: showTimer ? 'block' : 'none', position: 'relative', width: '120px', height: '120px', zIndex: 10 }}>
        <svg width="120" height="120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={timeLeft <= lowTimeLimit ? 'red' : timeLeft <= halfTimeLimit ? 'orange' : 'white'}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - offset} 
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div
          className="timer"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: timeLeft <= lowTimeLimit ? 'red' : timeLeft <= halfTimeLimit ? 'orange' : 'white',
            fontSize: '24px',
          }}
        >
          {minutes}:{seconds < 10 ? "0" : ""}
          {seconds}
        </div>
        <div style={{ marginTop: '10px', position: 'relative', zIndex: 10 }}>
        {showPauseButton && (<button onClick={handlePauseToggle}> {isPaused ? "Resume" : "Pause"}</button>)}
        </div>
      </div>
    </div>
  );
}

export default Timer;
