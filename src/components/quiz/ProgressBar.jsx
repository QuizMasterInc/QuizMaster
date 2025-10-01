import React from "react";

const ProgressBar = ({ answeredCount, totalQuestions }) => {
  // Handle division by zero to prevent NaN
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  const radius = 50; // Match timer radius
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (progress / 100) * circumference;
  
  // Use CSS variables for colors
  const barColor = answeredCount === totalQuestions ? "var(--success)" : "var(--accent)";
  const textColor = "var(--text-primary)";
  const backgroundColor = "var(--neutral-300)";

  return (
    <div className="flex justify-center w-full">
      <div className="text-center">
        <div className="relative inline-block">
          <svg width="120" height="120" className="transform -rotate-90">
            {/* Background circle */}
            <circle 
              cx="60" 
              cy="60" 
              r={radius} 
              stroke={backgroundColor} 
              strokeWidth="8" 
              fill="none" 
            />
            {/* Progress circle */}
            <circle 
              cx="60" 
              cy="60" 
              r={radius} 
              stroke={barColor} 
              strokeWidth="8" 
              fill="none" 
              strokeDasharray={circumference} 
              strokeDashoffset={strokeOffset} 
              style={{ transition: "stroke-dashoffset 0.5s ease-out" }} 
            />
          </svg>
          
          {/* Progress text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div 
              className="text-2xl font-bold"
              style={{ color: textColor }}
            >
              {answeredCount}/{totalQuestions}
            </div>
            <div className="text-xs text-secondary mt-1">
              Questions
            </div>
          </div>
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-secondary font-medium">
            Questions Answered
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;