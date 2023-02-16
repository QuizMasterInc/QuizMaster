import './App.css'
import NavBar from './components/navbar/NavBar'
import { Route, Routes } from "react-router-dom";
import About from './components/about/About'
import Contact from './components/contact/Contact';
import Home from './components/home/Home';
import NotFound from './components/404/NotFound'
import SelectQuiz from './components/quizselect/SelectQuiz';
import QuizTest from './components/quiz/QuizTest';
import Login from './components/login/Login';
import Register from './components/login/register';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/quizzes" element={<SelectQuiz />} />
        <Route path="/quizzes/:quiz" element={<QuizTest />}/>
        <Route path='/signin' element={<Login />}/>
        <Route path='/register' element={<Register />}/>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <NavBar />
    </div>
  )
}
export default App