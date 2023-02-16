import './App.css'
import NavBar from './components/navbar/Navbar'
import { Route, Routes } from "react-router-dom";
import NotFound from './components/404/NotFound';
import SelectQuiz from './components/quizselect/SelectQuiz';
import QuizTest from './components/quiz/QuizTest';
import Home from './components/home/home';
import About from './components/about/about';
import Contact from './components/contact/contact';


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/quizzes" element={<SelectQuiz />} />
        <Route path="/quizzes/:quiz" element={<QuizTest />}/>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <NavBar />
    </div>
  )
}
export default App