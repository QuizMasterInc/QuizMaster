import React from 'react'
import { Link } from 'react-router-dom'

const QuizBackButton = () => (
    <div className="fixed top-10 right-10 w-100 p-5 text-center -sm:p-1">
        <Link to={'/quizzes'} >
            <div className="flex flex-col items-center p-4 space-y-4 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600">
                <div className="-sm:text-sm">Back</div>
            </div>
        </Link>
    </div>
  )


export default QuizBackButton