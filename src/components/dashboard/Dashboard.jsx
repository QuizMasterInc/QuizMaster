/**
 * This is the dashboard parent component
 * this will only get mounted if the user is logged in
 */
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { QuizResult } from './QuizResult';
import CustomQuizzesTable from './CustomQuizzesTable';
import { Link } from 'react-router-dom';
import StudyMaterial from './StudyMaterial';
import { QUIZ_CATEGORIES, CATEGORY_ICONS } from '../../constants/quizConstants.jsx';

export default function Dashboard() {
  const [error, setError] = useState('');
  const { isGoogleAuth } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleStudy = (category) => {
    setSelectedCategory((prev) => (prev === category ? null : category));
  };

  return (
      <div className="leading-relaxed w-full text-white overflow-x-hidden py-16 px-4 bg-black">
        <div className="relative z-10 max-w-[1600px] mx-auto space-y-20">
          <section className="text-center space-y-2">
            <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow sm:text-6xl">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">QuizMaster</span>!
            </h1>
            <p className="text-lg text-gray-300">
              Track your scores, study smarter, and master knowledge like a pro.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-center text-violet-300 mb-10">Your Quiz Scores</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {QUIZ_CATEGORIES.map((category, index) => (
                  <QuizResult key={index} category={category} icon={CATEGORY_ICONS[index]} />
              ))}
            </div>
            {error && (
                <div className="mt-6 text-center bg-red-500 text-white py-2 px-4 rounded shadow-md">
                  {error}
                </div>
            )}
          </section>

          <section>
            <h3 className="mb-6 text-center text-2xl font-semibold text-sky-300">
              Study by Category
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {QUIZ_CATEGORIES.map((category, index) => (
                  <button
                      key={index}
                      onClick={() => handleStudy(category)}
                      className="text-white font-medium py-2 px-5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:opacity-90 transition-all"
                  >
                    Study {category}
                  </button>
              ))}
            </div>
            {selectedCategory && (
                <div className="mt-10">
                  <StudyMaterial category={selectedCategory} />
                </div>
            )}
          </section>

          <section>
            <h2 className="text-3xl font-bold text-center text-pink-300 mb-10">Your Custom Quizzes</h2>
            <CustomQuizzesTable />
          </section>

          <section className="flex flex-col sm:flex-row justify-center gap-6 pt-10">
            <Link to="/typeofquiz">
              <div className="bg-green-500 hover:bg-green-400 text-white py-3 px-6 rounded-full text-lg shadow-lg transition-all">
                Take Another Quiz
              </div>
            </Link>
            <Link to="/flashcards">
              <div className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white py-3 px-6 rounded-full text-lg shadow-lg transition-all">
                Make Flashcards
              </div>
            </Link>
            {isGoogleAuth && (
                <Link to="/updateprofile">
                  <div className="bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-full text-lg shadow-lg transition-all">
                    Update Profile
                  </div>
                </Link>
            )}
          </section>
        </div>
      </div>
  );
}
