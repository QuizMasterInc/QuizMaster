/**
 * This is the dashboard parent component
 * this will only get mounted if the user is logged in
 * commented imports are associated with the quizmaster quizzes section
 */
import { useAuth } from '../../contexts/AuthContext';
// import { CategoryStatsCard } from './CategoryStatsCard';
// import { QUIZ_CATEGORIES, CATEGORY_ICONS } from '../../constants/quizConstants.jsx';
import RecentActivity from '../home/RecentActivity';

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
        <RecentActivity limit={6} />

      {/*
        comment below takes quizmaster quizzes off of the dashboard
        not fully removed yet so don't delete until talked about more
        -Joseph :)
      */}

        {/* <section className="dashboard-section">
          <h2 className="text-3xl font-bold text-center text-gradient-primary mb-10">Your Quiz Scores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {QUIZ_CATEGORIES.map((category, index) => (
              <CategoryStatsCard key={index} category={category} icon={CATEGORY_ICONS[index]} />
            ))}
          </div>
        </section> */}
      </div>
    </div>
  );
}