import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Q from '../icons/Q';

export default function Header() {
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
    <header className="bg-gray-900 text-white h-16 flex items-center justify-between px-6 rounded-lg mx-2 relative z-50">
      {/* Q Icon on the left */}
      <div className="w-10 h-10 flex items-center">
        <Q />
      </div>

      {/* Centered Title with White Text */}
      <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-extrabold tracking-wide uppercase">
        QUIZMASTER
      </h1>

      {/* User Dropdown - Aligned to the Right */}
      {currentUser && (
        <div className="relative ml-auto">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-sm font-bold text-gray-100 hover:underline hover:scale-110 transition-all"
          >
            Welcome, {currentUser.displayName}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-right text-gray-100 hover:bg-gray-600 rounded-lg"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
