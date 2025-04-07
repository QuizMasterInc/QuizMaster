import React from 'react';
import { Link } from 'react-router-dom';
import UserIcon from '../icons/User.jsx';
import QuizMasterIcon from '../icons/Scroll.jsx';

const TypeOfQuiz = () => {
  return (
    <div className="min-h-screen bg-black text-white py-16 px-4 md:px-20">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Choose Your Quiz Type</h1>
        <p className="text-lg text-gray-300 mb-12">
          Select a quiz type to begin. Whether you're up for a challenge from QuizMaster,
          exploring quizzes made by other users, or testing yourself with quizzes from teachers—
          we've got something for everyone.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {/* QuizMaster Quizzes */}
          <Link to={'/quizzes'} className="w-full">
            <div className="p-6 bg-gray-800 hover:bg-gray-700 rounded-xl shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out flex flex-col items-center">
              <QuizMasterIcon className="w-12 h-12 fill-white mb-4" />
              <h3 className="text-xl font-semibold">QuizMaster Quizzes</h3>
              <p className="text-gray-400 text-sm mt-2">Challenging quizzes made by our team</p>
            </div>
          </Link>

          {/* User-Made Quizzes */}
          <Link to={'/allcustomquizzes'} className="w-full">
            <div className="p-6 bg-gray-800 hover:bg-gray-700 rounded-xl shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out flex flex-col items-center">
              <UserIcon className="w-12 h-12 fill-white mb-4" />
              <h3 className="text-xl font-semibold">User-Made Quizzes</h3>
              <p className="text-gray-400 text-sm mt-2">Discover quizzes created by other users</p>
            </div>
          </Link>

          {/* Teacher-Made Quizzes */}
          <Link to={'/allteacherquizzes'} className="w-full">
            <div className="p-6 bg-gray-800 hover:bg-gray-700 rounded-xl shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out flex flex-col items-center">
              <UserIcon className="w-12 h-12 fill-white mb-4" />
              <h3 className="text-xl font-semibold">Teacher-Made Quizzes</h3>
              <p className="text-gray-400 text-sm mt-2">Educational quizzes curated by teachers</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TypeOfQuiz;