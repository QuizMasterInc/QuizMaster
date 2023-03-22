import React, {useRef, useState} from "react";
import {useAuth} from '../../contexts/AuthContext'
import { Link } from "react-router-dom";

export default function UpdateProfile() {
  const newEmailRef = useRef()
  const newPasswordRef = useRef()
  const confirmNewPasswordRef = useRef()
  const {currentUser, updateEmail, updatePassword, isGoogleAuth} = useAuth()
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()  

    if(isGoogleAuth){
        return setError("Can not update Google account")
    }
    if(newPasswordRef.current.value !== confirmNewPasswordRef.current.value){
        return setError("New Passwords do not match")
    }

    const promises = []
    setLoading(true)
    setError('')
    setMessage('')

    if(newEmailRef.current.value !== currentUser.email){
        promises.push(updateEmail(newEmailRef.current.value))
    }
    if(newPasswordRef.current.value){
        promises.push(updatePassword(newPasswordRef.current.value))
    }

    Promise.all(promises).then(() => {
        setMessage('Profile has been updated')
    }).catch(() => {
        setError("Failed to update account")
    }).finally(() => {
        setLoading(false)
    })
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
              Update Profile
            </h2>
            {error && <label className="block mt-3 font-semi-bold text-center text-black bg-red-400 py-3">{error}</label>}
            {message && <label className="block mt-3 font-semi-bold text-center text-black bg-green-400 py-3">{message}</label>}
          </div>
          <div className="mt-4 bg-gray-300 shadow-md rounded-lg px-10 py-1">
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <input type="hidden" name="remember" defaultValue="true" />
              <div className="-space-y-px rounded-md shadow-sm">
                <div>
                  <label htmlFor="email-address" className="sr-only">
                    New Email
                  </label>
                  <label className="block mt-3 font-semibold text-left">New Email address</label>
                  <input
                    id="new-email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className=" mt-3 relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    defaultValue={currentUser.email}
                    ref={newEmailRef}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    New Password
                  </label>
                  <label className="block mt-3 font-semibold text-left">New Password</label>
                  <input
                    id="new-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Leave blank to keep the same"
                    className=" mt-3 relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    ref={newPasswordRef}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Confirm New Password
                  </label>
                  <label className="block mt-3 font-semibold text-left">Confirm New Password</label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="current-password"
                    className=" mt-3 relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    placeholder="Leave blank to keep the same"
                    ref={confirmNewPasswordRef}
                  />
                </div>
              </div>
              <div>
                <button
                  disabled={loading}
                  type="submit"
                  className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Update
                </button>
              </div>
              <p className="mt-2 text-center text-sm">
              <Link className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline" to="/dashboard">Dashboard</Link>
            </p>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}