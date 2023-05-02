import React from "react";
import House from "../icons/House";
import Info from "../icons/Info";
import SignIn from "../icons/SignIn";
import School from "../icons/School";
import Q from "../icons/Q";
import SignOut from "../icons/SignOut";
import Email from "../icons/Email"
import NavBarIcon from "./NavBarIcon";
import { NavLink } from "react-router-dom";
import {useAuth} from '../../contexts/AuthContext'

export default function NavBar() {
    const { currentUser } = useAuth();
    
    return(
        // Create a fixed-positioned, vertical flexbox to contain the nav bar  items
        <div className="fixed z-10 flex flex-col w-20 pb-4 space-y-4 bg-gray-900 rounded-md shadow-lg left-2 top-2 -sm:w-16 -sm:space-y-1">
            <div className="flex flex-col items-center p-2 mt-4 rounded-md">
                <Q />
            </div>
            <NavLink to="/" className={"flex flex-col items-center"}>
                <NavBarIcon icon={<House className={"navbar-icon"} />} text={"Home"} />
            </NavLink>
            <NavLink to="/quizzes" className={"flex flex-col items-center"}>
                <NavBarIcon icon={<School className={"navbar-icon"} />} text={"Take a Quiz!"} /> 
            </NavLink>
            {/* Conditionally render the sign in button if the user is not currently signed in */}
            {currentUser ? null :(
            <NavLink to="/signin" className={`flex flex-col items-center`}>
                <NavBarIcon icon={<SignIn className={"navbar-icon"} />} text={"Sign In"} /> 
            </NavLink>
            )}
            {/* Conditionally render the dashboard button if the user is currently signed in */}
            {!currentUser ? null:(
            <NavLink to="/dashboard" className={`flex flex-col items-center`}>
                <NavBarIcon icon={<SignIn className={"navbar-icon"} />} text={"Dashboard"} />
            </NavLink>
            )}
            <NavLink to="/about" className={"flex flex-col items-center"}>
                <NavBarIcon icon={<Info className={"navbar-icon"} />} text={"Information"} />
            </NavLink>
            <NavLink to="/contact" className={"flex flex-col items-center"}>
                <NavBarIcon icon={<Email className={"navbar-icon"} />} text={"Contact Us"} />
            </NavLink>
        </div>
    )
}