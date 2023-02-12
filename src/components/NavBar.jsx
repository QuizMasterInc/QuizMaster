import React from "react";
import House from "./icons/House";
import Info from "./icons/Info";
import SignIn from "./icons/SignIn";
import School from "./icons/School";
import Q from "./icons/Q";
import SignOut from "./icons/SignOut";
import NavBarIcon from "./NavBarIcon";
import { NavLink } from "react-router-dom";

export default function NavBar() {
    return(
        <div className="fixed z-10 flex flex-col w-20 pb-4 space-y-4 bg-gray-900 rounded-md shadow-lg left-2 top-2">
            <div className="flex flex-col items-center p-2 mt-4 rounded-md">
                <Q />
            </div>
            <NavLink to="/" className={"flex flex-col items-center"}>
                <NavBarIcon icon={<House className={"navbar-icon"} />} text={"Home"} />
            </NavLink>
            <NavLink to="/about" className={"flex flex-col items-center"}>
                <NavBarIcon icon={<Info className={"navbar-icon"} />} text={"Information"} />
            </NavLink>
            <NavLink to="/quizzes" className={"flex flex-col items-center"}>
                <NavBarIcon icon={<School className={"navbar-icon"} />} text={"Take a Quiz!"} /> 
            </NavLink>
            <NavLink to="/signin" className={"flex flex-col items-center"}>
                <NavBarIcon icon={<SignIn className={"navbar-icon"} />} text={"Sign In"} /> 
            </NavLink>
            <NavLink to="/signout" className={"flex flex-col items-center"}>
                <NavBarIcon icon={<SignOut className={"navbar-icon"} />} text={"Sign Out"} />
            </NavLink>
        </div>
    )
}