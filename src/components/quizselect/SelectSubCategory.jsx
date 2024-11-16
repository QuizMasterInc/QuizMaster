/**
 * This parent component will allow users to navigate to the various quizzes
 * based on the quiz category
 */
import React, { useState } from 'react';
import { useCategory } from '../../contexts/CategoryContext';
import SubCategoryButton from './SubCategoryButton';
import QuizStartButton from './QuizStartButton';
import { Link } from 'react-router-dom';
import QuizBackButton from './QuizBackButton';
import StarRating from './DifficultyRating';
import QuestionAmount from './QuestionAmount';
import ShowTime from './ShowTimeButton';
import TimerLegnth from './TimerLength';
import ShowPauseButton from './ShowPauseButton';

function SelectSub() {

  const {quizSubcategories, category, toggleSubcategory, subcategories, difficulty, selectDifficulty, amount, selectAmount, duration, updateDuration, showTimer, toggleTimerVisibility,showPauseButton, togglePauseButtonVisibility } = useCategory()




  console.log('Category: ', category)
  console.log('SubCategories: ', quizSubcategories)
  console.log('Subs: ', subcategories)
  
  //const availbleSubcategories = subcategories
  const availbleSubcategories = quizSubcategories[category.toLowerCase()]
  console.log('Available: ', availbleSubcategories)
  
  /**
   * Select subcategory page
   */
  return (
    <>
      <div className="flex flex-col items-center h-full mb-4 -xl:ml-20 -xl:w-3/4">
      <h1 className="text-2xl font-bold text-gray-300">Category: {category}</h1> {/*This line displays the category you are about to take a quiz for*/}
        <h2 className="text-2xl font-bold text-gray-300">Choose Sub-Categories</h2>
        <div className="flex flex-wrap justify-center">
          {/*This displays the available subcategories based on the category selected*/}
          {availbleSubcategories.map((category) => (
            <SubCategoryButton category={category} toggleSubcategory={toggleSubcategory} isSelected={true}/>
          ))}
          
        </div>
        <h2 className="text-2xl font-bold text-gray-300">Select Difficulty</h2>
        <div>
        <StarRating difficulty={difficulty} selectDifficulty={selectDifficulty}/>
        </div>  
        <h2 className="text-2xl font-bold text-gray-300">Select Amount of Questions</h2>
        <div>
        <QuestionAmount min={1} max={10} amount={amount} selectAmount={selectAmount}/>
        </div>      
        {/* Timer visibility toggle */}
        <ShowTime toggleTimerVisibility={toggleTimerVisibility} showTimer={showTimer} />

        {/* Conditionally render ShowPauseButton if the timer is toogled to yes */}
        {showTimer && <ShowPauseButton togglePauseButtonVisibility={togglePauseButtonVisibility} showPauseButton={showPauseButton} />}
  
        {/* Conditionally render TimerLength if the timer is toogled to yes */}
        {showTimer && <TimerLegnth duration={duration} updateDuration={updateDuration} />} 

        <div className='flex justify-center items-center w-1/2 p-4 text-center -sm:p-1'>
          { subcategories.length > 0 && (<QuizStartButton category={"Start"} destination={"quizstarted"}/>)}
          <QuizBackButton />
        </div>
      </div>
    </>
  );
};

export default SelectSub;