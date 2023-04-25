/**
 * This parent component will allow users to navigate to the various quizzes
 * based on the quiz category
 */
import React from 'react';
import { useCategory } from '../../contexts/CategoryContext';
import QuizSelectButton from './QuizSelectButton';
import RandomQuizButton from './RandomQuizButton';
import Random from '../icons/Random';
import { Link } from 'react-router-dom';

function SelectQuiz() {
  const {quizCategories, icons, destinations} = useCategory()
  const randomIndex = Math.floor(Math.random() * quizCategories.length);

  /**
   * View
   * This will generate each QuizSelectButton and the RandomQuizButton
   */
  return (
    <>
      <div className="flex flex-col items-center h-full mb-4 -xl:ml-20 -xl:w-3/4">
        <h2 className="text-2xl font-bold text-gray-300">Choose Your Quiz Category</h2>
        <div className="flex flex-wrap justify-center">
          {quizCategories.map((category, index) => (
            <QuizSelectButton category={category} key={index} icon={icons[index]} destination={destinations[index]}/>
          ))}
            <RandomQuizButton category={quizCategories[randomIndex]} icon={<Random/>} destination={destinations[randomIndex]}/>
        </div>
        <p className="text-sm text-gray-300 -sm:mt-4">
        Not finding the quiz you're looking for?{' '}
        </p>
        <Link to={'/contact'}>
          <p className='underline text-sm text-gray-300 -sm:mt-4'>Suggest a quiz</p>
        </Link>
      </div>
    </>
  );
};

export default SelectQuiz;