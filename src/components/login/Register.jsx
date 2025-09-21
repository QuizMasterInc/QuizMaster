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

    if(passwordRef.current.value !== confirmPasswordRef.current.value){
      return setError("Passwords do not match.")
    }

    try {
      setError('')
      setLoading(true)
      await signup(emailRef.current.value, passwordRef.current.value)
      // Success - user will be redirected automatically by auth state change
    } catch (error) {
      setError(error.message || "Failed to create an account")
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen justify-center items-center px-4 bg-primary">
      <div className="w-full max-w-md shadow-2xl rounded-xl px-8 py-8 border bg-secondary border-primary">
        {error && (
          <div className="mb-6 text-center py-3 font-semibold rounded-lg border input-error">
            {error}
          </div>
        )}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-primary">
            Create your account
          </h2>
          <p className="text-sm text-secondary">
            Already have an account?{' '}
            <Link 
              to="/signin" 
              className="font-medium transition-colors duration-200 hover:underline text-accent hover:text-accent-hover"
            >
              Login here
            </Link>
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email-address" className="block text-left font-semibold mb-2 text-primary">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-lg px-4 py-3 transition-all duration-200 border bg-input text-primary border-input input-focus"
              placeholder="Email"
              ref={emailRef}
              onChange={() => error && setError("")}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-left font-semibold mb-2 text-primary">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="w-full rounded-lg px-4 py-3 transition-all duration-200 border bg-input text-primary border-input input-focus"
              placeholder="Password"
              ref={passwordRef}
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-left font-semibold mb-2 text-primary">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              className="w-full rounded-lg px-4 py-3 transition-all duration-200 border bg-input text-primary border-input input-focus"
              placeholder="Confirm Password"
              ref={confirmPasswordRef}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-3 font-semibold transition-all duration-200 border-none cursor-pointer flex items-center justify-center bg-btn-primary text-btn-primary hover:bg-accent-hover btn-hover disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
