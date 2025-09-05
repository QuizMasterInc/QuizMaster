import React, { useState, useEffect } from 'react';
import { useCategory } from '../../contexts/AppContext';
import { BackButton, LinkButton, Container } from '../ui/index.jsx';
import { Random } from '../icons/index.jsx';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Inline QuizSelectButton component (was 21 lines, now inline)
const QuizSelectButton = ({ category, icon, destination, selectCategory, allSubcategories }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-xl hover:shadow-2xl border border-gray-700 text-center group cursor-pointer"
    onClick={() => {
      selectCategory(category);
      allSubcategories(category);
    }}
  >
    <Link to={`/quizzes/${destination}`} state={{ category }} className="block">
      <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
        {category}
      </h3>
    </Link>
  </motion.div>
);

// Inline RandomQuizButton component (was 25 lines, now inline)  
const RandomQuizButton = ({ category, icon, allSubcategories, selectCategory }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-2xl shadow-xl hover:shadow-2xl text-center group cursor-pointer"
    onClick={() => {
      selectCategory(category);
      allSubcategories(category);
    }}
  >
    <Link to={`/quizzes/random`} state={{ category }} className="block">
      <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white group-hover:text-yellow-300 transition-colors">
        Random Quiz
      </h3>
    </Link>
  </motion.div>
);

function SelectQuiz() {
  const {
    quizCategories,
    icons,
    destinations,
    selectCategory,
    allSubcategories,
    selectDifficulty,
    selectAmount,
  } = useCategory();

  // Initialize default values in useEffect to avoid state updates during render
  useEffect(() => {
    selectDifficulty(0);
    selectAmount(10);
  }, [selectDifficulty, selectAmount]);

  const randomIndex = Math.floor(Math.random() * quizCategories.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f051d] via-[#1b1444] to-[#0f051d] text-white relative overflow-hidden py-20 px-6">
      {/* Animated background glow */}
      <div className="absolute top-[-150px] left-[-150px] w-[400px] h-[400px] bg-purple-700 opacity-30 blur-[100px] rounded-full z-0" />
      <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-blue-500 opacity-30 blur-[100px] rounded-full z-0" />

      {/* Back Button - using shared UI component */}
      <BackButton to="/typeofquiz" position="fixed-top-right" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10"
      >
        <Container size="xl" className="text-center">
          <h2 className="text-4xl font-extrabold text-white mb-10 drop-shadow-md">
            Choose Your Quiz Category
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {quizCategories.map((category, index) => (
              <QuizSelectButton
                key={index}
                category={category}
                icon={icons[index]}
                destination={destinations[index]}
                selectCategory={selectCategory}
                allSubcategories={allSubcategories}
              />
            ))}
            <RandomQuizButton
              category={quizCategories[randomIndex]}
              icon={<Random />}
              allSubcategories={allSubcategories}
              selectCategory={selectCategory}
            />
          </div>

          <p className="text-sm text-gray-300 mt-12">
            Not finding the quiz you're looking for?{' '}
            <Link to="/contact" className="underline hover:text-blue-400">
              Suggest a quiz
            </Link>
          </p>
        </Container>
      </motion.div>
    </div>
  );
}

export default SelectQuiz;
