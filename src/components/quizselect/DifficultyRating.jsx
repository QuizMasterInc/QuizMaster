import React, { useState } from 'react';

const StarRating = ({difficulty, selectDifficulty}) => {
  const [clicked, setClicked] = useState(false);
  const handleHover = (index) => {
    selectDifficulty(index + 1)
  }

  const handleClick = (index) => {
    selectDifficulty(index + 1)
    if (!clicked) {
      setClicked(true)
    } else {
      setClicked(false)
    }
    
  }
  const resetRating = () => {
    if (!clicked) {
      setClicked(false)
      selectDifficulty(-1)
    }
  }
  return (
    <div onMouseLeave={resetRating}>
      {[...Array(5)].map((_, index) => (
        <span
          key={index}          
          className={`${index < difficulty ? 'checked' : ''}`}
          onMouseEnter={() => handleHover(index)}
          onClick={() => handleClick(index)}
          style={{ 
            fontSize: '48px',
            color: index < difficulty ? 'gold' : 'black',
            userSelect: 'none'
           }} 
        >
          &#9733; {/* Unicode character for a star (★) */}
        </span>
      ))}
    </div>
  )
}

export default StarRating;