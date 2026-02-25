import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthService from '../../services/auth/authService';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import {
  changeUsername,
  isUsernameAvailable,
  isValidUsername,
  normalizeUsername,
} from '../../services/firebase/usernameService';

const ProfileInfo = ({ profile, userId }) => {
  const { user } = useAuth();

  const isOAuthUser = user?.providerData?.some(
    (provider) => provider.providerId === 'google.com' || provider.providerId === 'github.com'
  );
  const isEmailPasswordUser = !isOAuthUser;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile?.profile?.firstName || '',
    lastName: profile?.profile?.lastName || '',
    email: profile?.email || '',
    username: profile?.username || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // IMPORTANT: keep formData synced with profile when profile loads/updates
  useEffect(() => {
    if (!profile) return;
    // Only sync when NOT editing, so we don't overwrite user's typing
    if (isEditing) return;

    setFormData({
      firstName: profile?.profile?.firstName || '',
      lastName: profile?.profile?.lastName || '',
      email: profile?.email || '',
      username: profile?.username || '',
    });
  }, [profile, isEditing]);

  const [usernameStatus, setUsernameStatus] = useState({ state: 'idle', message: '' });
  // state: idle | invalid | checking | available | taken | ok

  const usernameTrimmed = (formData.username || '').trim();
  const usernameLower = normalizeUsername(usernameTrimmed);
  const originalUsernameLower = normalizeUsername(profile?.username || '');
  const usernameUnchanged = usernameLower && usernameLower === originalUsernameLower;

  const canSaveUsername =
    !!usernameTrimmed &&
    isValidUsername(usernameTrimmed) &&
    (usernameUnchanged || usernameStatus.state === 'available' || usernameStatus.state === 'ok');

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Live (debounced) username availability check (only while editing)
  useEffect(() => {
    if (!isEditing) return;

    if (!usernameTrimmed) {
      setUsernameStatus({ state: 'invalid', message: 'Username is required.' });
      return;
    }

    if (!isValidUsername(usernameTrimmed)) {
      setUsernameStatus({ state: 'invalid', message: '3–24 chars, letters/numbers only.' });
      return;
    }

    // If unchanged, it's OK
    if (usernameUnchanged) {
      setUsernameStatus({ state: 'ok', message: 'Current username ✅' });
      return;
    }

    let cancelled = false;
    setUsernameStatus({ state: 'checking', message: 'Checking availability…' });

    const t = setTimeout(async () => {
      try {
        const ok = await isUsernameAvailable(usernameTrimmed);
        if (cancelled) return;
        if (ok) setUsernameStatus({ state: 'available', message: 'Username is available ✅' });
        else setUsernameStatus({ state: 'taken', message: 'That username is taken ❌' });
      } catch (e) {
        if (cancelled) return;
        setUsernameStatus({ state: 'checking', message: 'Could not check right now.' });
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [isEditing, usernameLower, usernameUnchanged, usernameTrimmed]);

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const uname = (formData.username || '').trim();
      if (!isValidUsername(uname)) {
        throw new Error('Username must be 3–24 characters and letters/numbers only.');
      }

      // If username changed, update it atomically in Firestore
      if (normalizeUsername(uname) !== originalUsernameLower) {
        await changeUsername({ uid: userId, username: uname });
      }

      // Your existing profile update call (keeps first/last/email updates)
      await AuthService.updateUserProfile(userId, formData);

      setIsEditing(false);
      window.location.reload();
    } catch (err) {
      if (err?.message === 'USERNAME_TAKEN') {
        setError('That username is already taken. Try another.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError(null);
    setSuccessMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, passwordData.newPassword);

      setSuccessMessage('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
    } catch (err) {
      if (err.code === 'auth/wrong-password') {
        setPasswordError('Current password is incorrect');
      } else {
        setPasswordError(err.message || 'Failed to update password');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: profile?.profile?.firstName || '',
      lastName: profile?.profile?.lastName || '',
      email: profile?.email || '',
      username: profile?.username || '',
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

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
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

          {/* Username fits nicely in the 2-column grid */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Username
            </label>

            {isEditing ? (
              <>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="input-focus w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                  placeholder="e.g. SourAppleMonkey24"
                  autoComplete="username"
                />
                {usernameStatus.state !== 'idle' && (
                  <div className="text-xs mt-1 text-[var(--text-muted)]">{usernameStatus.message}</div>
                )}
              </>
            ) : (
              <p className="text-[var(--text-primary)]">{profile.username || 'Not set'}</p>
            )}
          </div>

          {/* Email sits in the grid too */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Email
              {isOAuthUser && (
                <span className="ml-2 text-xs text-[var(--text-muted)]">
                  (managed by {user?.providerData?.[0]?.providerId === 'google.com' ? 'Google' : 'GitHub'})
                </span>
              )}
            </label>
            {isEditing && isEmailPasswordUser ? (
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
        </div>

        <div className="text-sm text-[var(--text-muted)]">
          <p>
            Member since:{' '}
            {profile.timestamps?.createdAt
              ? new Date(
                  profile.timestamps.createdAt.toDate
                    ? profile.timestamps.createdAt.toDate()
                    : profile.timestamps.createdAt
                ).toLocaleDateString()
              : 'Unknown'}
          </p>
          <p>
            Last login:{' '}
            {profile.timestamps?.lastLoginAt
              ? new Date(
                  profile.timestamps.lastLoginAt.toDate
                    ? profile.timestamps.lastLoginAt.toDate()
                    : profile.timestamps.lastLoginAt
                ).toLocaleDateString()
              : 'Unknown'}
          </p>
        </div>
      </div>

      {isEditing && (
        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleSave}
            disabled={loading || !canSaveUsername}
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

      {isEmailPasswordUser && (
        <div className="mt-8 pt-6 border-t border-[var(--border)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">Change Password</h3>
            {!showPasswordChange && (
              <button
                onClick={() => setShowPasswordChange(true)}
                className="px-4 py-2 bg-[var(--primary-400)] text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
              >
                Change Password
              </button>
            )}
          </div>

          {showPasswordChange && (
            <div className="space-y-4">
              {passwordError && (
                <div className="bg-[var(--error-bg)] border border-[var(--error-border)] text-[var(--error-text)] px-4 py-3 rounded">
                  {passwordError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordInputChange}
                  className="input-focus w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                  className="input-focus w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  className="input-focus w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handlePasswordChange}
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-[var(--success)] hover:bg-green-600 disabled:bg-[var(--neutral-400)] text-white rounded-md transition-colors"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordChange(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordError(null);
                  }}
                  className="px-4 py-2 bg-[var(--neutral-400)] hover:bg-[var(--neutral-500)] text-white rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;