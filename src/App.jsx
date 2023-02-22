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
import Signout from './components/login/Signout'
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/quizzes" element={<SelectQuiz />} />
          <Route path="/quizzes/:quiz" element={<QuizActivity />}/>
          <Route path='/signin' element={<Login />}/>
          <Route path='/register' element={<Register />}/>
          <Route path='/signout' element={
            <PrivateRoute>
              <Signout />
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