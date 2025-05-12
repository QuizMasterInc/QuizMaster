import React from 'react'
import { Link } from 'react-router-dom'

const QuizBackButton = () => (
  <div className="absolute top-6 right-6 z-50">
    <Link to={'/quizzes'}>
      <div className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition">
        Back
      </div>
    </Link>
  </div>
)

export default QuizBackButton
