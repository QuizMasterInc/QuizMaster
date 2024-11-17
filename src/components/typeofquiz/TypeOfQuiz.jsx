import React from 'react'
import { Link } from 'react-router-dom'
import UserIcon from '../icons/User.jsx'
import QuizMasterIcon from '../icons/Scroll.jsx'

const TypeOfQuiz = () => {
  return (
    <div >
        <h1 className="text-2xl font-bold text-gray-300 -sm:text-lg">Select what kind of quiz you want to take!</h1>
        <div className="flex justify-center my-10 -sm:p-1">
            
            <Link to={'/quizzes'} >
                <div className="p-4 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600">
                    <img src={QuizMasterIcon} alt="QuizMaster" className="w-6 h-6 mr-3" />
                    <div className="-sm:text-sm">QuizMaster Quizzes</div>
                </div>
            </Link>
            <Link to={'/allcustomquizzes'} >
                <div className="p-4 mx-10 -sm:mx-2 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600">
                    <img src={UserIcon} alt="User-Made" className="w-6 h-6 mr-3" />
                    <div className="-sm:text-sm">User-Made Quizzes</div>
                </div>
            </Link>
        </div>
    </div>
  )
}

export default TypeOfQuiz