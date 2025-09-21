import { useState } from 'react';

const StarRating = ({ difficulty, selectDifficulty }) => {
  const [difficultyState, setDifficulty] = useState(0);

  const handleStarClick = (starIndex) => {
    let newDifficulty = starIndex + 1;
    if (newDifficulty === difficultyState) {
      newDifficulty = 0;
    }
    setDifficulty(newDifficulty);
    selectDifficulty(newDifficulty);
  };

  return (
    <div className='flex justify-center text-5xl'>
      {[...Array(5)].map((_, index) => (
        <span
          key={index}
          className={`cursor-pointer ${
            index < difficultyState ? 'text-gradient-primary' : 'var(--neutral-300)'
          }`}
          onClick={() => handleStarClick(index)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;