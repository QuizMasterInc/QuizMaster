import React, { useState } from 'react';

const StarRating = ({ difficulty, selectDifficulty }) => {
  const [difficultyState, setDifficulty] = useState(0);

  const handleStarClick = (starIndex) => {
    let newDifficulty = starIndex + 1;
    if (newDifficulty === difficultyState) {

      // Toggle off all starts if clicking on the currently selected star
      newDifficulty = 0;
    }
    setDifficulty(newDifficulty);
    selectDifficulty(newDifficulty);
  };

  return (
    <div style={{ fontSize: '45px' }}>
      {[...Array(5)].map((_, index) => (
        <span
          key={index}
          style={{
            cursor: 'pointer',
            width: '55px',
            display: 'inline-block',
            textAlign: 'center',
            color: index < difficulty ? '#CCCCCC' : '#CCCCCC',
          }}
          onClick={() => handleStarClick(index)}
        >
          {index < difficultyState ? '⭐' : '☆'}
        </span>
      ))}
      {/* <p>Current rating: {difficultyState}</p> */}
      </div>
  );
};

export default StarRating;

