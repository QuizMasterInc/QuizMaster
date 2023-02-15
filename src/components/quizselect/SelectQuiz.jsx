import { useState } from 'react'
import QuizSelectButton from './QuizSelectButton';
import Book from '../icons/Book';
import World from '../icons/World';
import FlaskVial from '../icons/FlaskVial';
import Basketball from '../icons/Basketball';
import Ticket from '../icons/Ticket';
import Calculator from '../icons/Calculator';

function SelectQuiz() {
  const [quizCategories] = useState([
    'History',
    'Geography',
    'Science',
    'Sports',
    'Entertainment',
    'Mathematics'
  ]);

  const [icons] = useState([
    <Book className={"w-10 h-10 fill-gray-300"}/>,
    <World className={"w-10 h-10 fill-gray-300"}/>,
    <FlaskVial className={"w-10 h-10 fill-gray-300"}/>,
    <Basketball className={"w-10 h-10 fill-gray-300"}/>,
    <Ticket className={"w-10 h-10 fill-gray-300"}/>,
    <Calculator className={"w-10 h-10 fill-gray-300"}/>
  ]);

  const [destinations] = useState([
    'history',
    'geography',
    'science',
    'sports',
    'entertainment',
    'mathematics'
  ]);

  return (
    <div className="flex flex-col items-center h-full">
      <div className="w-3/4 mb-10">
        <h2 className="text-2xl font-bold text-gray-300">Choose Your Quiz Category</h2>
        <div className="flex flex-wrap">
          {quizCategories.map((category, index) => (
            <QuizSelectButton category={category} key={index} icon={icons[index]} destination={destinations[index]}/>
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-300">
        Not finding the quiz you're looking for?{' '}
        <a href="" className="text-gray-300 underline">
          Suggest a quiz
        </a>
      </p>
    </div>
  );
};

export default SelectQuiz;