/**
 * This parent component will allow users to navigate to the various quizzes
 * based on the quiz category
 */
// Full updated SelectSub.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCategory } from '../../contexts/AppContext';
import { BackButton } from '../ui/index.jsx';
import StarRating from './DifficultyRating';
import QuestionAmount from './QuestionAmount';

function SelectSub() {
  const {
    quizSubcategories,
    category,
    toggleSubcategory,
    subcategories,
    difficulty,
    selectDifficulty,
    amount,
    selectAmount,
    duration,
    updateDuration,
    showTimer,
    toggleTimerVisibility,
    showPauseButton,
    togglePauseButtonVisibility,
  } = useCategory();

  const availableSubcategories = quizSubcategories[category.toLowerCase()] || [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/diagonal-bg.svg')] bg-cover bg-fixed bg-no-repeat relative overflow-hidden">
      {/* Glows */}
      <div className="absolute w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-30 top-0 left-0 animate-pulse-slow" />
      <div className="absolute w-96 h-96 bg-pink-500 rounded-full blur-3xl opacity-30 bottom-0 right-0 animate-pulse-slow" />
      <div className="absolute w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse-slow" />

      <div className="relative w-full max-w-5xl bg-[#1e1b4b]/70 backdrop-blur-xl border border-fuchsia-700 rounded-3xl shadow-2xl px-10 py-12 text-white space-y-10 z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-extrabold text-purple-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]">
            Category: <span className="text-white">{category}</span>
          </h1>
          <div className="rounded-lg shadow-lg hover:shadow-pink-500/40 transition duration-200">
            <BackButton />
          </div>
        </div>

        <section className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-purple-200">Choose Sub-Categories</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {availableSubcategories.map((subcategory) => (
              <button
                key={subcategory}
                onClick={() => toggleSubcategory(subcategory)}
                className={`px-5 py-2 text-white font-semibold rounded-full shadow-md transition duration-300 ${
                  subcategories.includes(subcategory)
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {subcategory}
              </button>
            ))}
          </div>
        </section>

        <section className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-purple-200">Select Difficulty</h2>
          <StarRating difficulty={difficulty} selectDifficulty={selectDifficulty} />
        </section>

        <section className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-purple-200">Select Amount of Questions</h2>
          <div className="flex justify-center">
            <QuestionAmount min={1} max={10} amount={amount} selectAmount={selectAmount} />
          </div>
        </section>

        <section className="space-y-4">
          {/* Inlined ShowTime Component */}
          <div className="flex items-center p-4 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg">
            <label className="text-white font-semibold mr-4">Show Timer</label>
            <input
              type="checkbox"
              checked={showTimer}
              onChange={toggleTimerVisibility}
              className="form-checkbox h-5 w-5 text-white border-white focus:ring-white"
            />
            <span className="ml-4 text-white text-sm">
              {showTimer ? 'Timer is visible' : 'Timer is hidden'}
            </span>
          </div>
          
          {showTimer && (
            <>
              {/* Inlined ShowPauseButton Component */}
              <div className="flex items-center p-4 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg">
                <label className="text-white font-semibold mr-4">Show Pause Button</label>
                <input
                  type="checkbox"
                  checked={showPauseButton}
                  onChange={togglePauseButtonVisibility}
                  className="form-checkbox h-5 w-5 text-white border-white focus:ring-white"
                />
                <span className="ml-4 text-white text-sm">
                  {showPauseButton ? 'Pause Button is visible' : 'Pause Button is hidden'}
                </span>
              </div>
              
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-purple-200 mb-2">
                  Select Quiz Duration (In minutes)
                </h2>
                <input
                  type="number"
                  min="1"
                  className="mt-2 p-2 w-16 text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg shadow-md"
                  value={duration}
                  onChange={(e) => updateDuration(e.target.value)}
                />
              </div>
            </>
          )}
        </section>

        <div className="pt-8 flex justify-center gap-8">
          {subcategories.length > 0 && (
            <div className="text-center">
              <Link to={`/quizzes/quizstarted`} state={{ category: "Start" }}>
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-bold shadow-lg hover:shadow-pink-500/40 hover:scale-105 transition">
                  Start
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SelectSub;
