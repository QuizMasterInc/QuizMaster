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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dashboardRef = useRef(null);
    const homeRef = useRef(null);
    const drawerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dashboardOpen && dashboardRef.current && !dashboardRef.current.contains(event.target)) {
                setDashboardOpen(false);
            }
            if (homeOpen && homeRef.current && !homeRef.current.contains(event.target)) {
                setHomeOpen(false);
            }
            if (mobileMenuOpen && drawerRef.current && !drawerRef.current.contains(event.target) && !event.target.closest('.hamburger-menu')) {
                setMobileMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dashboardOpen, homeOpen]);

    const handleClick = (e) => {
        if (location.pathname === "/quizstarted") {
            const confirmation = window.confirm(
                "Are you sure you want to leave? You are on a page where navigation may lead to loss of unsaved data."
            );
            if (!confirmation) {
                e.preventDefault();
                return;
            }
        }
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
                                    <NavLink to="/typeofquiz" onClick={(e) => { handleClick(e); setMobileMenuOpen(false); }} className="mobile-nav-item">
                                        <School className="w-5 h-5" />
                                        Take a Quiz!
                                    </NavLink>
                                    <NavLink to="/flashcards" onClick={(e) => { handleClick(e); setMobileMenuOpen(false); }} className="mobile-nav-item">
                                        <Computer className="w-5 h-5" />
                                        Make Flashcards
                                    </NavLink>
                                    <NavLink to="/myflashcards" onClick={(e) => { handleClick(e); setMobileMenuOpen(false); }} className="mobile-nav-item">
                                        <Scroll className="w-5 h-5" />
                                        My Flashcards
                                    </NavLink>
                                    <NavLink to="/myquizzes" onClick={(e) => { handleClick(e); setMobileMenuOpen(false); }} className="mobile-nav-item">
                                        <Q className="w-5 h-5" />
                                        My Quizzes
                                    </NavLink>
                                    <NavLink to="/browse-flashcards" onClick={(e) => { handleClick(e); setMobileMenuOpen(false); }} className="mobile-nav-item">
                                        <Book className="w-5 h-5" />
                                        Browse Flashcards
                                    </NavLink>
                                    <NavLink to="/customquiz" onClick={(e) => { handleClick(e); setMobileMenuOpen(false); }} className="mobile-nav-item">
                                        <Q className="w-5 h-5" />
                                        Make Quiz
                                    </NavLink>
                                    <NavLink to="/about" onClick={(e) => { handleClick(e); setMobileMenuOpen(false); }} className="mobile-nav-item">
                                        <Info className="w-5 h-5" />
                                        About
                                    </NavLink>
                                    <NavLink to="/contact" onClick={(e) => { handleClick(e); setMobileMenuOpen(false); }} className="mobile-nav-item">
                                        <Email className="w-5 h-5" />
                                        Contact Us
                                    </NavLink>
                                    <NavLink to="/Profile" onClick={(e) => { handleClick(e); setMobileMenuOpen(false); }} className="mobile-nav-item">
                                        <Profile className="w-5 h-5" />
                                        Profile
                                    </NavLink>
                                    <NavLink to="/settings" onClick={(e) => { handleClick(e); setMobileMenuOpen(false); }} className="mobile-nav-item">
                                        <Gear className="w-5 h-5" />
                                        Settings
                                    </NavLink>
                                    <button onClick={() => { handleLogout(); }} className="mobile-nav-item text-left">
                                        <SignIn className="w-5 h-5" />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <NavLink to="/" onClick={(e) => { handleClick(e); setMobileMenuOpen(false); }} className="mobile-nav-item">
                                        <Profile className="w-5 h-5" />
                                        Home
                                    </NavLink>
                                    <NavLink to="/about" onClick={(e) => { handleClick(e); setMobileMenuOpen(false); }} className="mobile-nav-item">
                                        <Info className="w-5 h-5" />
                                        About
                                    </NavLink>
                                    <NavLink to="/contact" onClick={(e) => { handleClick(e); setMobileMenuOpen(false); }} className="mobile-nav-item">
                                        <Email className="w-5 h-5" />
                                        Contact Us
                                    </NavLink>
                                    <NavLink to="/settings" onClick={(e) => { handleClick(e); setMobileMenuOpen(false); }} className="mobile-nav-item">
                                        <Gear className="w-5 h-5" />
                                        Settings
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
