import React, { useState } from 'react';
import {useAuth} from '../../contexts/AuthContext'

export default function Header () {

const headerClasses = 'bg-gray-800 text-white text-left box-border h-1 relative z-50 p-7 rounded ml-2 mr-2';
// Use headerStyle in your component
const {currentUser, logout} = useAuth()

   /**
     * Logout function
     * @returns to signin once the user logs out
     */
   async function handleLogout(){
    try{
        await logout()
        localStorage.setItem('isAuthenticated', 'false');
        navigate('/signin');
    }catch{
        setError("Failed to logout")
    }
}

return (
  <header className={headerClasses}>
      <h1>QUIZMASTER</h1>

      <div className="fixed space-y-4 right-6 top-2 -sm:w-16 -sm:space-y-1">
        <div className="mt-2 mb-4 text-xs font-bold text-gray-100 right-2 -md:text-sm -xl:ml-20">
          {/* Conditionally render the user's account if they are currently signed in */}
          {!currentUser ? null : <h6>Welcome, {currentUser.email}</h6>}
        </div>

        {!currentUser ? null : (
          <button
            onClick={handleLogout}
            className="flex relative font-bold items-center p-4 pl-8 pr-8 space-y-4 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600 -md:ml-20"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  )
}

