/**
 * This is the dashboard parent component
 * this will only get mounted if the user is logged in
 */
import { useState } from 'react';
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
    <div className="dashboard-content">
      <div className="relative max-w-[1600px] mx-auto space-y-20">
        <section className="text-center space-y-2">
          <h1 className="dashboard-title text-5xl font-extrabold tracking-tight drop-shadow sm:text-6xl text-primary">
            Welcome to <span className="text-gradient-primary">QuizMaster</span>!
          </h1>
          <p className="dashboard-subtitle text-lg text-secondary">
            Track your scores, study smarter, and master knowledge like a pro.
          </p>
        </section>

        <section className="dashboard-section">
          <h2 className="text-3xl font-bold text-center text-gradient-primary mb-10">Your Quiz Scores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {QUIZ_CATEGORIES.map((category, index) => (
              <QuizResult key={index} category={category} icon={CATEGORY_ICONS[index]} />
            ))}
          </div>
          {error && (
            <div className="mt-6 text-center error-message">
              {error}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <h2 className="text-3xl font-bold text-center text-gradient-primary mb-10">Study by Category</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {QUIZ_CATEGORIES.map((category, index) => (
              <button
                key={index}
                onClick={() => handleStudy(category)}
                className="inline-block px-8 py-3 bg-[var(--primary-400)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
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

        <section className="dashboard-section">
          <h2 className="text-3xl font-bold text-center text-gradient-primary mb-10">Your Custom Quizzes</h2>
          <CustomQuizzesTable />
        </section>

        <section className="flex flex-col sm:flex-row justify-center gap-6 pt-10">
          <Link to="/typeofquiz" className="inline-block px-8 py-3 bg-[var(--primary-400)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent">
            Take Another Quiz
          </Link>
          <Link to="/flashcards" className="inline-block px-8 py-3 bg-[var(--primary-400)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent">
            Make Flashcards
          </Link>
          {isGoogleAuth && (
            <Link to="/updateprofile" className="inline-block px-8 py-3 bg-[var(--primary-400)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent">
              Update Profile
            </Link>
          )}
        </section>
      </div>
    </div>
  );
}