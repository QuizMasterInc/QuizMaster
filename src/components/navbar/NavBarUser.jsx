import React from "react";
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function NavBarUser() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

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
      console.error("Failed to logout");
    }
  }

  return (
    <div className="fixed space-y-4 right-6 top-4 sm:top-2 text-right z-50">
      {/* Display user email if logged in */}
      {currentUser && (
        <div className="text-sm font-semibold text-white drop-shadow-sm sm:text-xs">
          Welcome, {currentUser.displayName || currentUser.email}
        </div>
      )}

      {/* Logout button */}
      {currentUser && (
        <button
          onClick={handleLogout}
          className="bg-gradient-to-r from-purple-700 to-blue-700 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-6 py-2 rounded-full shadow-md transition-transform duration-200 hover:scale-105"
        >
          Logout
        </button>
      )}
    </div>
  );
}
