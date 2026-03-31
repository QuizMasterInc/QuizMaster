import { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaBars, FaTimes } from "react-icons/fa";
import { School, Computer, Profile, Info, SignIn, Email, Gear, Q, Scroll, Book } from "../icons/index.jsx";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import '../../styles/nav.css';

export default function NavBar() {
    const { currentUser, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [dashboardOpen, setDashboardOpen] = useState(false);
    const [homeOpen, setHomeOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dashboardRef = useRef(null);
    const homeRef = useRef(null);
    const profileRef = useRef(null);
    const drawerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dashboardOpen && dashboardRef.current && !dashboardRef.current.contains(event.target)) {
                setDashboardOpen(false);
            }
            if (homeOpen && homeRef.current && !homeRef.current.contains(event.target)) {
                setHomeOpen(false);
            }
            if (profileOpen && profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
            if (mobileMenuOpen && drawerRef.current && !drawerRef.current.contains(event.target) && !event.target.closest('.hamburger-menu')) {
                setMobileMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dashboardOpen, homeOpen, mobileMenuOpen, profileOpen]);

    const handleClick = (e) => {
        window.scrollTo(0, 0);
        setMobileMenuOpen(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/signin');
            setDashboardOpen(false);
            setMobileMenuOpen(false);
        } catch (error) {
            console.error("Failed to logout:", error);
        }
    };

    return (
        <nav className="w-full shadow-lg flex items-center px-6 py-4 relative navbar-bg">
            <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="hamburger-menu mr-4"
                aria-label="Toggle Mobile Menu"
                aria-expanded={mobileMenuOpen}
            >
                {mobileMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
            </button>

            <NavLink to="/" className="w-10 h-10 flex items-center mr-4">
                <Q className="w-8 h-8 drop-shadow-lg navbar-logo" />
            </NavLink>


            <h1 className="brand-title absolute left-1/2 transform -translate-x-1/2 sm:text-2xl font-extrabold">
                <span className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">QuizMaster</span>
            </h1>

            <NavLink
                to="/poll"
                onClick={handleClick}
                className="hidden md:inline-flex ml-auto items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold shadow-md hover:shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
            >
                <Q className="w-4 h-4" />
                Take a Poll
            </NavLink>

            {currentUser && (
                <div className="relative inline-flex ml-auto md:ml-4 z-50" ref={profileRef}>
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        aria-haspopup="true"
                        aria-expanded={profileOpen}
                        aria-label="Open profile menu"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/0 text-gray-800 dark:text-white border border-transparent dark:border-white/10 font-semibold shadow-sm hover:shadow-md transition-transform duration-150 hover:bg-gray-100 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <Profile className="w-6 h-6 text-current" />
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg py-1 z-50">
                            <NavLink to="/Profile" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Profile
                            </NavLink>
                            <NavLink to="/settings" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Setting
                            </NavLink>
                            <button onClick={() => { setProfileOpen(false); handleLogout(); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            )}

            {mobileMenuOpen && (
                <>
                    <div className="drawer-overlay fixed inset-0 bg-black bg-opacity-40 z-40" onClick={() => setMobileMenuOpen(false)} />
                    <aside ref={drawerRef} className="side-drawer fixed top-0 left-0 bottom-0 w-64 max-w-full bg-white z-50 shadow-lg overflow-auto">
                        <div className="p-4">
                            {currentUser ? (
                                <>
                                    <NavLink to="/dashboard" onClick={(e) => { handleClick(e); setMobileMenuOpen(false); }} className="mobile-nav-item">
                                        <Profile className="w-5 h-5" />
                                        Dashboard
                                    </NavLink>
                                    {/* Commented out - Poll page button in main menu not needed currently. 
                                    <NavLink to="/poll" onClick={(e) => { handleClick(e); setMobileMenuOpen(false); }} className="mobile-nav-item">
                                        <Q className="w-5 h-5" />
                                        Take a Poll
                                    </NavLink> 
                                    */}
                                    <NavLink to="/allcustomquizzes" onClick={(e) => { handleClick(e); setMobileMenuOpen(false); }} className="mobile-nav-item">
                                        <School className="w-5 h-5" />
                                        Take a Quiz!
                                    </NavLink>
                                    <NavLink to="/myquizzes" onClick={(e) => { handleClick(e); setMobileMenuOpen(false); }} className="mobile-nav-item">
                                        <Q className="w-5 h-5" />
                                        My Quizzes
                                    </NavLink>
                                    <NavLink to="/customquiz" onClick={(e) => { handleClick(e); setMobileMenuOpen(false); }} className="mobile-nav-item">
                                        <Q className="w-5 h-5" />
                                        Make Quiz
                                    </NavLink>
                                    <NavLink to="/browse-flashcards" onClick={(e) => { handleClick(e); setMobileMenuOpen(false); }} className="mobile-nav-item">
                                        <Book className="w-5 h-5" />
                                        Browse Flashcards
                                    </NavLink>
                                    <NavLink to="/myflashcards" onClick={(e) => { handleClick(e); setMobileMenuOpen(false); }} className="mobile-nav-item">
                                        <Scroll className="w-5 h-5" />
                                        My Flashcards
                                    </NavLink>
                                    <NavLink to="/flashcards" onClick={(e) => { handleClick(e); setMobileMenuOpen(false); }} className="mobile-nav-item">
                                        <Computer className="w-5 h-5" />
                                        Make Flashcards
                                    </NavLink>
                                </>
                            ) : (
                                <>
                                    <NavLink to="/" onClick={(e) => { handleClick(e); setMobileMenuOpen(false); }} className="mobile-nav-item">
                                        <Profile className="w-5 h-5" />
                                        Home
                                    </NavLink>
                                    <NavLink to="/poll" onClick={(e) => { handleClick(e); setMobileMenuOpen(false); }} className="mobile-nav-item">
                                        <Q className="w-5 h-5" />
                                        Take a Poll
                                    </NavLink>
                                    <NavLink to="/signin" onClick={(e) => { handleClick(e); setMobileMenuOpen(false); }} className="mobile-nav-item">
                                        <SignIn className="w-5 h-5" />
                                        Sign In
                                    </NavLink>
                                </>
                            )}
                        </div>
                    </aside>
                </>
            )}
        </nav>
    );
}