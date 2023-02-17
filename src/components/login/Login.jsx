//Template used from https://tailwindui.com/components/application-ui/forms/sign-in-forms
import React, {useRef, useState} from "react";
import {useAuth} from '../../contexts/AuthContext'


export default function Login() {
  const emailRef = useRef()
  const passwordRef = useRef()
  const {login} = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  

  async function handleSubmit(e) {
    e.preventDefault()

    try{
      setError('')
      setLoading(true)
      await login(emailRef.current.value, passwordRef.current.value)
      window.location.replace('/quizzes')
      
    }catch{
        setError("Failed to sign in")
    }
    setLoading(false)
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
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-300">
              Or{' '}
              <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                create your account
              </a>
            </p>
            {error && <label className="block mt-3 font-semi-bold text-center text-black bg-red-400 py-3">{error}</label>}
          </div>
          <div className="mt-4 bg-gray-300 shadow-md rounded-lg px-10 py-1">
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <input type="hidden" name="remember" defaultValue="true" />
              <div className="-space-y-px rounded-md shadow-sm">
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
                    className=" mt-3 relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    placeholder="Password"
                    ref={passwordRef}
                  />
                </div>
              </div>
              

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                    Forgot your password?
                  </a>
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
          </div>
        </div>
      </div>
    </>
  )
}