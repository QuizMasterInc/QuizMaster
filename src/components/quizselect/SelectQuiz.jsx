import { useEffect } from 'react';
import { useCategory } from '../../contexts/AppContext';
import { BackButton } from '../ui/index.jsx';
import { Random } from '../icons/index.jsx';
import { Link } from 'react-router-dom';

// Inline QuizSelectButton component (was 21 lines, now inline)
const QuizSelectButton = ({ category, icon, destination, selectCategory, allSubcategories }) => (
  <div className="card rounded-2xl shadow-xl hover:shadow-2xl border border-accent flex flex-col items-center justify-center p-6 h-[150px] transform transition-transform duration-200 hover:scale-105 cursor-pointer">
    <Link
      to={`/quizzes/${destination}`}
      state={{ category }}
      className="flex flex-col items-center justify-center h-full w-full text-center"
      onClick={() => {
        selectCategory(category);
        allSubcategories(category);
      }}
    >
      <div className="w-14 h-14 fill-current text-[var(--primary-400)] mb-4 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-center">{category}</h3>
    </Link>
  </div>
);

// Inline RandomQuizButton component (was 25 lines, now inline)  
const RandomQuizButton = ({ category, icon, allSubcategories, selectCategory }) => (
  <div className="card rounded-2xl shadow-xl hover:shadow-2xl border border-accent flex flex-col items-center justify-center p-6 h-[150px] transform transition-transform duration-200 hover:scale-105 cursor-pointer">
    <Link
      to={`/quizzes/random`}
      state={{ category }}
      className="flex flex-col items-center justify-center h-full w-full text-center"
      onClick={() => {
        selectCategory(category);
        allSubcategories(category);
      }}
    >
      <div className="w-14 h-14 fill-current text-[var(--primary-400)] mb-4 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-center">Random Quiz</h3>
    </Link>
  </div>
);

function SelectQuiz() {
  const {
    quizCategories,
    icons,
    destinations,
    selectCategory,
    allSubcategories,
    updateDifficulty,
    updateAmount,
  } = useCategory();

  // Initialize default values in useEffect to avoid state updates during render
  useEffect(() => {
    updateDifficulty(0);
    updateAmount(10);
  }, [updateDifficulty, updateAmount]);

  const randomIndex = Math.floor(Math.random() * quizCategories.length);

  return (
    <div className="bg-primary relative overflow-hidden py-20 px-6 min-h-screen">

      <div className="absolute top-6 right-6 z-20">
        <BackButton to="/typeofquiz" />
      </div>

      <div className="relative z-10">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gradient-primary mb-10 drop-shadow-md">
            Choose Your Quiz Category
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
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
          </div>

          <div className="mt-12 flex justify-center">
            <RandomQuizButton
              category={quizCategories[randomIndex]}
              icon={<Random />}
              allSubcategories={allSubcategories}
              selectCategory={selectCategory}
            />
          </div>

          <p className="text-sm text-[var(--text-secondary)] mt-12">
            Not finding the quiz you're looking for?{' '}
            <Link to="/contact" className="underline hover:text-blue-400">
              Suggest a quiz
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SelectQuiz;