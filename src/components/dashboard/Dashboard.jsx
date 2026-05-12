/**
 * This is the dashboard parent component
 * this will only get mounted if the user is logged in
 */
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import RecentActivity from '../home/RecentActivity';
import Recommended from '../home/Recommended';

export default function Dashboard() {
  const { isGoogleAuth } = useAuth();

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

        <div className="max-w-6xl mx-auto mt-8 px-4">
          <h2 className="text-2xl font-bold text-primary mb-6 text-center">My Content</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="card relative rounded-2xl shadow-lg hover:shadow-xl border border-[var(--border)] flex flex-col transition-all duration-200">
              <div className="p-6 flex-grow flex flex-col text-center">
                <div className="text-2xl text-[var(--accent)] font-bold mb-3">My Quizzes</div>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  View and manage all the quizzes you've created.
                </p>
                <Link
                  to="/myquizzes"
                  className="mt-auto w-full px-4 py-2 bg-[var(--btn-primary-bg)] hover:bg-[var(--accent-hover)] text-[var(--btn-primary-text)] rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg text-center"
                >
                  Go to My Quizzes
                </Link>
              </div>
            </div>

            <div className="card relative rounded-2xl shadow-lg hover:shadow-xl border border-[var(--border)] flex flex-col transition-all duration-200">
              <div className="p-6 flex-grow flex flex-col text-center">
                <div className="text-2xl text-[var(--accent)] font-bold mb-3">My Flashcards</div>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  View and manage all the flashcard decks you've created.
                </p>
                <Link
                  to="/myflashcards"
                  className="mt-auto w-full px-4 py-2 bg-[var(--btn-primary-bg)] hover:bg-[var(--accent-hover)] text-[var(--btn-primary-text)] rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg text-center"
                >
                  Go to My Flashcards
                </Link>
              </div>
            </div>
          </div>
        </div>

        <RecentActivity limit={8} />
        <Recommended limit={6} />

      </div>
    </div>
  );
}