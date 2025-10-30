import { useRef, useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { GoogleButton } from "react-google-button";

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login, googleLogin, isAuthenticated, loading: authLoading } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, authLoading, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
    } catch (error) {
      setError(error.message || "Failed to sign in");
      setLoading(false);
    }
  }

  async function handleGoogleSignIn(e) {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await googleLogin();
    } catch (error) {
      setError(error.message || "Failed to sign in with Google");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen justify-center items-center px-4 bg-primary">
      <div className="w-full max-w-md shadow-2xl rounded-xl px-8 py-8 border bg-secondary border-primary">
        {error && (
          <div className="mb-6 text-center py-3 font-semibold rounded-lg border text-error bg-red-50 border-red-300">
            {error}
          </div>
        )}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-primary">
            Sign in to your account
          </h2>
          <p className="text-sm text-secondary">
            Or{' '}
            <Link 
              to="/register" 
              className="font-medium transition-colors duration-200 hover:underline text-accent hover:text-accent"
            >
              Create your account
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
              className="w-full rounded-lg px-4 py-3 transition-all duration-200 border bg-input text-primary border-input focus:border-accent focus:ring-2 focus:ring-purple-100 focus:outline-none"
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
              autoComplete="current-password"
              required
              className="w-full rounded-lg px-4 py-3 transition-all duration-200 border bg-input text-primary border-input focus:border-accent focus:ring-2 focus:ring-purple-100 focus:outline-none"
              placeholder="Password"
              ref={passwordRef}
              onChange={() => error && setError("")}
            />
          </div>
          <div className="text-left">
            <Link 
              to="/forgotpassword" 
              className="text-sm font-medium transition-colors duration-200 hover:underline text-accent hover:text-accent"
            >
              Forgot your password?
            </Link>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-lg py-3 font-semibold transition-all duration-200 border-none cursor-pointer flex items-center justify-center text-white ${
                loading 
                  ? 'bg-purple-500 opacity-80 cursor-not-allowed' 
                  : 'bg-accent hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-lg'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
        <div className="mt-8 text-center">
          <p className="text-sm mb-4 text-secondary">Or</p>
          <div className="flex justify-center">
            <GoogleButton
              className="bg-input text-primary border border-input"
              onClick={handleGoogleSignIn}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
