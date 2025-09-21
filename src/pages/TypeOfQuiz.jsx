import React from 'react';
import { Link } from 'react-router-dom';
import { User, Scroll } from '../components/icons/index.jsx';

const TypeOfQuiz = () => {
  return (
    <div className="min-h-screen py-20 px-6 relative overflow-hidden">

      <div className="relative z-10 max-w-5xl mx-auto text-center">

        <h1 className="text-5xl font-extrabold text-gradient-primary drop-shadow-md mb-4">
          Choose Your Quiz Type
        </h1>
        <p className="text-lg mb-14 max-w-2xl mx-auto">
          Select a quiz type to begin. Whether you're up for a challenge from QuizMaster,
          exploring quizzes made by others, or testing yourself with teacher-curated quizzes—
          there's something for everyone.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
          <Link to="/quizzes" className="w-full border-2 border-accent rounded-2xl hover:scale-105 transition duration-300">
            <div className="card flex flex-col items-center justify-center text-center">
              <Scroll className="w-14 h-14 fill-current text-[var(--primary-400)] mb-4" />
              <h3 className="text-xl font-semibold">QuizMaster Quizzes</h3>
              <p className="text-sm mt-2">
                Challenging quizzes created by our team
              </p>
            </div>
          </Link>

          <Link to="/allcustomquizzes" className="w-full border-2 border-accent rounded-2xl hover:scale-105 transition duration-300">
            <div className="card flex flex-col items-center justify-center text-center">
              <User className="w-14 h-14 fill-current text-[var(--primary-400)] mb-4" />
              <h3 className="text-xl font-semibold">User-Made Quizzes</h3>
              <p className="text-sm mt-2">
                Discover quizzes made by other users
              </p>
            </div>
          </Link>

          {/* Teacher-Made Quizzes */}
          <Link to="/allteacherquizzes" className="w-full border-2 border-accent rounded-2xl hover:scale-105 transition duration-300">
            <div className="card flex flex-col items-center justify-center text-center">
              <User className="w-14 h-14 fill-current text-[var(--primary-400)] mb-4" />
              <h3 className="text-xl font-semibold">Teacher-Made Quizzes</h3>
              <p className="text-sm mt-2">
                Educational quizzes curated by instructors
              </p>
            </div>
          </Link>
        </div>

    </div>
  </div>
  )
}

export default TypeOfQuiz;