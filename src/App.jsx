import './App.css'
import NavBar from './components/navbar/NavBar'
import { Route, Routes} from "react-router-dom";
import Test from './components/Test';
import Test2 from './components/Test2';
import NotFound from './components/404/NotFound'
import SelectQuiz from './components/quizselect/SelectQuiz';
import QuizTest from './components/quiz/QuizTest';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Test />}/>
        <Route path="/about" element={<Test2 />} />
        <Route path="/quizzes" element={<SelectQuiz />} />
        <Route path="/quizzes/:quiz" element={<QuizTest />}/>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <NavBar />
    </div>
  )
}
export default App