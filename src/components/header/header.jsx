import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Q from '../icons/Q';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { currentUser, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

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
    <header className="backdrop-blur bg-gradient-to-r from-[#1e0a3c] via-[#240e56] to-[#0f051d] shadow-md border-b border-purple-800 text-white h-16 flex items-center justify-between px-6 z-50 relative">
      
      {/* Q Icon */}
      <div className="w-10 h-10 flex items-center">
        <Q className="fill-white w-8 h-8 drop-shadow" />
      </div>

      {/* Centered Brand Name */}
      <h1 className="absolute left-1/2 transform -translate-x-1/2 text-xl sm:text-2xl font-extrabold tracking-wider bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text drop-shadow">
        QUIZMASTER
      </h1>

      {/* User Dropdown */}
      {currentUser && (
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-sm sm:text-base font-semibold text-white hover:text-blue-400 transition-all duration-200"
          >
            Welcome, {currentUser.displayName}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1a1034]/90 backdrop-blur-md border border-purple-800 rounded-xl shadow-xl z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-white hover:bg-purple-700/60 rounded-xl transition duration-200"
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
