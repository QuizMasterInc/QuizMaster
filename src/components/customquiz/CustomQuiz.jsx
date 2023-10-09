import React, {useState, useEffect} from 'react'
import { useCategory } from '../../contexts/CategoryContext'
import {useAuth} from '../../contexts/AuthContext'
import { Link, Navigate } from 'react-router-dom'
import Q from '../icons/Q'


export default function CustomQuiz () {
  /**
   * state variables
   */
  const [error, setError] = useState('')
  const {currentUser, logout, isGoogleAuth} = useAuth()
  const [loading, setLoading] = useState(false)
  const {quizCategories, icons} = useCategory()
  const [results, setResults] = useState([])

  /**
   * Logout function
   * @returns to signin once the user logs out
   */
  async function handleLogout(){
    setError('')
     var isAuth = false
    try{
        await logout()
        setLoading(true)
        isAuth = true
    }catch{
        setError("Failed to logout")
    }
    setLoading(false)
    localStorage.setItem('isAuthenticated', 'false');
    if(isAuth){
      return (
        <Navigate to="/signin" />
      )
    }
}


    return (
    <>
    <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
            <h1 className="text-2xl font-bold text-gray-300">
                Create a Custom Quiz!
            </h1>
          <div className='flex flex-col items-center justify-center'>
            <Link to={'/quizzes'}>
                  <div className='flex relative items-center mb-4 p-4 pl-8 pr-8 space-y-4 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600 -md:ml-20'>
                    Take a premade quiz!
                  </div>
            </Link>
            {!isGoogleAuth && <Link to={'/updateprofile'}>
                  <div className='flex relative items-center mb-4 p-4 pl-8 pr-8 space-y-4 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600 -md:ml-20'>
                    Update Profile
                  </div>
                  </Link>}
            <button
                disabled={loading}
                onClick={handleLogout}
                className="flex relative items-center p-4 pl-8 pr-8 space-y-4 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600 -md:ml-20"
            >
              Logout
            </button>
          </div>
        </div>
    </div>
    </>
    )
}
