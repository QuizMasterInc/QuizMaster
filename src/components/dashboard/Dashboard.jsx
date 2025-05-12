/**
 * This is the dashboard parent component
 * this will only get mounted if the user is logged in
 */
import React, { useState } from 'react';
import { useCategory } from '../../contexts/CategoryContext';
import { useAuth } from '../../contexts/AuthContext';
import { QuizResult } from './QuizResult';
import CustomQuizzesTable from './CustomQuizzesTable';
import { Link } from 'react-router-dom';
import StudyMaterial from './StudyMaterial';

export default function Dashboard() {
  const [error, setError] = useState('');
  const { isGoogleAuth } = useAuth();
  const { quizCategories, icons } = useCategory();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleStudy = (category) => {
    setSelectedCategory((prev) => (prev === category ? null : category));
  };

  return (
    <div className="relative min-h-screen w-full text-white overflow-x-hidden py-16 px-4">

      {/* Purple Diagonal Background */}
      <div className="absolute inset-0 z-0 bg-[#14002e] bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2280%22%20height%3D%2280%22%20viewBox%3D%220%200%2080%2080%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22%236b21a8%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M0%2080L80%200H70L0%2070zM10%2080L80%2010V0L0%2080zM30%2080L80%2030V20L20%2080zM50%2080L80%2050V40L40%2080zM70%2080L80%2070V60L60%2080z%22/%3E%3C/g%3E%3C/svg%3E')] bg-repeat bg-[length:100px_100px]" />

      {/* Glow Effects */}
      <div className="absolute top-[-150px] left-[-150px] w-[500px] h-[500px] bg-purple-500 blur-[140px] opacity-30 rounded-full z-0" />
      <div className="absolute bottom-[-150px] right-[-150px] w-[500px] h-[500px] bg-blue-500 blur-[140px] opacity-30 rounded-full z-0" />

      {/* Foreground content */}
      <div className="relative z-10 max-w-[1600px] mx-auto space-y-20">

        {/* Welcome Header */}
        <section className="text-center space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">QuizMaster</span>!
          </h1>
          <p className="text-lg text-gray-300">
            Track your scores, study smarter, and master knowledge like a pro.
          </p>
        </section>

        {/* Quiz Scores */}
        <section>
          <h2 className="text-3xl font-bold text-center text-violet-300 mb-10">Your Quiz Scores</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {quizCategories.map((category, index) => (
              <QuizResult key={index} category={category} icon={icons[index]} />
            ))}
          </div>
          {error && (
            <div className="mt-6 text-center bg-red-500 text-white py-2 px-4 rounded shadow-md">
              {error}
            </div>
          )}
        </section>

        {/* Study Category Buttons */}
        <section>
          <h3 className="text-2xl font-semibold text-center text-sky-300 mb-6">Study by Category</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {quizCategories.map((category, index) => (
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

        {/* Custom Quizzes */}
        <section>
          <h2 className="text-3xl font-bold text-center text-pink-300 mb-10">Your Custom Quizzes</h2>
          <CustomQuizzesTable />
        </section>

        {/* Flashcards */}
        <section>
          <h2 className="text-3xl font-bold text-center text-pink-300 mb-10">Your Flashcards</h2>
          <CustomQuizzesTable />
        </section>

        {/* Navigation Buttons */}
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
