/**
 * This is the timer that gets mounted in the QuizActivity component
 * This determines how long the user has left in their quiz 
 */
import { useState, useEffect } from "react";
import { showTimer } from "../../components/quizselect/ShowTime";

function Timer(props) {
  const { timeLimit, onStopTimer, timerFinished } = props;

  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timer = null;

    if (timeLeft === 0 || timerFinished) {
      // Call the onStopTimer function to notify the parent component
      onStopTimer();
    } else if (!isPaused && props.loading === false) {
      // If loading is done and not paused, set up a timer that decrements timeLeft by 1 every second
      timer = setTimeout(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }

    return () => clearTimeout(timer);
  }, [timeLeft, isPaused, onStopTimer, props.loading]);

  const handlePauseToggle = () => {
    setIsPaused((prev) => !prev);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div style={{ display: showTimer ? 'block' : 'none' }}>
      <div className="timer">
        {minutes}:{seconds < 10 ? "0" : ""}
        {seconds}
      </div>
      <div style={{ marginTop: '10px' }}>
        <button onClick={handlePauseToggle}>
          {isPaused ? "Resume" : "Pause"}
        </button>
      </div>
    </div>
  );
}

export default Timer;
