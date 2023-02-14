import './App.css'
import {Route, Routes} from "react-router-dom";
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
      </Routes>
    </div>
  )
}
export default App