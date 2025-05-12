/**
 * This parent component will allow users to navigate to the various quizzes
 * based on the quiz category
 */
// Full updated SelectSub.jsx
import React from 'react';
import { useCategory } from '../../contexts/CategoryContext';
import SubCategoryButton from './SubCategoryButton';
import QuizStartButton from './QuizStartButton';
import QuizBackButton from './QuizBackButton';
import StarRating from './DifficultyRating';
import QuestionAmount from './QuestionAmount';
import ShowTime from './ShowTimeButton';
import TimerLength from './TimerLength';
import ShowPauseButton from './ShowPauseButton';

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
            <QuizBackButton />
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
          <ShowTime toggleTimerVisibility={toggleTimerVisibility} showTimer={showTimer} />
          {showTimer && (
            <>
              <ShowPauseButton
                togglePauseButtonVisibility={togglePauseButtonVisibility}
                showPauseButton={showPauseButton}
              />
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
            <QuizStartButton
              category="Start"
              destination="quizstarted"
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-pink-400/50 hover:scale-105 transition"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default SelectSub;
