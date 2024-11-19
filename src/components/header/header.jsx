import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const headerClasses = 'bg-gray-800 text-white text-left box-border h-1 relative z-50 p-7 rounded ml-2 mr-2';
  const { currentUser, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  /**
   * Logout function
   * @returns to signin once the user logs out
   */
  async function handleLogout() {
    try {
      await logout();
      localStorage.setItem('isAuthenticated', 'false');
      navigate('/signin');
    } catch {
      setError("Failed to logout");
    }
  }

  return (
    <header className={headerClasses}>
      <h1>QUIZMASTER</h1>
      <div className="fixed space-y-4 right-6 top-4">
        {currentUser && (
          <div className="relative">
            {/* User name that toggles the dropdown */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-xs font-bold text-gray-100 hover:underline hover:scale-110 transition-all"
            >
              Welcome, {currentUser.email}
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg">
                <button
                  onClick={handleLogout}
                  className="flex justify-center items-center w-full px-4 py-2  text-left text-gray-100 hover:bg-gray-600 rounded-lg shadow-lg"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
