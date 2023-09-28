/**
* Template used from https://tailwindui.com/components/application-ui/forms/sign-in-forms
* This is used for the login page for email/password and Google signin
*/
import React, {useRef, useState} from "react";
import {useAuth} from '../../contexts/AuthContext'
import { Link } from "react-router-dom";
import {GoogleButton} from 'react-google-button';
import { Navigate } from "react-router-dom";
import Q from '../icons/Q';

//State variables
export default function Login() {
  const emailRef = useRef()
  const passwordRef = useRef()
  const {login, googleLogin} = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  //Handles email/password authentication
  async function handleSubmit(e) {
    e.preventDefault()
    var isAuth = false

    try{
      setError('')
      setLoading(true)
      await login(emailRef.current.value, passwordRef.current.value)
      isAuth = true
      /* This stores the login status for the users 
      local device to redirect them to the right page when the 
      page closes and re opens. If it is true then they will go 
      to the dashboard else they will land at the home page
      */
      localStorage.setItem('isAuthenticated', 'true');

    //If login fails
    }catch{
        setError("Failed to sign in")
    }
    setLoading(false)
    //Redirects to quizzes page if router does not work
    if(isAuth){
      return (
        <Navigate to="/quizzes" />
            )
      }
    }

  //Handles Google authentication
  async function handleGoogleSignIn(e) {
    e.preventDefault()

    try{
      setError('')
      setLoading(true)
      await googleLogin()
      /* This stores the login status for the users 
      local device to redirect them to the right page when the 
      page closes and re opens. If it is true then they will go 
      to the dashboard else they will land at the home page
      */
      localStorage.setItem('isAuthenticated', 'true');
    //If Google auth fails
    }catch{
        setError("Failed to sign in with google")
    }
    setLoading(false)
  }

  return (
    <>
      <div className="flex flex-col md:flex-row h-full items-center justify-center mt-20 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <div className='flex flex-row justify-center align-middle -xl:ml-16'>
            <Q />
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-300 -md:text-lg -xl:ml-16">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-300 tracking-tight -xl:ml-16">
              Or{' '}
              <Link className="font-medium text-base text-indigo-600 hover:text-indigo-500 hover:underline" to="/register">Create your account</Link>
            </p>
            {error && <label className="block mt-3 font-semi-bold text-center tracking-tight -xl:ml-16 text-black bg-red-400 py-3">{error}</label>}
          </div>
          <div className="mt-4 bg-gray-300 shadow-md rounded-lg px-10 py-1 tracking-tight -xl:ml-16">
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <input type="hidden" name="remember" defaultValue="true" />
              <div className="-space-y-px shadow-sm">
                <div>
                  <label htmlFor="email-address" className="sr-only">
                    Email
                  </label>
                  <label className="block mt-3 font-semibold text-left">Email address</label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className=" mt-3 relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    placeholder="Email"
                    ref={emailRef}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <label className="block mt-3 font-semibold text-left">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className=" mt-3 relative rounded block w-full appearance-none border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    placeholder="Password"
                    ref={passwordRef}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-indigo-600 hover:text-indigo-500 hover:underline">
                  <Link to="/forgotpassword">Forgot your password?</Link>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Sign in
                </button>
              </div>
            </form>
            <div className="mt-6 text-center flex flex-col items-center">
              <p className="mt-.5 text-sm py-1 text-black font-bold">
                Or{' '}
              </p>
              <div className="flex flex-col items-center my-5">
              <GoogleButton onClick={handleGoogleSignIn} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}