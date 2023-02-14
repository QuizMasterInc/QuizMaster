import './App.css'
import {Route, Routes} from "react-router-dom";
import Home from './components/pages/home';
import About from './components/pages/about';
import Contact from './components/pages/contact';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  )
}
export default App