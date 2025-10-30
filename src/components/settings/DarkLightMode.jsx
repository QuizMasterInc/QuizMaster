import { MdDarkMode, MdLightMode, MdDevices } from 'react-icons/md';
import { useTheme } from '../../contexts/ThemeContext';

const DarkLightMode = () => {
    const { isDarkMode, isSystemDefault, toggleDarkMode, resetToSystem } = useTheme();

    return (
        <div className="w-full max-w-md mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl transition-all duration-200"
                 style={{ 
                     backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                     border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                 }}>
                
                {/* Left side - Label and icon */}
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg transition-colors duration-200"
                         style={{ 
                             backgroundColor: isDarkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)' 
                         }}>
                        {isDarkMode ? (
                            <MdDarkMode size={20} style={{ color: 'var(--primary-400)' }} />
                        ) : (
                            <MdLightMode size={20} style={{ color: 'var(--primary-500)' }} />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            Theme
                        </span>
                        <span className="text-xs" style={{ color: isDarkMode ? 'var(--primary-400)' : 'var(--primary-500)' }}>
                            {isSystemDefault ? 'System Default' : (isDarkMode ? 'Dark Mode' : 'Light Mode')}
                        </span>
                    </div>
                </div>

                {/* Right side - Toggle and reset */}
                <div className="flex items-center gap-3">
                    {/* Toggle switch */}
                    <label className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={isDarkMode}
                                onChange={toggleDarkMode}
                                className="sr-only"
                                aria-label="Toggle dark mode"
                            />
                            <div
                                className="w-14 h-7 rounded-full transition-all duration-300 shadow-inner"
                                style={{ 
                                    backgroundColor: isDarkMode ? 'var(--primary-500)' : 'var(--neutral-300)' 
                                }}
                            ></div>
                            <div
                                className={`absolute top-1 left-1 w-5 h-5 rounded-full transform transition-transform duration-300 shadow-md ${
                                    isDarkMode ? 'translate-x-7' : ''
                                }`}
                                style={{ backgroundColor: 'white' }}
                            ></div>
                        </div>
                    </label>

                    {/* Reset to system button */}
                    {!isSystemDefault && (
                        <button
                            onClick={resetToSystem}
                            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                            style={{ 
                                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                                color: 'var(--text-primary)'
                            }}
                            aria-label="Reset to system preference"
                            title="Reset to system preference"
                        >
                            <MdDevices size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Info text */}
            <p className="text-xs text-center mt-3 px-2" 
               style={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
                {isSystemDefault 
                    ? 'Using your device\'s theme. Toggle to set a custom preference.' 
                    : 'Custom theme active. Click the monitor icon to use system preference.'}
            </p>
        </div>
    );
}

export default DarkLightMode;