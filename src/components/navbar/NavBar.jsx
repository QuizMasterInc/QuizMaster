import React from "react";
import House from "../icons/House";
import Info from "../icons/Info";
import SignIn from "../icons/SignIn";
import School from "../icons/School";
import Writing from "../icons/Writing"
import Q from "../icons/Q";
import SignOut from "../icons/SignOut";
import Email from "../icons/Email"
import Developer from "../icons/Developer";
import Gear from "../icons/Gear";
import NavBarIcon from "./NavBarIcon";
import { NavLink, useLocation } from "react-router-dom";
import {useAuth} from '../../contexts/AuthContext'


export default function NavBar(completed) {
    const { currentUser } = useAuth();
    const location = useLocation();

    //Function to check if you are on the quiz tab and displays a warning message if you try to leave the quiz page.
    const handleClick = (e) => {
        if (location.pathname !== quizstarted) {
            // Display a confirmation dialog
            const confirmation = window.confirm('Are you sure you want to leave? You are on a page where navigation may lead to loss of unsaved data.');
            
            // If the user confirms, allow navigation
            if (!confirmation) {
                e.preventDefault();
            }
        }
    };
    
    return(
        // Create a fixed-positioned, vertical flexbox to contain the nav bar  items
        <div className="fixed z-10 flex flex-col w-20  pb-4 space-y-0 bg-gray-900 rounded-md shadow-lg left-2 top-2  -sm:w-16 -sm:space-y-0 ">
            <div className="flex flex-col items-center p-2 mt-4 rounded-md ">
                <Q />
            </div>
            {currentUser && currentUser.role === "developer" && (
            <div className="hover:scale-125 duration-300">
                <NavLink to="/developer" className={"flex flex-col items-center"} onClick={handleClick}>
                    <NavBarIcon icon={<Developer className={"navbar-icon"} />} text={"Developer"} />
                </NavLink>
            </div>
            )}
            <div className="hover:scale-125 duration-300">
                <NavLink to="/home" className={"flex flex-col items-center"} onClick={handleClick}>
                    <NavBarIcon icon={<House className={"navbar-icon"} />} text={"Home"} />
                </NavLink>
            </div>
            <div className="hover:scale-125 duration-300">
                <NavLink to="/typeofquiz" className={"flex flex-col items-center"} onClick={handleClick}>
                    <NavBarIcon icon={<School className={"navbar-icon"} />} text={"Take a Quiz!"} /> 
                </NavLink>
            </div>
            <div className="hover:scale-125 duration-300">
                <NavLink to="/customquiz" className={"flex flex-col items-center"} onClick={handleClick}>
                    <NavBarIcon icon={<Writing className={"navbar-icon"} />} text={"Create a Quiz!"} /> 
                </NavLink>
            </div>
            
            <div className="hover:scale-125 duration-300">
                {/* Conditionally render the sign in button if the user is not currently signed in */}
                {currentUser ? null :(
                    <NavLink to="/signin" className={`flex flex-col items-center`} onClick={handleClick}>
                        <NavBarIcon icon={<SignIn className={"navbar-icon"} />} text={"Sign In"} /> 
                    </NavLink>
                )}
                {/* Conditionally render the dashboard button if the user is currently signed in */}
                {!currentUser ? null:(
                <NavLink to="/dashboard" className={`flex flex-col items-center`} onClick={handleClick}>
                    <NavBarIcon icon={<SignIn className={"navbar-icon"} />} text={"Dashboard"} />
                </NavLink>
                )}
            </div>
            
            <div className="hover:scale-125 duration-300">
                <NavLink to="/about" className={"flex flex-col items-center"} onClick={handleClick}>
                    <NavBarIcon icon={<Info className={"navbar-icon"} />} text={"Information"} />
                </NavLink>
            </div>
            
            <div className="hover:scale-125 duration-300">
                <NavLink to="/contact" className={"flex flex-col items-center"} onClick={handleClick}>
                    <NavBarIcon icon={<Email className={"navbar-icon"} />} text={"Contact Us"} />
                </NavLink>
            </div>

            {/* make route and page for settings  */}
            <div className="hover:scale-125 duration-300">
                <NavLink to="/settings" className={"flex flex-col items-center"}>
                    <NavBarIcon icon={<Gear className={"navbar-icon"} />} text={"Settings"} />
                </NavLink>
            </div>
            
        </div>
    ) 
}