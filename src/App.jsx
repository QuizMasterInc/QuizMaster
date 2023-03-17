import './App.css'
import NavBar from './components/navbar/NavBar'
import { Route, Routes } from "react-router-dom";
import NotFound from './components/404/NotFound';
import SelectQuiz from './components/quizselect/SelectQuiz';
import QuizActivity from './components/quiz/QuizActivity';
import Login from './components/login/Login';
import Register from './components/login/Register';
import Home from './components/home/Home';
import About from './components/about/About';
import Contact from './components/contact/Contact';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './components/dashboard/Dashboard'
import ForgotPassword from './components/login/ForgotPassword'
import PrivateRoute from './components/PrivateRoute';
import PrivateSigninRoute from './components/PrivateSigninRoute'
import { CategoryProvider } from './contexts/CategoryContext';

function App() {
  return (
    <div className="App">
      <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/quizzes" element={
              <CategoryProvider>
                <SelectQuiz />
              </CategoryProvider>
            }/>
            <Route path="/quizzes/:quiz" element={<QuizActivity />}/>
            <Route path='/signin' element={
              <PrivateSigninRoute>
                <Login />
              </PrivateSigninRoute>
            }/>
            <Route path="forgot-password" element={
              <PrivateSigninRoute>
                <ForgotPassword />
              </PrivateSigninRoute>
            }/>
            <Route path='/register' element={
              <PrivateSigninRoute>
                <Register />
              </PrivateSigninRoute>
            }/>
            <Route path='/signout' element={
              <PrivateRoute>
                <CategoryProvider>
                  <Dashboard />
                </CategoryProvider>
              </PrivateRoute>
            }/>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <NavBar />
      </AuthProvider>
    </div>
  )
}
export default App