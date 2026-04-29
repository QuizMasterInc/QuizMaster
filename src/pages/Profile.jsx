import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useProfileSectionData from '../hooks/useProfileSectionData';
import ProfileInfo from '../components/profile/ProfileInfo';
import QuizAverages from '../components/profile/QuizAverages';
import MyStudyMaterial from '../components/profile/MyStudyMaterial';
import RecentStudyActivity from '../components/profile/RecentStudyActivity';

const Profile = () => {
  const { user } = useAuth();
  const { profile, quizzes, decks, loading, error, quizAverages, overallStats } =
    useProfileSectionData(user?.uid);

  const safeProfile = profile || {};
  const safeQuizzes = Array.isArray(quizzes) ? quizzes : [];
  const safeDecks = Array.isArray(decks) ? decks : [];
  const safeQuizAverages = Array.isArray(quizAverages) ? quizAverages : [];
  const safeOverallStats = overallStats || {};

  if (!user?.uid) {
    return (
      <div className="dashboard-content overflow-x-hidden">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-xl text-primary">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content overflow-x-hidden">
      <div className="relative w-full max-w-7xl mx-auto space-y-16 mb-10 px-4 sm:px-6 lg:px-8">
        {error ? (
          <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-300">
            Error loading profile: {error.message || 'Something went wrong.'}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] px-5 py-4 text-sm font-medium text-[var(--text-secondary)] shadow-sm">
            Loading your profile details...
          </div>
        ) : null}

        <section className="text-center space-y-4">
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between sm:text-left">
            <div className="space-y-2">
              <h1 className="dashboard-title text-5xl font-extrabold tracking-tight drop-shadow sm:text-6xl text-gradient-primary">
                My Profile
              </h1>
              <p className="dashboard-subtitle text-lg text-secondary">
                View your activity, quiz performance, and manage your account information.
              </p>
            </div>

            {safeProfile?.isAdmin === true && (
              <Link
                to="/support-dashboard"
                className="card inline-flex shrink-0 items-center justify-center bg-purple-600 px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-purple-700"
              >
                Admin Dashboard
              </Link>
            )}
          </div>
        </section>

        <div className="dashboard-section w-full space-y-8">
          {/* Profile Info Section */}
          <div className="card w-full overflow-hidden">
            <ProfileInfo profile={safeProfile} userId={user?.uid} />
          </div>

          {/* My Study Material Section */}
          <div className="card w-full overflow-hidden">
            <MyStudyMaterial decks={safeDecks} quizzes={safeQuizzes} />
          </div>

          {/* Recent Activity Section */}
          <div className="card w-full overflow-hidden">
            <RecentStudyActivity decks={safeDecks} quizzes={safeQuizzes} />
          </div>

          {/* Quiz Performance Section */}
          <div className="card w-full overflow-hidden">
            <QuizAverages
              quizAverages={safeQuizAverages}
              overallStats={safeOverallStats}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;