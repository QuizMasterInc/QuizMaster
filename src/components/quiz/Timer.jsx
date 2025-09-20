/**
 * This is the timer that gets mounted in the QuizActivity component
 * This determines how long the user has left in their quiz 
 */
import { useState, useEffect } from "react";

function Timer({ duration, onFinish, timerFinished, showTimer = true, loading , showPause}) {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert minutes to seconds
  const [isPaused, setIsPaused] = useState(false);
  const [halfTimeAlert, setHalfTimeAlert] = useState(false);
  const [lowTimeAlert, setLowTimeAlert] = useState(false);

  const lowTimeLimit = 30; // 30 seconds warning only

  useEffect(() => {
    let timer = null;

    if (timeLeft === 0 || timerFinished) {
      onFinish();
    } else if (!isPaused && !loading) {
      timer = setTimeout(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }

    if (timeLeft <= lowTimeLimit && !lowTimeAlert) {
      alert("30 seconds remaining!");
      setLowTimeAlert(true);
    }

    return () => clearTimeout(timer);
  }, [timeLeft, isPaused, onFinish, loading, lowTimeAlert, lowTimeLimit]);

  const handlePauseToggle = () => {
    setIsPaused((prev) => !prev);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  // Prevent NaN by ensuring duration is valid - convert to seconds for calculation
  const totalTimeInSeconds = duration * 60;
  const offset = totalTimeInSeconds > 0 ? (timeLeft / totalTimeInSeconds) * circumference : 0;

  // Determine colors based on time remaining
  const getTimerColor = () => {
    if (timeLeft <= 30) return 'var(--error)'; // Only red for last 30 seconds
    return 'var(--accent)';
  };

  const getTextColor = () => {
    if (timeLeft <= 30) return 'var(--error)'; // Only red text for last 30 seconds
    return 'var(--text-primary)';
  };

  return (
    <div className="relative">
      {isPaused && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
        />
      )}
      
      <div 
        className={`relative z-50 text-center ${showTimer ? 'block' : 'hidden'}`}
      >
        <div className="relative inline-block">
          <svg width="120" height="120" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="var(--neutral-300)"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke={getTimerColor()}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - offset} 
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
            />
          </svg>
          
          {/* Timer text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className="text-2xl font-bold font-mono"
              style={{ color: getTextColor() }}
            >
              {minutes}:{seconds < 10 ? "0" : ""}{seconds}
            </div>
            <div className="text-xs text-secondary mt-1">
              Time Left
            </div>
            
            {/* Pause/Resume Button - inside timer */}
            {showPause && (
              <button 
                onClick={handlePauseToggle}
                className="mt-2 px-2 py-1 text-xs bg-[var(--neutral-200)] text-black rounded font-medium transition-all duration-200 hover:bg-[var(--neutral-300)]"
              >
                {isPaused ? "▶" : "⏸"}
              </button>
            )}
          </div>
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-secondary font-medium">
            Time Remaining
          </p>
        </div>
      </div>
    </div>
  );
}

export default Timer;