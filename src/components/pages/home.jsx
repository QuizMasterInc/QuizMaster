import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)
  const [quizCategories, setQuizCategories] = useState([
    'History',
    'Geography',
    'Science',
    'Sports',
    'Entertainment'
  ]);

  return (
    <div className="flex flex-col items-center h-full bg-gray-100">
      <h1 className="text-5xl font-bold text-gray-800 mt-10">Welcome to QuizMaster</h1>
      <p className="text-xl text-gray-600 mb-10">The ultimate destination for all your quiz needs.</p>
      <div className="w-3/4 mb-10">
        <h2 className="text-2xl font-bold text-gray-800">Choose Your Quiz Category</h2>
        <ul className="flex flex-wrap">
          {quizCategories.map((category, index) => (
            <li key={index} className="w-1/2 text-center p-4">
              <a
                href="#"
                className="block p-4 rounded-lg bg-white shadow-lg hover:shadow-xl hover:bg-gray-200"
              >
                {category}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-sm text-gray-600">
        Not finding the quiz you're looking for?{' '}
        <a href="#" className="text-gray-800 underline">
          Suggest a quiz
        </a>
      </p>
    </div>
  );
};

export default App
