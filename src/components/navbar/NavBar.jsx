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

    useEffect(() => {
        function handleClickOutside(event) {
            if (dashboardOpen && dashboardRef.current && !dashboardRef.current.contains(event.target)) {
                setDashboardOpen(false);
            }
            if (homeOpen && homeRef.current && !homeRef.current.contains(event.target)) {
                setHomeOpen(false);
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
            >
                {mobileMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
            </button>

            <NavLink to="/" className="w-10 h-10 flex items-center mr-4">
                <Q className="w-8 h-8 drop-shadow-lg navbar-logo" />
            </NavLink>

            <div className="nav-links">
                {currentUser && (
                    <div className="relative group" ref={dashboardRef}>
                        <div className="flex">
                            <NavLink
                                to="/dashboard"
                                onClick={handleClick}
                                className="flex items-center gap-2 font-semibold px-4 py-2 rounded-l navbar-link"
                            >
                                <Profile className="w-5 h-5 navbar-icon" />
                                Dashboard
                            </NavLink>
                            <button
                                onClick={() => setDashboardOpen((open) => !open)}
                                type="button"
                                className="px-2 py-2 rounded-r navbar-button"
                                aria-label="Toggle Dashboard Dropdown"
                            >
                                <FaChevronDown className="navbar-arrow" />
                            </button>
                        </div>
                        {dashboardOpen && (
                            <ul className="absolute left-0 mt-2 w-48 rounded shadow-lg z-50 navbar-dropdown">
                                <li>
                                    <NavLink
                                        to="/typeofquiz"
                                        onClick={e => {
                                            handleClick(e);
                                            setDashboardOpen(false);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 navbar-dropdown-item"
                                    >
                                        <School className="w-5 h-5 navbar-icon" />
                                        Take a Quiz!
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/flashcards"
                                        onClick={e => {
                                            handleClick(e);
                                            setDashboardOpen(false);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 navbar-dropdown-item"
                                    >
                                        <Computer className="w-5 h-5 navbar-icon" />
                                        Make Flashcards
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/myflashcards"
                                        onClick={e => {
                                            handleClick(e);
                                            setDashboardOpen(false);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 navbar-dropdown-item"
                                    >
                                        <Scroll className="w-5 h-5 navbar-icon" />
                                        My Flashcards
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/myquizzes"
                                        onClick={e => {
                                            handleClick(e);
                                            setDashboardOpen(false);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 navbar-dropdown-item"
                                    >
                                        <Q className="w-5 h-5 navbar-icon" />
                                        My Quizzes
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/browse-flashcards"
                                        onClick={e => {
                                            handleClick(e);
                                            setDashboardOpen(false);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 navbar-dropdown-item"
                                    >
                                        <Book className="w-5 h-5 navbar-icon" />
                                        Browse Flashcards
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/customquiz"
                                        onClick={e => {
                                            handleClick(e);
                                            setDashboardOpen(false);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 navbar-dropdown-item"
                                    >
                                        <Q className="w-5 h-5 navbar-icon" />
                                        Make Quiz
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/classroom"
                                        onClick={e => {
                                            handleClick(e);
                                            setDashboardOpen(false);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 navbar-dropdown-item"
                                    >
                                        <School className="w-5 h-5 navbar-icon" />
                                        Classroom
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/about"
                                        onClick={e => {
                                            handleClick(e);
                                            setDashboardOpen(false);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 navbar-dropdown-item"
                                    >
                                        <Info className="w-5 h-5 navbar-icon" />
                                        About
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/contact"
                                        onClick={e => {
                                            handleClick(e);
                                            setDashboardOpen(false);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 navbar-dropdown-item"
                                    >
                                        <Email className="w-5 h-5 navbar-icon" />
                                        Contact Us
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/profile"
                                        onClick={e => {
                                            handleClick(e);
                                            setDashboardOpen(false);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 navbar-dropdown-item"
                                    >
                                        <Profile className="w-5 h-5 navbar-icon" />
                                        Profile
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/settings"
                                        onClick={e => {
                                            handleClick(e);
                                            setDashboardOpen(false);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 navbar-dropdown-item"
                                    >
                                        <Gear className="w-5 h-5 navbar-icon" />
                                        Settings
                                    </NavLink>
                                </li>
                            </ul>
                        )}
                    </div>
                )}

                {!currentUser && (
                    <div className="relative group ml-4" ref={homeRef}>
                        <div className="flex">
                            <NavLink
                                to="/"
                                onClick={handleClick}
                                className="flex items-center gap-2 font-semibold px-4 py-2 rounded-l navbar-link"
                            >
                                <Profile className="w-5 h-5 navbar-icon" />
                                Home
                            </NavLink>
                            <button
                                onClick={() => setHomeOpen((open) => !open)}
                                type="button"
                                className="px-2 py-2 rounded-r navbar-button"
                                aria-label="Toggle Home Dropdown"
                            >
                                <FaChevronDown className="navbar-arrow" />
                            </button>
                        </div>
                        {homeOpen && (
                            <ul className="absolute left-0 mt-2 w-48 rounded shadow-lg z-50 navbar-dropdown">
                                <li>
                                    <NavLink
                                        to="/about"
                                        onClick={e => {
                                            handleClick(e);
                                            setHomeOpen(false);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 navbar-dropdown-item"
                                    >
                                        <Info className="w-5 h-5 navbar-icon" />
                                        About
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/contact"
                                        onClick={e => {
                                            handleClick(e);
                                            setHomeOpen(false);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 navbar-dropdown-item"
                                    >
                                        <Email className="w-5 h-5 navbar-icon" />
                                        Contact Us
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/settings"
                                        onClick={e => {
                                            handleClick(e);
                                            setHomeOpen(false);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 navbar-dropdown-item"
                                    >
                                        <Gear className="w-5 h-5 navbar-icon" />
                                        Settings
                                    </NavLink>
                                </li>
                            </ul>
                        )}
                    </div>
                )}


                <div className="flex-1" />

                <div className="pr-4">
                    {currentUser ? (
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 font-semibold px-4 py-2 rounded navbar-link"
                        >
                            <SignIn className="w-5 h-5 navbar-icon" />
                            Logout
                        </button>
                    ) : (
                        <NavLink
                            to="/signin"
                            onClick={handleClick}
                            className="flex items-center gap-2 font-semibold px-4 py-2 rounded navbar-link"
                        >
                            <SignIn className="w-5 h-5 navbar-icon" />
                            Sign In
                        </NavLink>
                    )}
                </div>
            </div>

            <h1 className="brand-title absolute left-1/2 transform -translate-x-1/2 sm:text-2xl font-extrabold">
                <span className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">QuizMaster</span>
            </h1>

            {mobileMenuOpen && (
                <div className="mobile-nav absolute top-full left-0 w-full navbar-bg shadow-lg z-50">
                    <div className="flex flex-col p-4">
                        {currentUser ? (
                            <>
                                <NavLink to="/dashboard" onClick={handleClick} className="mobile-nav-item">
                                    <Profile className="w-5 h-5" />
                                    Dashboard
                                </NavLink>
                                <NavLink to="/typeofquiz" onClick={handleClick} className="mobile-nav-item">
                                    <School className="w-5 h-5" />
                                    Take a Quiz!
                                </NavLink>
                                <NavLink to="/flashcards" onClick={handleClick} className="mobile-nav-item">
                                    <Computer className="w-5 h-5" />
                                    Make Flashcards
                                </NavLink>
                                <NavLink to="/myflashcards" onClick={handleClick} className="mobile-nav-item">
                                    <Scroll className="w-5 h-5" />
                                    My Flashcards
                                </NavLink>
                                <NavLink to="/myquizzes" onClick={handleClick} className="mobile-nav-item">
                                    <Q className="w-5 h-5" />
                                    My Quizzes
                                </NavLink>
                                <NavLink to="/browse-flashcards" onClick={handleClick} className="mobile-nav-item">
                                    <Book className="w-5 h-5" />
                                    Browse Flashcards
                                </NavLink>
                                <NavLink to="/customquiz" onClick={handleClick} className="mobile-nav-item">
                                    <Q className="w-5 h-5" />
                                    Make Quiz
                                </NavLink>
                                <NavLink to="/about" onClick={handleClick} className="mobile-nav-item">
                                    <Info className="w-5 h-5" />
                                    About
                                </NavLink>
                                <NavLink to="/contact" onClick={handleClick} className="mobile-nav-item">
                                    <Email className="w-5 h-5" />
                                    Contact Us
                                </NavLink>
                                <NavLink to="/Profile" onClick={handleClick} className="mobile-nav-item">
                                    <Profile className="w-5 h-5" />
                                    Profile
                                </NavLink>
                                <NavLink to="/settings" onClick={handleClick} className="mobile-nav-item">
                                    <Gear className="w-5 h-5" />
                                    Settings
                                </NavLink>
                                <button onClick={handleLogout} className="mobile-nav-item text-left">
                                    <SignIn className="w-5 h-5" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink to="/" onClick={handleClick} className="mobile-nav-item">
                                    <Profile className="w-5 h-5" />
                                    Home
                                </NavLink>
                                <NavLink to="/about" onClick={handleClick} className="mobile-nav-item">
                                    <Info className="w-5 h-5" />
                                    About
                                </NavLink>
                                <NavLink to="/contact" onClick={handleClick} className="mobile-nav-item">
                                    <Email className="w-5 h-5" />
                                    Contact Us
                                </NavLink>
                                <NavLink to="/settings" onClick={handleClick} className="mobile-nav-item">
                                    <Gear className="w-5 h-5" />
                                    Settings
                                </NavLink>
                                <NavLink to="/signin" onClick={handleClick} className="mobile-nav-item">
                                    <SignIn className="w-5 h-5" />
                                    Sign In
                                </NavLink>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
