/**
 * This is the main App component.
 * This is how our application is run.
 * Some routes are private routes. meaning the user has to be signed in
 * Notice that some components are enclosed in the contexts, this is how we share state between these components. 
 * The routes are enclosed in the authprovider, this is how we ensure authenticaiton throughout the application
 */
import NavBar from './components/navbar/NavBar'
import { Route, Routes } from "react-router-dom";
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
import { ResultsProvider } from './contexts/ResultsContext';
import Dashboard from './components/dashboard/Dashboard'
import ForgotPassword from './components/login/ForgotPassword'
import UpdateProfile from './components/login/UpdateProfile'
import PrivateRoute from './routes/PrivateRoute';
import PrivateSigninRoute from './routes/PrivateSigninRoute'
import DeveloperRoute from './routes/DeveloperRoute';
import CustomQuiz from './components/customquiz/CustomQuiz.jsx';
import DeckManager from './components/flashcards/DeckManager';
import MyFlashcards from './components/flashcards/MyFlashcards';
import EditCustomQuiz from "./components/customquiz/EditCustomQuiz"
import SelectSubCategory from './components/quizselect/SelectSubCategory';
import TypeOfQuiz from './pages/TypeOfQuiz';
import Developer from './components/developer/AddDefaultQuestion';
import AllCustomQuizzes from './components/quizselect/customquizselect/AllCustomQuizzes';
import AllTeacherQuizzes from './components/quizselect/customquizselect/AllTeacherQuizzes';
import CustomQuizActivity from './components/quiz/CustomQuizActivity'
import { Footer } from './components/ui/index.jsx';
import Settings from './components/settings/Settings'
import { CATEGORY_DESTINATIONS } from './constants/quizConstants.jsx';
import { useAuth } from './contexts/AuthContext';
import Presentation from './components/presentation/presentation';

function App() {
  const { user, loading, error } = useAuth();
  const isAuthenticated = !!user;

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <AppProvider>
        <QuizProvider>
          <ResultsProvider>
            <NavBar />
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
              <Settings />
          }/>

          <Route path="/quizzes">
            <Route index element={
              <PrivateRoute>
                <SelectQuiz />
              </PrivateRoute>
            }/>
            <Route path="random" element={
              <PrivateRoute>
                <SelectSubCategory />
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
                
                  <QuizActivity />
                
              </PrivateRoute>
            }/>
          </Route>

          <Route index path="/quizstarted/:quizID" element={
            <PrivateRoute>
              
                <CustomQuizActivity />
             
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

          <Route path="/myflashcards" element={
            <PrivateRoute>
              <MyFlashcards />
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

          <Route path="/presentation" element={<Presentation />} />

          <Route path="*" element={<NotFound />} />
            </Routes>

            <Footer />
          </ResultsProvider>
        </QuizProvider>
      </AppProvider>
    </div>
  )
}

export default App