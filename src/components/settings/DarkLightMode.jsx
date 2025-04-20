// This will be the light and darkmode switch for QuizMaster. Done by Kolade
// Plan to change to system light/dark mode once given full control of project in Capstone.
import React, { useState, useEffect } from 'react';

const DarkLightMode = () => {
    const [darkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });
    const toggleDarkMode = () => {
        setIsDarkMode(prevState => !prevState);
    }

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
            localStorage.setItem('darkMode', 'true');
        }
        else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            localStorage.setItem('darkMode', 'false');
        }
    }, [darkMode]);

    return (
        <div className="mb-4 flex justify-center items-center">
            <label className="flex items-center cursor-pointer">
                <span className="mr-4 text-gray-700">Dark Mode</span>
                <div className="relative">
                    <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={toggleDarkMode}
                        className="sr-only"
                    />
                    <div
                        className={`w-12 h-6 rounded-full transition-colors duration-200 ${darkMode ? 'bg-blue-500' : 'bg-white'}`}
                    ></div>
                    <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transform transition-transform duration-200 ${darkMode ? 'translate-x-6' : ''}`}
                    ></div>
                </div>
                <span className={`ml-4 text-sm font-semibold ${darkMode ? 'text-blue-500' : 'text-gray-400'}`}>
          {darkMode ? 'On' : 'Off'}
        </span>
            </label>
        </div>
    );
}

export default DarkLightMode;