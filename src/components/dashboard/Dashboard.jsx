/**
 * This is the dashboard parent component
 * this will only get mounted if the user is logged in
 */
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
        <RecentActivity limit={8} />
        <Recommended limit={6} />

      </div>
    </div>
  );
}