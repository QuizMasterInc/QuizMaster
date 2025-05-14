import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import House from "../icons/House";
import Info from "../icons/Info";
import SignIn from "../icons/SignIn";
import School from "../icons/School";
import Writing from "../icons/Writing";
import Developer from "../icons/Developer";
import Email from "../icons/Email";
import Gear from "../icons/Gear";
import NavBarIcon from "./NavBarIcon";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function NavBar() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(true);

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

  const toggleNav = () => {
    setIsNavOpen((prev) => !prev);
  };

  return (
    <>
      <button
        className="fixed top-16 left-4 z-50 p-2 bg-gray-800 text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
        onClick={toggleNav}
      >
        {isNavOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {isNavOpen && (
        <nav
          className="fixed w-16 h-[80vh] bg-gray-900 rounded-xl shadow-lg left-2 top-32 space-y-6 overflow-visible no-scrollbar flex flex-col items-center py-4"

        >
          {/* Optional top toggle icon */}
          <div className="group hover:scale-125 p-2" onClick={toggleNav}>
            <FaBars size={26} className="text-white group-hover:hidden" />
            <FaTimes size={24} className="text-white hidden group-hover:block" />
          </div>

          {currentUser?.role === "developer" && (
            <NavLink to="/developer" onClick={handleClick}>
              <NavBarIcon icon={<Developer className="w-6 h-6 fill-white" />} text="Developer" />
            </NavLink>
          )}

          <NavLink to="/home" onClick={handleClick}>
            <NavBarIcon icon={<House className="w-6 h-6 fill-white" />} text="Home" />
          </NavLink>

          <NavLink to="/typeofquiz" onClick={handleClick}>
            <NavBarIcon icon={<School className="w-6 h-6 fill-white" />} text="Take a Quiz!" />
          </NavLink>

          <NavLink to="/customquiz" onClick={handleClick}>
            <NavBarIcon icon={<Writing className="w-6 h-6 fill-white" />} text="Create a Quiz!" />
          </NavLink>

          <NavLink to="/flashcards" onClick={handleClick}>
            <NavBarIcon text="Make Flashcards" />
          </NavLink>


          {currentUser ? (
            <NavLink to="/dashboard" onClick={handleClick}>
              <NavBarIcon icon={<SignIn className="w-6 h-6 fill-white" />} text="Dashboard" />
            </NavLink>
          ) : (
            <NavLink to="/signin" onClick={handleClick}>
              <NavBarIcon icon={<SignIn className="w-6 h-6 fill-white" />} text="Sign In" />
            </NavLink>
          )}

          <NavLink to="/about" onClick={handleClick}>
            <NavBarIcon icon={<Info className="w-6 h-6 fill-white" />} text="Information" />
          </NavLink>

          <NavLink to="/contact" onClick={handleClick}>
            <NavBarIcon icon={<Email className="w-6 h-6 fill-white" />} text="Contact Us" />
          </NavLink>

          <NavLink to="/settings" onClick={handleClick}>
            <NavBarIcon icon={<Gear className="w-6 h-6 fill-white" />} text="Settings" />
          </NavLink>
        </nav>
      )}
    </>
  );
}
