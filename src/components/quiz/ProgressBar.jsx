// This file will create a progress bar that will be displayed during the quiz showing the progress of the quiz
import React from "react";

const ProgressBar = ({answeredCount, totalQuestions }) => {
    return (
      <div className="progress-bar">
        {/* Display current progress */}
        <div className="progress-text">
          Questions {answeredCount} of {totalQuestions}
        </div>
      </div>
    );
  };
  
  export default ProgressBar;