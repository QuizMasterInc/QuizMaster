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
    <div className="flex flex-col h-screen justify-center items-center bg-gradient-to-t from-black via-gray-900 to-gray-800">
      <div className="w-full max-w-md space-y-6">
        <div>
          <div className="flex justify-center">
            <Q />
          </div>
          <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Or{" "}
            <Link
              className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
              to="/register"
            >
              Create your account
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
              <label
                htmlFor="email-address"
                className="block text-left font-semibold text-white"
              >
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
              <label
                htmlFor="password"
                className="block text-left font-semibold text-white"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-2 w-full rounded border border-gray-500 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400"
                placeholder="Password"
                ref={passwordRef}
              />
            </div>
            <div className="text-sm text-indigo-400 hover:text-indigo-300 hover:underline">
              <Link to="/forgotpassword">Forgot your password?</Link>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-indigo-600 py-2 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
              >
                Sign in
              </button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-300">Or</p>
            <div className="mt-4 flex justify-center">
              <GoogleButton
                style={{
                  backgroundColor: "#1c1c1c",
                  color: "#ffffff",
                  border: "1px solid #4a4a4a",
                }}
                onClick={handleGoogleSignIn}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
