import React, {useRef, useState} from "react";
import {useAuth} from '../../contexts/AuthContext'
import { Link, Navigate } from "react-router-dom";

export default function Register() {
  const emailRef = useRef()
  const passwordRef = useRef()
  const confirmPasswordRef = useRef()
  const {signup} = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    var isAuth = false

    if(passwordRef.current.value !== confirmPasswordRef.current.value){
      return setError("Passwords do not match.")
    }

    try {
      setError('')
      setLoading(true)
      await signup(emailRef.current.value, passwordRef.current.value)
      isAuth = true
    } catch {
      setError("Failed to create an account")
    }
    setLoading(false)
    if(isAuth){
      return <Navigate to="/quizzes" />
    }
  }

  return (
      <div className="flex flex-col h-screen justify-center items-center bg-black">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-white">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-300">
              Already have an account?{' '}
              <Link className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline" to="/signin">
                Login here
              </Link>
            </p>
            {error && (
                <div className="mt-3 text-center bg-red-500 py-3 text-white font-semibold rounded">
                  {error}
                </div>
            )}
          </div>
          <div className="mt-4 bg-gray-700 shadow-lg rounded-lg px-8 py-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email-address" className="block text-left font-semibold text-white">
                  Email address
                </label>
                <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="mt-2 w-full rounded border border-gray-500 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400"
                    placeholder="Email"
                    ref={emailRef}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-left font-semibold text-white">
                  Password
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="mt-2 w-full rounded border border-gray-500 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400"
                    placeholder="Password"
                    ref={passwordRef}
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-left font-semibold text-white">
                  Confirm Password
                </label>
                <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="mt-2 w-full rounded border border-gray-500 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400"
                    placeholder="Confirm Password"
                    ref={confirmPasswordRef}
                />
              </div>
              <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-indigo-600 py-2 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
}
