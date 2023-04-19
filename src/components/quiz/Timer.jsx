import { useState, useEffect } from "react";

function Timer(props) {
  const { timeLimit, onStopTimer, timerFinished  } = props;
  
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  useEffect(() => {
    let timer = null;

    if (timeLeft === 0 ||timerFinished) {
        
      onStopTimer();
      
    } else if (props.loading == false) {
       timer = setTimeout(() => {
        console.log(props.loading)
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
   
  }, [timeLeft, onStopTimer,props.loading]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;


  return (
    <div className="timer">
      {minutes}:{seconds < 10 ? "0" : ""}
      {seconds}
    </div>
  );
}

export default Timer;
