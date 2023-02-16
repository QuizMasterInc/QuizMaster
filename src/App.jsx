import './App.css'
import NavBar from './components/navbar/NavBar'
import { Route, Routes } from "react-router-dom";
import NotFound from './components/404/NotFound';
import SelectQuiz from './components/quizselect/SelectQuiz';
import QuizTest from './components/quiz/QuizTest';
import Home from './components/home/Home'
import Contact from './components/contact/contact';
import About from './components/about/About'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/about" element={<Contact />} />
        <Route path="/contact" element={<About />} />
        <Route path="/quizzes" element={<SelectQuiz />} />
        <Route path="/quizzes/:quiz" element={<QuizTest />}/>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <NavBar />
    </div>
  )
}
export default App