import React from 'react';
import { useCategory } from '../../contexts/CategoryContext';
import QuizSelectButton from './QuizSelectButton';
import RandomQuizButton from './RandomQuizButton';
import Random from '../icons/Random';
import { Link } from 'react-router-dom';
import CategoryBackButton from './CategoryBackButton';
import { motion } from 'framer-motion';

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

  const randomIndex = Math.floor(Math.random() * quizCategories.length);
  selectDifficulty(0);
  selectAmount(10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f051d] via-[#1b1444] to-[#0f051d] text-white relative overflow-hidden py-20 px-6">
      {/* Animated background glow */}
      <div className="absolute top-[-150px] left-[-150px] w-[400px] h-[400px] bg-purple-700 opacity-30 blur-[100px] rounded-full z-0" />
      <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-blue-500 opacity-30 blur-[100px] rounded-full z-0" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 max-w-6xl mx-auto text-center"
      >
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

        <CategoryBackButton />

        <p className="text-sm text-gray-300 mt-12">
          Not finding the quiz you're looking for?{' '}
          <Link to="/contact" className="underline hover:text-blue-400">
            Suggest a quiz
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default SelectQuiz;
