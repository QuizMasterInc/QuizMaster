import './App.css'
import NavBar from './components/NavBar'
import { Route, Routes} from "react-router-dom";
import Test from './components/pages/Test';
import Test2 from './components/pages/Test2';
import NotFound from './components/pages/NotFound'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Test />}/>
        <Route path="/about" element={<Test2 />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <NavBar />
    </div>
  )
}
export default App