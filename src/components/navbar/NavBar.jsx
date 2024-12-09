import React, { useState, useEffect, useRef } from "react";
import House from "../icons/House";
import Info from "../icons/Info";
import SignIn from "../icons/SignIn";
import School from "../icons/School";
import Writing from "../icons/Writing";
import Q from "../icons/Q";
import SignOut from "../icons/SignOut";
import Email from "../icons/Email";
import Developer from "../icons/Developer";
import Gear from "../icons/Gear";
import NavBarIcon from "./NavBarIcon";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';

export default function NavBar(completed) {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navRef = useRef(null); // Ref for the nav container
  const [scrollY, setScrollY] = useState(0); // State to store the scroll position

  // Function to check if you are on the quiz tab and displays a warning message if you try to leave the quiz page.
  const handleClick = (e) => {
    if (location.pathname == '/quizstarted') {
      // Display a confirmation dialog
      const confirmation = window.confirm('Are you sure you want to leave? You are on a page where navigation may lead to loss of unsaved data.');
      
      // If the user confirms, allow navigation
      if (!confirmation) {
        e.preventDefault();
      }
    }
    window.scrollTo(0, 0); 
  };

  // Store the scroll position before navigating away
  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        setScrollY(navRef.current.scrollTop); // Store the nav bar scroll position
      }
    };

    // Listen for scroll events to capture the scroll position of the nav bar
    if (navRef.current) {
      navRef.current.addEventListener("scroll", handleScroll);
    }

    // Cleanup the event listener when the component unmounts
    return () => {
      if (navRef.current) {
        navRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // Restore the scroll position only for the nav bar when the component is mounted
  useEffect(() => {
    const storedScrollPosition = sessionStorage.getItem("navScrollY");
    if (storedScrollPosition && navRef.current) {
      navRef.current.scrollTop = storedScrollPosition; // Set the scroll position to the saved value
    }
  }, []);

  // Store the scroll position in sessionStorage when the component unmounts
  useEffect(() => {
    return () => {
      if (navRef.current) {
        sessionStorage.setItem("navScrollY", navRef.current.scrollTop);
      }
    };
  }, []);

  return (
    <div
      ref={navRef} // Attach the ref to the nav container
      className="fixed w-24 h-[75vh] bg-gray-900 rounded-md shadow-lg left-2 top-10 space-y-10 overflow-y-auto no-scrollbar"
    >
      <div className="flex flex-col items-center p-2 mt-4 ">
        <Q />
      </div>
      {currentUser && currentUser.role === "developer" && (
        <div className="hover:scale-125 duration-300">
          <NavLink to="/developer" className={"flex flex-col items-center"} onClick={handleClick}>
            <NavBarIcon icon={<Developer />} text={"Developer"} />
          </NavLink>
        </div>
      )}
      <div className="hover:scale-125 duration-300">
        <NavLink to="/home" className={"flex flex-col items-center"} onClick={handleClick}>
          <NavBarIcon icon={<House />} text={"Home"} />
        </NavLink>
      </div>
      <div className="hover:scale-125 duration-300">
        <NavLink to="/typeofquiz" className={"flex flex-col items-center"} onClick={handleClick}>
          <NavBarIcon icon={<School />} text={"Take a Quiz!"} />
        </NavLink>
      </div>
      <div className="hover:scale-125 duration-300">
        <NavLink to="/customquiz" className={"flex flex-col items-center"} onClick={handleClick}>
          <NavBarIcon icon={<Writing />} text={"Create a Quiz!"} />
        </NavLink>
      </div>
      <div className="hover:scale-125 duration-300">
        {/* Conditionally render the sign in button if the user is not currently signed in */}
        {currentUser ? null : (
          <NavLink to="/signin" className={`flex flex-col items-center`} onClick={handleClick}>
            <NavBarIcon icon={<SignIn className={"navbar-icon"} />} text={"Sign In"} />
          </NavLink>
        )}
        {/* Conditionally render the dashboard button if the user is currently signed in */}
        {!currentUser ? null : (
          <NavLink to="/dashboard" className={`flex flex-col items-center`} onClick={handleClick}>
            <NavBarIcon icon={<SignIn />} text={"Dashboard"} />
          </NavLink>
        )}
      </div>
      {/* For some reason the 'Info' icon doesn't listen to the Tailwind settings from the NavBarIcon file,
          the component might be defining its own size, override them by adding className="w-10 h-10" 
          directly to the icon component */}
      <div className="hover:scale-125 duration-300">
        <NavLink to="/about" className={"flex flex-col items-center"} onClick={handleClick}>
          <NavBarIcon icon={<Info className={"w-10 h-10"} />} text={"Information"} />
        </NavLink>
      </div>
      <div className="hover:scale-125 duration-300">
        <NavLink to="/contact" className={"flex flex-col items-center"} onClick={handleClick}>
          <NavBarIcon icon={<Email />} text={"Contact Us"} />
        </NavLink>
      </div>

      {/* Settings link */}
      <div className="hover:scale-125 duration-300">
        <NavLink to="/settings" className={"flex flex-col items-center"}>
          <NavBarIcon icon={<Gear />} text={"Settings"} />
        </NavLink>
      </div>
    </div>
  );
}
