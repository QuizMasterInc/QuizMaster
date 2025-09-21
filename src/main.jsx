/**
 * This is the main component.
 * This hosts our main app component. 
 * This mounts itself to the index.html root div
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from './contexts/AuthContext';
import './styles/index.css'

// Initialize dark mode immediately on app load
const initializeDarkMode = () => {
  const savedMode = localStorage.getItem('darkMode');
  if (savedMode === 'true') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Run initialization immediately
initializeDarkMode();

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  // </React.StrictMode>,
)