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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-gray-200 px-4 py-12">
      <div className="max-w-7xl mx-auto space-y-20">

        {/* Header Section */}
        <section className="text-center">
          <h1 className="text-4xl font-extrabold mb-2 text-white">Your Dashboard</h1>
          <p className="text-lg text-gray-400">Track your scores, study, and master your knowledge!</p>
        </section>

        {/* Quiz Scores */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-10">Your Quiz Scores</h2>
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

        {/* Study Buttons */}
        <section>
          <h3 className="text-2xl font-semibold text-center mb-6">Study by Category</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {quizCategories.map((category, index) => (
              <button
                key={index}
                onClick={() => handleStudy(category)}
                className="bg-blue-700 hover:bg-blue-600 text-white font-medium py-2 px-5 rounded-lg shadow-lg transition-all"
              >
                Study {category}
              </button>
            ))}
          </div>
          {selectedCategory && (
            <div className="mt-8">
              <StudyMaterial category={selectedCategory} />
            </div>
          )}
        </section>

        {/* Custom Quizzes */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-10">Your Custom Quizzes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <CustomQuizzesTable />
          </div>
        </section>

        {/* Navigation Buttons */}
        <section className="flex flex-col sm:flex-row justify-center gap-6 pt-10">
          <Link to="/typeofquiz">
            <div className="bg-green-600 hover:bg-green-500 text-white py-3 px-6 rounded-lg text-lg shadow-md transition">
              Take Another Quiz
            </div>
          </Link>
          <Link to="/flashcards">
            <div className="bg-purple-600 hover:bg-purple-500 text-white py-3 px-6 rounded-lg text-lg shadow-md transition">
              View Flashcards
            </div>
          </Link>
          {isGoogleAuth && (
            <Link to="/updateprofile">
              <div className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg text-lg shadow-md transition">
                Update Profile
              </div>
            </Link>
          )}
        </section>
      </div>
    </div>
  );
}
