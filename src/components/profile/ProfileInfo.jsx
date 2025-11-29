import { useState } from 'react';
import AuthService from '../../services/auth/authService';

const ProfileInfo = ({ profile, userId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile?.profile?.firstName || '',
    lastName: profile?.profile?.lastName || '',
    email: profile?.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await AuthService.updateUserProfile(userId, formData);
      setIsEditing(false);
      // Optionally refresh profile data
      window.location.reload(); // Simple refresh, or use callback to update parent
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: profile?.profile?.firstName || '',
      lastName: profile?.profile?.lastName || '',
      email: profile?.email || '',
    });
    setIsEditing(false);
    setError(null);
  };

  if (!profile) {
    return <div>Loading profile information...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gradient-primary">Profile Information</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-[var(--primary-400)] text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
          >
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div className="bg-[var(--error-bg)] border border-[var(--error-border)] text-[var(--error-text)] px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              First Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="input-focus w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              />
            ) : (
              <p className="text-[var(--text-primary)]">{profile.profile?.firstName || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Last Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="input-focus w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              />
            ) : (
              <p className="text-[var(--text-primary)]">{profile.profile?.lastName || 'Not set'}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Email
          </label>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="input-focus w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
            />
          ) : (
            <p className="text-[var(--text-primary)]">{profile.email || 'Not set'}</p>
          )}
        </div>

        <div className="text-sm text-[var(--text-muted)]">
          <p>Member since: {profile.timestamps?.createdAt ? new Date(profile.timestamps.createdAt).toLocaleDateString() : 'Unknown'}</p>
          <p>Last login: {profile.timestamps?.lastLoginAt ? new Date(profile.timestamps.lastLoginAt.toDate ? profile.timestamps.lastLoginAt.toDate() : profile.timestamps.lastLoginAt).toLocaleDateString() : 'Unknown'}</p>
        </div>
      </div>

      {isEditing && (
        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-[var(--success)] hover:bg-green-600 disabled:bg-[var(--neutral-400)] text-white rounded-md transition-colors"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-[var(--neutral-400)] hover:bg-[var(--neutral-500)] text-white rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;
