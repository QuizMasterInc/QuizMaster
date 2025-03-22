import React, { useState, useEffect, useRef } from "react";
import { FaBars, FaTimes } from "react-icons/fa"; // Import React Icons for the toggle button
import House from "../icons/House";
import Info from "../icons/Info";
import SignIn from "../icons/SignIn";
import School from "../icons/School";
import Writing from "../icons/Writing";
import Developer from "../icons/Developer";
import Email from "../icons/Email";
import Gear from "../icons/Gear";
import Board from "../icons/Board";
import NavBarIcon from "./NavBarIcon";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function NavBar() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [isNavOpen, setIsNavOpen] = useState(true); // State to toggle nav visibility

  const handleClick = (e) => {
    if (location.pathname === "/quizstarted") {
      const confirmation = window.confirm(
        "Are you sure you want to leave? You are on a page where navigation may lead to loss of unsaved data."
      );
      if (!confirmation) {
        e.preventDefault();
      }
    }
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        setScrollY(navRef.current.scrollTop);
      }
    };

    if (navRef.current) {
      navRef.current.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (navRef.current) {
        navRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    const storedScrollPosition = sessionStorage.getItem("navScrollY");
    if (storedScrollPosition && navRef.current) {
      navRef.current.scrollTop = storedScrollPosition;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (navRef.current) {
        sessionStorage.setItem("navScrollY", navRef.current.scrollTop);
      }
    };
  }, []);

  const toggleNav = () => {
    setIsNavOpen((prev) => !prev);
  };

  return (
    <>
      {/* Toggle button at the top */}
      <button
        className="fixed top-16 left-4 z-50 p-2 bg-gray-800 text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
        onClick={toggleNav}
      >
        {isNavOpen ? <FaTimes size={24} /> : <FaBars size={32} />}
      </button>

      {isNavOpen && (
        <div
          ref={navRef}
          className="fixed w-24 h-[75vh] bg-gray-900 rounded-md shadow-lg hover:scale-100 left-2 top-32 space-y-10 overflow-y-auto no-scrollbar"
        >
        <div
          className="group flex flex-col items-center hover:scale-125 p-2 mt-4"
          onClick={toggleNav}
        >
          <FaBars size={32} className="text-white group-hover:hidden" />
          <FaTimes size={30} className="text-white hidden group-hover:block" />
        </div>
          {currentUser && currentUser.role === "developer" && (
            <div className="hover:scale-125 duration-300">
              <NavLink
                to="/developer"
                className={"flex flex-col items-center"}
                onClick={handleClick}
              >
                <NavBarIcon icon={<Developer />} text={"Developer"} />
              </NavLink>
            </div>
          )}
          <div className="hover:scale-125 duration-300">
            <NavLink
              to="/home"
              className={"flex flex-col items-center"}
              onClick={handleClick}
            >
              <NavBarIcon icon={<House />} text={"Home"} />
            </NavLink>
          </div>
          <div className="hover:scale-125 duration-300">
            <NavLink
              to="/typeofquiz"
              className={"flex flex-col items-center"}
              onClick={handleClick}
            >
              <NavBarIcon icon={<School />} text={"Take a Quiz!"} />
            </NavLink>
          </div>
          <div className="hover:scale-125 duration-300">
            <NavLink
              to="/customquiz"
              className={"flex flex-col items-center"}
              onClick={handleClick}
            >
              <NavBarIcon icon={<Writing />} text={"Create a Quiz!"} />
            </NavLink>
          </div>
          <div className="hover:scale-125 duration-300">
            <NavLink
              to="/flashcards"
              className={"flex flex-col items-center"}
              onClick={handleClick}
            >
              <NavBarIcon icon={<Board />} text={"Make Flashcards"} />
            </NavLink>
          </div>
          <div className="hover:scale-125 duration-300">
            {currentUser ? null : (
              <NavLink
                to="/signin"
                className={`flex flex-col items-center`}
                onClick={handleClick}
              >
                <NavBarIcon icon={<SignIn className={"navbar-icon"} />} text={"Sign In"} />
              </NavLink>
            )}
            {!currentUser ? null : (
              <NavLink
                to="/dashboard"
                className={`flex flex-col items-center`}
                onClick={handleClick}
              >
                <NavBarIcon icon={<SignIn />} text={"Dashboard"} />
              </NavLink>
            )}
          </div>
          <div className="hover:scale-125 duration-300">
            <NavLink
              to="/about"
              className={"flex flex-col items-center"}
              onClick={handleClick}
            >
              <NavBarIcon icon={<Info className={"w-10 h-10"} />} text={"Information"} />
            </NavLink>
          </div>
          <div className="hover:scale-125 duration-300">
            <NavLink
              to="/contact"
              className={"flex flex-col items-center"}
              onClick={handleClick}
            >
              <NavBarIcon icon={<Email />} text={"Contact Us"} />
            </NavLink>
          </div>
          <div className="hover:scale-125 duration-300">
            <NavLink
              to="/settings"
              className={"flex flex-col items-center"}
            >
              <NavBarIcon icon={<Gear />} text={"Settings"} />
            </NavLink>
          </div>
        </div>
      )}
    </>
  );
}