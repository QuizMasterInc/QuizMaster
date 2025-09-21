// This will be the light and darkmode switch for QuizMaster. Done by Kolade
// Plan to change to system light/dark mode once given full control of project in Capstone.
import React, { useState, useEffect } from 'react';

const DarkLightMode = () => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });

    const toggleDarkMode = () => {
        setIsDarkMode(prevState => !prevState);
    };

    useEffect(() => {
        const savedMode = localStorage.getItem("darkMode");
        if (savedMode === "true") {
            setIsDarkMode(true);
            document.documentElement.classList.add("dark");
        }
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    }, [isDarkMode]);

    return (
        <div className="mb-4 flex justify-center items-center">
            <label className="flex items-center cursor-pointer">
                <span className="mr-4" style={{ color: 'var(--text-primary)' }}>Dark Mode</span>
                <div className="relative">
                    <input
                        type="checkbox"
                        checked={isDarkMode}
                        onChange={toggleDarkMode}
                        className="sr-only"
                    />
                    <div
                        className="w-12 h-6 rounded-full transition-colors duration-200"
                        style={{ 
                            backgroundColor: isDarkMode ? 'var(--primary-500)' : 'var(--neutral-300)' 
                        }}
                    ></div>
                    <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transform transition-transform duration-200 ${
                            isDarkMode ? 'translate-x-6' : ''
                        }`}
                        style={{ backgroundColor: 'white' }}
                    ></div>
                </div>
                <span 
                    className="ml-4 text-sm font-semibold"
                    style={{ 
                        color: isDarkMode ? 'var(--primary-400)' : 'var(--neutral-500)' 
                    }}
                >
                    {isDarkMode ? 'On' : 'Off'}
                </span>
            </label>
        </div>
    );
}

export default DarkLightMode;