// This file will create a progress bar that will be displayed during the quiz showing the progress of the quiz
import React from "react";

const ProgressBar = ({ answeredCount, totalQuestions }) => {
  const progress = (answeredCount / totalQuestions) * 100;
  const radiusX = 45;
  const radiusY = 15;
  const circumference = 2 * Math.PI * Math.sqrt((radiusX ** 2 + radiusY ** 2) / 2);
  const strokeOffset = circumference - (progress / 100) * circumference;
  const barColor = answeredCount === totalQuestions ? "green" : "#3b5b8d";
  const textColor = answeredCount === totalQuestions ? "green" : "#fff";

  return (
    <svg width="110" height="40" viewBox="0 0 110 40" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto' }}>
      <ellipse cx="55" cy="20" rx={radiusX} ry={radiusY} stroke="transparent" strokeWidth="6" fill="none" />
      <ellipse 
        cx="55" 
        cy="20" 
        rx={radiusX} 
        ry={radiusY} 
        stroke={barColor} 
        strokeWidth="6" 
        fill="none" 
        strokeDasharray={circumference} 
        strokeDashoffset={strokeOffset} 
        style={{ transition: "stroke-dashoffset 0.5s ease-out" }} 
      />
      <text x="50%" y="50%" textAnchor="middle" fill={textColor} fontSize="16" fontWeight="bold" dy=".3em">
        {`${answeredCount} / ${totalQuestions}`}
      </text>
    </svg>
  );
};

export default ProgressBar;
