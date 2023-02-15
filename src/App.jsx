import './App.css'
import { Route, Routes} from "react-router-dom";
import Login from './components/login/Login';
import Register from './components/login/Register'
import Test from './components/Test';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Test />}/>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  )
}
export default App