import { useState } from 'react'
import Logo from "../icons/logo.jpg";
import Student from "../icons/student.jpg";
import Quiz from "../icons/quiz.png";


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
    <div className="bg-gray-800 shadow-lg hover:shadow-x text-gray-300 pt-12">
      <div className='flex'>
      <div className="flex justify-center items-center w-1/2">
        <img src={Logo} alt="logo" className="mx-auto w-76 h-64" />
      </div>
      <div class="w-1/2 ">
      <h1 className="text-5xl font-bold text-gray-300 mt-10 ">Welcome to QuizMaster</h1>
      <p className="text-2xl text-gray-300 mb-10 pt-8">The ultimate destination for all your quiz needs.</p>
      </div>
      </div>
      <div className='flex'>
        <div className="flex justify-center items-center w-1/2">
          <h1 className="text-3xl font-bold text-gray-300 mt-10 pl-8">Subjects ranging from Mathematics, Science, English, and More!</h1>
          <p className="text-2xl text-gray-300 mt-10 pl-8 ">The Perfect Quiz Taking Applicaiton for both Students and Teachers!</p>
        </div>
        <div class="w-1/2 ">
          <div className="flex justify-center items-center ">
          <img src={Student} alt="student" className="mx-auto w-76 h-64" />
        </div>
  
        </div>
      </div>
      <div className='flex'>
      <div className="flex justify-center items-center w-1/2">
        <img src={Quiz} alt="quiz" className="mx-auto w-76 h-64" />
      </div>
      <div class="w-1/2 ">
      <h1 className="text-5xl font-bold text-gray-300 mt-10 ">Ready to start the QuizMaster Experience? </h1>
      <p className="text-2xl text-gray-300 mb-10 pt-8 pr-8">Simply <a href = "/register"  className="underline">create an account</a> or <a href = "/login" className="underline">login</a> if you already have an account. Navigate to the <a href = "/quizzes"  className="underline">quizzes</a> page and select a quiz.</p>
      </div>
      </div>
    </div>
  );
};

export default App
