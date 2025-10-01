import React, {useRef, useState, useEffect} from "react";
import {useAuth} from '../../contexts/AuthContext'
import { Link, Navigate, useNavigate } from "react-router-dom";
import { GoogleButton } from "react-google-button";

export default function Register() {
  const firstNameRef = useRef()
  const lastNameRef = useRef()
  const titleRef = useRef()
  const emailRef = useRef()
  const passwordRef = useRef()
  const confirmPasswordRef = useRef()
  const {signup, googleRegister, isAuthenticated, loading: authLoading} = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Function to detect system theme preference
  const getSystemTheme = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light'
    }
    // Default fallback to light
    return 'light'
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if(passwordRef.current.value !== confirmPasswordRef.current.value){
      return setError("Passwords do not match.")
    }

    // Validate required fields
    if (!firstNameRef.current.value.trim()) {
      return setError("First name is required.")
    }

    if (!lastNameRef.current.value.trim()) {
      return setError("Last name is required.")
    }

    try {
      setError('')
      setLoading(true)
      
      // Prepare complete user data for schema compliance
      const userData = {
        email: emailRef.current.value,
        password: passwordRef.current.value,
        firstName: firstNameRef.current.value.trim(),
        lastName: lastNameRef.current.value.trim(),
        title: titleRef.current.value.trim() || '',
        theme: getSystemTheme()
      }
      
      await signup(userData)
      // Success - user will be redirected automatically by auth state change
    } catch (error) {
      setError(error.message || "Failed to create an account")
      setLoading(false)
    }
  }

  async function handleGoogleRegister(e) {
    e.preventDefault()

    try {
      setError('')
      setLoading(true)
      
      console.log('Starting Google registration...')
      
      // Prepare additional data from form (if filled)
      const additionalData = {
        firstName: firstNameRef.current?.value?.trim() || '',
        lastName: lastNameRef.current?.value?.trim() || '',
        title: titleRef.current?.value?.trim() || '',
        theme: getSystemTheme()
      }
      
      console.log('Additional data for Google registration:', additionalData)
      
      const result = await googleRegister(additionalData)
      console.log('Google registration successful:', result)
      // Success - user will be redirected automatically by auth state change
    } catch (error) {
      console.error('Google registration failed:', error)
      setError(error.message || "Failed to create account with Google")
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
          <p className="text-sm text-secondary mb-2">
            Fill out all required fields (*) to get started with QuizMaster. Theme will automatically match your system preference.
          </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first-name" className="block text-left font-semibold mb-2 text-primary">
                First Name *
              </label>
              <input
                id="first-name"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                className="w-full rounded-lg px-4 py-3 transition-all duration-200 border bg-input text-primary border-input input-focus"
                placeholder="First Name"
                ref={firstNameRef}
                onChange={() => error && setError("")}
              />
            </div>
            <div>
              <label htmlFor="last-name" className="block text-left font-semibold mb-2 text-primary">
                Last Name *
              </label>
              <input
                id="last-name"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                className="w-full rounded-lg px-4 py-3 transition-all duration-200 border bg-input text-primary border-input input-focus"
                placeholder="Last Name"
                ref={lastNameRef}
                onChange={() => error && setError("")}
              />
            </div>
          </div>
          <div>
            <label htmlFor="title" className="block text-left font-semibold mb-2 text-primary">
              Title/Position <span className="text-secondary text-sm">(Optional)</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              autoComplete="organization-title"
              className="w-full rounded-lg px-4 py-3 transition-all duration-200 border bg-input text-primary border-input input-focus"
              placeholder="e.g., Student, Teacher, Manager"
              ref={titleRef}
              onChange={() => error && setError("")}
            />
          </div>
          <div>
            <label htmlFor="email-address" className="block text-left font-semibold mb-2 text-primary">
              Email address *
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
              Password *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="w-full rounded-lg px-4 py-3 transition-all duration-200 border bg-input text-primary border-input input-focus"
              placeholder="Password (min. 6 characters)"
              ref={passwordRef}
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-left font-semibold mb-2 text-primary">
              Confirm Password *
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
        <div className="mt-8 text-center">
          <p className="text-sm mb-4 text-secondary">Or</p>
          <div className="flex justify-center">
            <GoogleButton
              className="bg-input text-primary border border-input"
              onClick={handleGoogleRegister}
              disabled={loading}
              label={loading ? "Creating account..." : "Sign up with Google"}
            />
          </div>
          <p className="text-xs text-secondary mt-2">
            Google registration will use your Google profile information and automatically detect your system theme preference.
          </p>
        </div>
      </div>
    </div>
  );
}
