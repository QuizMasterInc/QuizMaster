import React from 'react'
import { Link } from 'react-router-dom'
import UserIcon from '../icons/User.jsx'
import QuizMasterIcon from '../icons/Scroll.jsx'

const TypeOfQuiz = () => {
  return (
    <div className="min-h-screen text-white py-20 px-6 relative overflow-hidden">
      {/* Glowing background blobs */}
      <div className="absolute top-[-150px] left-[-150px] w-[500px] h-[500px] bg-purple-700 opacity-30 blur-[120px] rounded-full z-0" />
      <div className="absolute bottom-[-150px] right-[-150px] w-[500px] h-[500px] bg-blue-500 opacity-30 blur-[120px] rounded-full z-0" />

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <h1 className="text-5xl font-extrabold text-white drop-shadow-md mb-4">
          Choose Your Quiz Type
        </h1>
        <p className="text-lg text-gray-300 mb-14 max-w-2xl mx-auto">
          Select a quiz type to begin. Whether you're up for a challenge from QuizMaster,
          exploring quizzes made by others, or testing yourself with teacher-curated quizzes—
          there's something for everyone.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
          {/* QuizMaster Quizzes */}
          <Link to="/quizzes" className="w-full">
            <div className="bg-[#1b1444] border border-purple-700 p-6 rounded-2xl shadow-xl hover:shadow-purple-500/50 hover:-translate-y-1 transition-all duration-300 text-center">
              <QuizMasterIcon className="w-14 h-14 fill-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white">QuizMaster Quizzes</h3>
              <p className="text-sm text-gray-400 mt-2">
                Challenging quizzes created by our team
              </p>
            </div>
          </Link>

          {/* User-Made Quizzes */}
          <Link to="/allcustomquizzes" className="w-full">
            <div className="bg-[#1b1444] border border-purple-700 p-6 rounded-2xl shadow-xl hover:shadow-purple-500/50 hover:-translate-y-1 transition-all duration-300 text-center">
              <UserIcon className="w-14 h-14 fill-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white">User-Made Quizzes</h3>
              <p className="text-sm text-gray-400 mt-2">
                Discover quizzes made by other users
              </p>
            </div>
          </Link>

          {/* Teacher-Made Quizzes */}
          <Link to="/allteacherquizzes" className="w-full">
            <div className="bg-[#1b1444] border border-purple-700 p-6 rounded-2xl shadow-xl hover:shadow-purple-500/50 hover:-translate-y-1 transition-all duration-300 text-center">
              <UserIcon className="w-14 h-14 fill-pink-400 mb-4" />
              <h3 className="text-xl font-semibold text-white">Teacher-Made Quizzes</h3>
              <p className="text-sm text-gray-400 mt-2">
                Educational quizzes curated by instructors
              </p>
            </div>
          </Link>
        </div>
    </div>
  )
}

export default TypeOfQuiz;
