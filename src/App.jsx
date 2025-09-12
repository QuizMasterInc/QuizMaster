/**
 * This is the main App component.
 * This is how our application is run.
 * Some routes are private routes. meaning the user has to be signed in
 * Notice that some components are enclosed in the contexts, this is how we share state between these components. 
 * The routes are enclosed in the authprovider, this is how we ensure authenticaiton throughout the application
 */
import NavBar from './components/navbar/NavBar'
import { Route, Routes, useNavigate } from "react-router-dom";
import React, { useState } from 'react';
import NotFound from './pages/NotFound';
import SelectQuiz from './components/quizselect/SelectQuiz';
import QuizActivity from './components/quiz/QuizActivity';
import Login from './components/login/Login';
import Register from './components/login/Register';
import Home from './components/home/Home';
import About from './components/about/About';
import Contact from './components/contact/Contact';
import { AppProvider } from './contexts/AppContext';
import { QuizProvider } from './contexts/QuizContext';
import Dashboard from './components/dashboard/Dashboard'
import ForgotPassword from './components/login/ForgotPassword'
import UpdateProfile from './components/login/UpdateProfile'
import PrivateRoute from './routes/PrivateRoute';
import PrivateSigninRoute from './routes/PrivateSigninRoute'
import DeveloperRoute from './routes/DeveloperRoute';
import CustomQuiz from './components/customquiz/CustomQuiz';
import DeckManager from './components/flashcards/DeckManager';
import EditCustomQuiz from "./components/customquiz/EditCustomQuiz"
import SelectSubCategory from './components/quizselect/SelectSubCategory';
import TypeOfQuiz from './pages/TypeOfQuiz';
import Developer from './components/developer/AddDefaultQuestion';
import AllCustomQuizzes from './components/quizselect/customquizselect/AllCustomQuizzes';
import AllTeacherQuizzes from './components/quizselect/customquizselect/AllTeacherQuizzes';
import CustomQuizActivity from './components/quiz/CustomQuizActivity'
import { Footer } from './components/ui/index.jsx';
import Settings from './components/settings/Settings'
import { VolumeSettingsProvider } from './contexts/VolumeContext';
import Chatbot from './components/chatbot/chatbot';
import { CATEGORY_ICONS, CATEGORY_DESTINATIONS } from './constants/quizConstants.jsx';
import { useAuth } from './contexts/AuthContext';
import { Q } from './components/icons/index.jsx';

// Inlined Header component
const Header = () => {
  const { currentUser, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/signin');
    } catch {
      console.error("Failed to logout");
    }
  }

  return (
    <header className="backdrop-blur bg-gradient-to-r from-[#1e0a3c] via-[#240e56] to-[#0f051d] shadow-md border-b border-purple-800 text-white h-16 flex items-center justify-between px-6 z-50 relative">


      <NavBar />

      {/* Centered Brand Name */}
      <h1 className="absolute left-1/2 transform -translate-x-1/2 text-xl sm:text-2xl font-extrabold tracking-wider bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text drop-shadow">
        QUIZMASTER
      </h1>

      {/* User Dropdown */}
      {currentUser && (
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-sm sm:text-base font-semibold text-white hover:text-blue-400 transition-all duration-200"
          >
            Welcome, {currentUser.displayName}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1a1034]/90 backdrop-blur-md border border-purple-800 rounded-xl shadow-xl z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-white hover:bg-purple-700/60 rounded-xl transition duration-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

function App() {
  const { user, loading, error } = useAuth();
  const isAuthenticated = !!user;

  console.log('App render - user:', user?.email || 'null', 'loading:', loading, 'isAuthenticated:', isAuthenticated);

  // Show loading spinner only briefly while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f051d] via-[#1b1444] to-[#0f051d] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show error state if there's an auth error
  if (error) {
    console.error('Auth error in App:', error);
  }

  return (
    <div className="App">
      <AppProvider>
        <QuizProvider>
          <Header />
          <Routes>
        {isAuthenticated ? (
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
        ) : (
          <Route path="/" element={<Home />} />
        )}          <Route path="/developer" element={
            <DeveloperRoute>
              <Developer />
            </DeveloperRoute>
          }/>
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/settings" element={
            <VolumeSettingsProvider>
              <Settings />
            </VolumeSettingsProvider>
          }/>

          <Route path="/quizzes">
            <Route index element={
              <PrivateRoute>
                <SelectQuiz />
              </PrivateRoute>
            }/>
            {CATEGORY_DESTINATIONS.map((destination, index) => (
              <Route 
                key={index} 
                path={destination} 
                element={
                  <PrivateRoute>
                    <SelectSubCategory />
                  </PrivateRoute>
                } 
                caseSensitive
              />
            ))}
            <Route path="quizstarted" element={
              <PrivateRoute>
                <VolumeSettingsProvider>
                  <QuizActivity />
                </VolumeSettingsProvider>
              </PrivateRoute>
            }/>
          </Route>

          <Route index path="/quizstarted/:quizID" element={
            <PrivateRoute>
              <VolumeSettingsProvider>
                <CustomQuizActivity />
              </VolumeSettingsProvider>
            </PrivateRoute>
          }/>

          <Route path="/customquiz" element={
            <PrivateRoute>
              <CustomQuiz />
            </PrivateRoute>
          }/>
          <Route index path="/customquiz/:quizID" element={
            <PrivateRoute>
              <EditCustomQuiz />
            </PrivateRoute>
          }/>

          <Route path="/flashcards" element={
            <PrivateRoute>
              <DeckManager />
            </PrivateRoute>
          }/>

          <Route path="/typeofquiz" element={
            <PrivateRoute>
              <TypeOfQuiz />
            </PrivateRoute>
          }/>

          <Route path="/allcustomquizzes" element={
            <PrivateRoute>
              <AllCustomQuizzes />
            </PrivateRoute>
          }/>
          <Route path="/allteacherquizzes" element={
            <PrivateRoute>
              <AllTeacherQuizzes />
            </PrivateRoute>
          }/>

          <Route path="/updateprofile" element={
            <PrivateRoute>
              <UpdateProfile />
            </PrivateRoute>
          }/>
          <Route path="/signin" element={
            <PrivateSigninRoute>
              <Login />
            </PrivateSigninRoute>
          }/>
          <Route path="/forgotpassword" element={
            <PrivateSigninRoute>
              <ForgotPassword />
            </PrivateSigninRoute>
          }/>
          <Route path="/register" element={
            <PrivateSigninRoute>
              <Register />
            </PrivateSigninRoute>
          }/>

          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }/>

          <Route path="*" element={<NotFound />} />
        </Routes>

        {/*<Chatbot />*/}

        {/*<div className="navbar">*/}
        {/*  <NavBar />*/}
        {/*</div>*/}

        <Footer />
        </QuizProvider>
      </AppProvider>
    </div>
  )
}

export default App