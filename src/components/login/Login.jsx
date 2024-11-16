/**
* Template used from https://tailwindui.com/components/application-ui/forms/sign-in-forms
* This is used for the login page for email/password and Google signin
*/
import React, { useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, Navigate } from "react-router-dom";
import { GoogleButton } from "react-google-button";
import Q from "../icons/Q";

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login, googleLogin } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handles email/password authentication
  async function handleSubmit(e) {
    e.preventDefault();
    let isAuth = false;

    try {
      setError("");
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      isAuth = true;
      localStorage.setItem("isAuthenticated", "true");
    } catch {
      setError("Failed to sign in");
    }
    setLoading(false);

    if (isAuth) {
      return <Navigate to="/quizzes" />;
    }
  }

  // Handles Google authentication
  async function handleGoogleSignIn(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await googleLogin();
      localStorage.setItem("isAuthenticated", "true");
    } catch {
      setError("Failed to sign in with Google");
    }
    setLoading(false);
  }

  return (
    <>
      <div className="flex flex-col h-screen justify-center items-center bg-gray-100">
        <div className="w-full max-w-md space-y-8">
          <div>
            <div className="flex flex-row justify-center align-middle">
              <Q />
            </div>
            <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-gray-700">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-500">
              Or{" "}
              <Link
                className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
                to="/register"
              >
                Create your account
              </Link>
            </p>
            {error && (
              <label className="block mt-3 font-semibold text-center text-black bg-red-400 py-3">
                {error}
              </label>
            )}
          </div>
          <div className="mt-4 bg-white shadow-md rounded-lg px-8 py-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email-address"
                  className="block text-left font-semibold"
                >
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Email"
                  ref={emailRef}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-left font-semibold"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Password"
                  ref={passwordRef}
                />
              </div>
              <div className="text-sm text-indigo-600 hover:text-indigo-500 hover:underline">
                <Link to="/forgotpassword">Forgot your password?</Link>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-indigo-600 py-2 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Sign in
                </button>
              </div>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">Or</p>
              <div className="mt-4">
                <GoogleButton onClick={handleGoogleSignIn} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}