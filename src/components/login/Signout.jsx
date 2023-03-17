import React, {useState} from 'react'
import {useAuth} from '../../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

export default function Signout() {
    const [error, setError] = useState('')
    const {currentUser, logout} = useAuth()
    const [loading, setLoading] = useState(false)

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
          <div>
            <img
              className="mx-auto h-12 w-auto"
              src="../../logo.svg"
              alt="QuizMaster"
            />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-300">
              Profile
            </h2>
            <h3 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-300">
              Email: {currentUser.email}</h3> 
            <h2 className="mt-6 text-center text-xl font-bold tracking-tight text-gray-300">WORK IN PROGRESS</h2>
            {error && <label className="block mt-3 font-semi-bold text-center text-black bg-red-400 py-3">{error}</label>}
          </div>
          <div>
                <button
                    disabled={loading}
                    onClick={handleLogout}
                    className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Logout
                </button>
              </div>
        </div>
    </div>
    </>)
}
