import React from 'react';
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

  if (loading) {
    return (
      <div className="dashboard-content">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-xl">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-content">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-red-500">Error loading profile: {error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="relative max-w-[1600px] mx-auto space-y-20 mb-10">
        <section className="text-center space-y-2">
          <h1 className="dashboard-title text-5xl font-extrabold tracking-tight drop-shadow sm:text-6xl text-gradient-primary">
            My Profile
          </h1>
          <p className="dashboard-subtitle text-lg text-secondary">
            View your activity, quiz performance, and manage your account information.
          </p>
        </section>

        <div className="dashboard-section">
          {/* Profile Info Section */}
          <div className="card mb-8">
            <ProfileInfo profile={profile} userId={user?.uid} />
          </div>

          {/* My Study Material Section */}
          <div className="card mb-8">
            <MyStudyMaterial decks={decks} quizzes={quizzes} />
          </div>

          {/* Recent Activity Section */}
          <div className="card mb-8">
            <RecentStudyActivity decks={decks} quizzes={quizzes} />
          </div>

          {/* Quiz Performance Section */}
          <div className="card mb-8">
            <QuizAverages quizAverages={quizAverages} overallStats={overallStats} loading={loading} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
