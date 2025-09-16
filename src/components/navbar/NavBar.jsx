import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { House, School, Computer, Profile, Info, SignIn, Email, Gear, Q } from "../icons/index.jsx";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function NavBar() {
    const { currentUser, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [homeOpen, setHomeOpen] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    const [dashboardOpen, setDashboardOpen] = useState(false);
    const homeRef = useRef(null);
    const infoRef = useRef(null);
    const dashboardRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (homeOpen && homeRef.current && !homeRef.current.contains(event.target)) {
                setHomeOpen(false);
            }
            if (infoOpen && infoRef.current && !infoRef.current.contains(event.target)) {
                setInfoOpen(false);
            }
            if (dashboardOpen && dashboardRef.current && !dashboardRef.current.contains(event.target)) {
                setDashboardOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [homeOpen, infoOpen, dashboardOpen]);

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
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/signin');
            setDashboardOpen(false);
        } catch (error) {
            console.error("Failed to logout:", error);
        }
    };

    return (
        <nav className="w-full shadow-lg flex items-center px-6 py-4 relative navbar-bg">
            {/* Logo */}
            <NavLink to="/" className="w-10 h-10 flex items-center mr-4">
                <Q className="w-8 h-8 drop-shadow-lg navbar-logo" />
            </NavLink>

            {/* Home Dropdown */}
            <div className="relative group" ref={homeRef}>
                <div className="flex">
                    <NavLink
                        to="/"
                        onClick={handleClick}
                        className="flex items-center gap-2 font-semibold px-4 py-2 rounded-l navbar-link"
                    >
                        <House className="w-5 h-5 navbar-icon" />
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
                                to="/typeofquiz"
                                onClick={e => {
                                    handleClick(e);
                                    setHomeOpen(false);
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
                                    setHomeOpen(false);
                                }}
                                className="flex items-center gap-2 px-4 py-2 navbar-dropdown-item"
                            >
                                <Computer className="w-5 h-5 navbar-icon" />
                                Make Flashcards
                            </NavLink>
                        </li>
                    </ul>
                )}
            </div>

            {/* Information Dropdown */}
            <div className="relative group ml-4" ref={infoRef}>
                <div className="flex">
                    <NavLink
                        to="/about"
                        onClick={handleClick}
                        className="flex items-center gap-2 font-semibold px-4 py-2 rounded-l navbar-link"
                    >
                        <Info className="w-5 h-5 navbar-icon" />
                        About
                    </NavLink>
                    <button
                        onClick={() => setInfoOpen((open) => !open)}
                        type="button"
                        className="px-2 py-2 rounded-r navbar-button"
                        aria-label="Toggle Information Dropdown"
                    >
                        <FaChevronDown className="navbar-arrow" />
                    </button>
                </div>
                {infoOpen && (
                    <ul className="absolute left-0 mt-2 w-48 rounded shadow-lg z-50 navbar-dropdown">
                        <li>
                            <NavLink
                                to="/contact"
                                onClick={e => {
                                    handleClick(e);
                                    setInfoOpen(false);
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
                                    setInfoOpen(false);
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

            {/* Spacer */}
            <div className="flex-1" />

            {/* Centered Brand Name */}
            <h1 className="absolute left-1/2 transform -translate-x-1/2 sm:text-2xl font-extrabold">
                <span className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">QuizMaster</span>
            </h1>

            {/* Sign In / Dashboard */}
            <div className="pr-4">
                {currentUser ? (
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
                            <ul className="absolute right-0 mt-2 w-48 rounded shadow-lg z-50 navbar-dropdown">
                                <li>
                                    <NavLink
                                        to="/dashboard"
                                        onClick={e => {
                                            handleClick(e);
                                            setDashboardOpen(false);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 navbar-dropdown-item"
                                    >
                                        <Profile className="w-5 h-5 navbar-icon" />
                                        Dashboard
                                    </NavLink>
                                </li>
                                <li>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left flex items-center gap-2 px-4 py-2 navbar-dropdown-item"
                                    >
                                        <SignIn className="w-5 h-5 navbar-icon" />
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        )}
                    </div>
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
        </nav>
    );
}