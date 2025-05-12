import React, { useState, useEffect, useRef } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { useLocation, NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/* ---------- your existing icon imports ---------- */
import House from "../icons/House";
import Info from "../icons/Info";
import Developer from "../icons/Developer";
import Board from "../icons/Board";
import SignIn from "../icons/SignIn";
import School from "../icons/School";
import Writing from "../icons/Writing";
import Gear from "../icons/Gear";
import Email from "../icons/Email";
import NavBarIcon from "./NavBarIcon";

export default function NavBar() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navRef = useRef(null);

  /* ---------------- state ---------------- */
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  /* -------- prevent accidental leave on quiz page -------- */
  const handleClick = (e) => {
    if (location.pathname === "/quizstarted") {
      const confirmLeave = window.confirm(
        "Are you sure you want to leave? You may lose unsaved data."
      );
      if (!confirmLeave) {
        e.preventDefault();
      }
    }
    /* always scroll top when navigating */
    window.scrollTo(0, 0);
  };

  /* -------- remember sidebar scroll position -------- */
  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) setScrollY(navRef.current.scrollTop);
    };
    if (navRef.current) navRef.current.addEventListener("scroll", handleScroll);
    return () =>
      navRef.current &&
      navRef.current.removeEventListener("scroll", handleScroll);
  }, []);

  /* restore scroll on mount */
  useEffect(() => {
    const stored = sessionStorage.getItem("navScrollY");
    if (stored && navRef.current) navRef.current.scrollTop = stored;
  }, []);

  /* store whenever it changes */
  useEffect(() => {
    sessionStorage.setItem("navScrollY", scrollY);
  }, [scrollY]);

  /* toggle button */
  const toggleNav = () => setIsNavOpen((prev) => !prev);

  /* ===================================================== */
  /* ======================= RENDER ======================= */
  /* ===================================================== */
  return (
    /* Sticky wrapper keeps nav at top during scroll */
    <nav className="sticky top-0 z-50">
      {/* toggle button always visible */}
      <button
        className="fixed top-4 left-4 z-[60] p-2 bg-gray-800 text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
        onClick={toggleNav}
      >
        {isNavOpen ? <FaTimes size={24} /> : <FaBars size={32} />}
      </button>

      {/* sidebar / vertical menu */}
      {isNavOpen && (
        <div
          ref={navRef}
          className="fixed w-24 h-[75vh] bg-gray-900 rounded-md shadow-lg left-2 top-16 
                     space-y-10 overflow-y-auto no-scrollbar text-white py-4"
        >
          {/* ========= menu items ========= */}
          <div className="flex flex-col items-center space-y-6">
            {/* dev‑only link */}
            {currentUser && currentUser.role === "developer" && (
              <NavLink
                to="/developer"
                className="flex flex-col items-center hover:scale-110 duration-300"
                onClick={handleClick}
              >
                <NavBarIcon icon={<Developer />} text="Developer" />
              </NavLink>
            )}

            <NavLink
              to="/home"
              className="flex flex-col items-center hover:scale-110 duration-300"
              onClick={handleClick}
            >
              <NavBarIcon icon={<House />} text="Home" />
            </NavLink>

            <NavLink
              to="/typeoquiz"
              className="flex flex-col items-center hover:scale-110 duration-300"
              onClick={handleClick}
            >
              <NavBarIcon icon={<School />} text="Take a Quiz" />
            </NavLink>

            <NavLink
              to="/customquiz"
              className="flex flex-col items-center hover:scale-110 duration-300"
              onClick={handleClick}
            >
              <NavBarIcon icon={<Writing />} text="Create a Quiz" />
            </NavLink>

            <NavLink
              to="/flashcards"
              className="flex flex-col items-center hover:scale-110 duration-300"
              onClick={handleClick}
            >
              <NavBarIcon icon={<Board />} text="Make Flashcards" />
            </NavLink>

            {/* sign in / dashboard toggle */}
            {currentUser ? (
              <NavLink
                to="/dashboard"
                className="flex flex-col items-center hover:scale-110 duration-300"
                onClick={handleClick}
              >
                <NavBarIcon icon={<SignIn />} text="Dashboard" />
              </NavLink>
            ) : (
              <NavLink
                to="/signin"
                className="flex flex-col items-center hover:scale-110 duration-300"
                onClick={handleClick}
              >
                <NavBarIcon icon={<SignIn />} text="Sign In" />
              </NavLink>
            )}

            <NavLink
              to="/about"
              className="flex flex-col items-center hover:scale-110 duration-300"
              onClick={handleClick}
            >
              <NavBarIcon icon={<Info className="w-10 h-10" />} text="Information" />
            </NavLink>

            <NavLink
              to="/contact"
              className="flex flex-col items-center hover:scale-110 duration-300"
              onClick={handleClick}
            >
              <NavBarIcon icon={<Email />} text="Contact Us" />
            </NavLink>

            <NavLink
              to="/settings"
              className="flex flex-col items-center hover:scale-110 duration-300"
              onClick={handleClick}
            >
              <NavBarIcon icon={<Gear />} text="Settings" />
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
}
