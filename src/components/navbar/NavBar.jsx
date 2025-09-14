import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { House, School, Computer, Profile, Info, SignIn, Email, Gear, Q } from "../icons/index.jsx";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function NavBar() {
    const { currentUser } = useAuth();
    const location = useLocation();
    const [homeOpen, setHomeOpen] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    const homeRef = useRef(null);
    const infoRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (homeOpen && homeRef.current && !homeRef.current.contains(event.target)) {
                setHomeOpen(false);
            }
            if (infoOpen && infoRef.current && !infoRef.current.contains(event.target)) {
                setInfoOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [homeOpen, infoOpen]);

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

    return (
        <nav className="w-full bg-transparent shadow-lg flex items-center px-6 py-2">
            {/* Logo */}
            <NavLink to="/" className="w-10 h-10 flex items-center mr-4">
                <Q className="fill-white w-8 h-8 drop-shadow" />
            </NavLink>

            {/* Home Dropdown */}
            <div className="relative group" ref={homeRef}>
                <div className="flex">
                    <NavLink
                        to="/"
                        onClick={handleClick}
                        className="flex items-center gap-2 text-white font-semibold px-4 py-2 hover:bg-gray-800 rounded-l transition"
                        style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                    >
                        <House className="w-5 h-5 fill-white" />
                        Home
                    </NavLink>
                    <button
                        onClick={() => setHomeOpen((open) => !open)}
                        type="button"
                        className="px-2 py-2 bg-transparent text-white rounded-r"
                        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                        aria-label="Toggle Home Dropdown"
                    >
                        <FaChevronDown />
                    </button>
                </div>
                {homeOpen && (
                    <ul className="absolute left-0 mt-2 w-48 bg-gray-800 rounded shadow-lg z-50">
                        <li>
                            <NavLink
                                to="/typeofquiz"
                                onClick={e => {
                                    handleClick(e);
                                    setHomeOpen(false);
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-white hover:bg-indigo-700"
                            >
                                <School className="w-5 h-5 fill-white" />
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
                                className="flex items-center gap-2 px-4 py-2 text-white hover:bg-indigo-700"
                            >
                                <Computer className="w-5 h-5 fill-white" />
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
                        className="flex items-center gap-2 text-white font-semibold px-4 py-2 hover:bg-gray-800 rounded-l transition"
                        style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                    >
                        <Info className="w-5 h-5 fill-white" />
                        About
                    </NavLink>
                    <button
                        onClick={() => setInfoOpen((open) => !open)}
                        type="button"
                        className="px-2 py-2 bg-transparent text-white rounded-r"
                        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                        aria-label="Toggle Information Dropdown"
                    >
                        <FaChevronDown />
                    </button>
                </div>
                {infoOpen && (
                    <ul className="absolute left-0 mt-2 w-48 bg-gray-800 rounded shadow-lg z-50">
                        <li>
                            <NavLink
                                to="/contact"
                                onClick={e => {
                                    handleClick(e);
                                    setInfoOpen(false);
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-white hover:bg-indigo-700"
                            >
                                <Email className="w-5 h-5 fill-white" />
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
                                className="flex items-center gap-2 px-4 py-2 text-white hover:bg-indigo-700"
                            >
                                <Gear className="w-5 h-5 fill-white" />
                                Settings
                            </NavLink>
                        </li>
                    </ul>
                )}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Sign In / Dashboard */}
            <div className="pr-4">
                {currentUser ? (
                    <NavLink
                        to="/dashboard"
                        onClick={handleClick}
                        className="flex items-center gap-2 text-white font-semibold px-4 py-2 hover:bg-gray-800 rounded transition"
                    >
                        <Profile className="w-5 h-5 fill-white" />
                        Dashboard
                    </NavLink>
                ) : (
                    <NavLink
                        to="/signin"
                        onClick={handleClick}
                        className="flex items-center gap-2 text-white font-semibold px-4 py-2 hover:bg-gray-800 rounded transition"
                    >
                        <SignIn className="w-5 h-5 fill-white" />
                        Sign In
                    </NavLink>
                )}
            </div>
        </nav>
    );
}
