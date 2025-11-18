/**
 * This parent component will allow users to navigate to the various quizzes
 * based on the quiz category
 */
// Updated SelectSub.jsx
import { useState, useEffect, useMemo, useRef } from 'react';
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
    selectAmount,
  } = useCategory();

  // Manual setup toggle
  const [manualSetup, setManualSetup] = useState(false);

  // Determine the full list (dynamic if available, otherwise hard-coded)
  const subcategoriesToDisplay =
    availableSubcategories.length > 0
      ? availableSubcategories
      : quizSubcategories[category.toLowerCase()] || [];

  // "Select all" wiring
  const all = useMemo(() => subcategoriesToDisplay, [subcategoriesToDisplay]);
  const selectAllRef = useRef(null);
  const allSelected = all.length > 0 && subcategories.length === all.length;
  const noneSelected = subcategories.length === 0;

  useEffect(() => {
    if (selectAllRef.current) {
      // show the faint dash when partially selected
      selectAllRef.current.indeterminate = !allSelected && !noneSelected;
    }
  }, [allSelected, noneSelected]);

  const toggleAll = () => {
    if (allSelected) {
      // Clear all (toggle off any currently selected)
      all.forEach((sc) => {
        if (subcategories.includes(sc)) toggleSubcategory(sc);
      });
    } else {
      // Select all (toggle on any not yet selected)
      all.forEach((sc) => {
        if (!subcategories.includes(sc)) toggleSubcategory(sc);
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary relative overflow-hidden m-5">
      <div className="card rounded-3xl shadow-2xl px-10 py-12 space-y-10 z-10 w-[800px]">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-extrabold">
            Category: <span className="text-gradient-primary">{category}</span>
          </h1>
          <div className="rounded-lg shadow-lg transition duration-200">
            <BackButton to="/quizzes" />
          </div>
        </div>

        {/* Manual setup toggle */}
        <section className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={manualSetup}
              onChange={(e) => setManualSetup(e.target.checked)}
            />
            <span className="font-medium">Manual setup</span>
          </label>
          {!manualSetup && (
            <p className="text-sm text-secondary">
              Using automatic settings. Turn on <b>Manual setup</b> to choose
              sub-categories, difficulty, and question amount.
            </p>
          )}
        </section>

        {/* Manual fields only when ON */}
        {manualSetup && (
          <>
            {/* Sub-categories with Select all */}
            <section className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-gradient-primary">
                Choose Sub-Categories
              </h2>

              {subcategoriesToDisplay.length === 0 ? (
                <p className="text-secondary italic">Loading subcategories...</p>
              ) : (
                <>
                  <div className="flex justify-center mb-3">
                    <label className="flex items-center gap-2">
                      <input
                        ref={selectAllRef}
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                      />
                      <span>Select all</span>
                    </label>
                  </div>

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
                </>
              )}
            </section>

            {/* Difficulty (manual mode) */}
            <section className="text-center space-y-4 mt-6">
              <h2 className="text-2xl font-semibold text-gradient-primary">
                Select Difficulty
              </h2>
              <StarRating
                difficulty={difficulty}
                selectDifficulty={selectDifficulty}
              />
            </section>

            {/* Amount (manual mode) */}
            <section className="text-center space-y-4 mt-6">
              <h2 className="text-2xl font-semibold text-gradient-primary">
                Select Amount of Questions
              </h2>
              <QuestionAmount
                amount={amount}
                selectAmount={selectAmount}
              />
            </section>
          </>
        )}

        {/* Start button */}
        <div className="pt-8 flex justify-center gap-8">
          {(!manualSetup || subcategories.length > 0) && (
            <div className="text-center">
              <Link
                to="/quizzes/quizstarted"
                state={{ category: 'Start', manualSetup }}
              >
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
