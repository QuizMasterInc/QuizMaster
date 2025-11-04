/**
 * This parent component will allow users to navigate to the various quizzes
 * based on the quiz category
 */
// Full updated SelectSub.jsx
import { Link } from 'react-router-dom';
import { useCategory } from '../../contexts/AppContext';
import { BackButton } from '../ui/index.jsx';
import StarRating from './DifficultyRating';
import QuestionAmount from './QuestionAmount';

function SelectSub() {
  const {
    quizSubcategories,
    availableSubcategories, // Use dynamic subcategories
    category,
    toggleSubcategory,
    subcategories,
    difficulty,
    selectDifficulty,
    amount,
    selectAmount
  } = useCategory();

  // Use availableSubcategories if available, otherwise fall back to hardcoded
  const subcategoriesToDisplay = availableSubcategories.length > 0
    ? availableSubcategories
    : (quizSubcategories[category.toLowerCase()] || []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary relative overflow-hidden m-5">

      <div className="card rounded-3xl shadow-2xl px-10 py-12 space-y-10 z-10 w-[800px]">

        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-extrabold">
            Category: <span className="text-gradient-primary">{category}</span>
          </h1>
          <div className="rounded-lg shadow-lg transition duration-200">
            <BackButton to="/quizzes"/>
          </div>
        </div>

        <section className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-gradient-primary">Choose Sub-Categories</h2>
          {subcategoriesToDisplay.length === 0 ? (
            <p className="text-secondary italic">Loading subcategories...</p>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              {subcategoriesToDisplay.map((subcategory) => (
                <button
                  key={subcategory}
                  onClick={() => toggleSubcategory(subcategory)}
                  className={`px-5 py-2 font-semibold rounded-full shadow-md transition duration-300 ${
                    subcategories.includes(subcategory)
                      ? 'btn-primary btn-hover'
                      : 'bg-[var(--neutral-500)] hover:bg-[var(--neutral-400)]'
                  }`}
                >
                  {subcategory}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-gradient-primary">Select Difficulty</h2>
          <StarRating difficulty={difficulty} selectDifficulty={selectDifficulty} />
          {difficulty === 0 && (
            <p className="text-sm text-muted italic">
              ℹ️ No difficulty selected - questions of all difficulty levels will be included
            </p>
          )}
          {difficulty > 0 && (
            <p className="text-sm text-secondary font-medium">
              Selected: {difficulty} star{difficulty > 1 ? 's' : ''} difficulty
            </p>
          )}
        </section>

        <section className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-gradient-primary">Select Amount of Questions</h2>
          <div className="flex justify-center">
            <QuestionAmount min={1} max={10} amount={amount} selectAmount={selectAmount} />
          </div>
        </section>

        <div className="pt-8 flex justify-center gap-8">
          {subcategories.length > 0 && (
            <div className="text-center">
              <Link to={`/quizzes/quizstarted`} state={{ category: "Start" }}>
                <button className="inline-block px-4 py-1 bg-[var(--primary-400)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent">
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
