import { useState } from 'react'
import QuizSelectButton from './QuizSelectButton';
import Book from '../icons/Book';

function SelectQuiz() {
  const [quizCategories, icons, destinations] = useState([
    'History',
    'Geography',
    'Science',
    'Sports',
    'Entertainment',
    'Mathematics'
  ],
    <Book className={"w-10 h-10 fill-gray-300"}/>,
    
  );

  return (
    <div className="flex flex-col items-center h-full">
      <div className="w-3/4 mb-10">
        <h2 className="text-2xl font-bold text-gray-300">Choose Your Quiz Category</h2>
        <div className="flex flex-wrap">
          {quizCategories.map((category, index) => (
            <QuizSelectButton category={category} index={index} icon={<Book className={"w-10 h-10 fill-gray-300"}/>} destination={'/'}/>
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