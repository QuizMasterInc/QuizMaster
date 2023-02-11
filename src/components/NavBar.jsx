import React from "react";
import House from "./icons/House";
import Info from "./icons/Info";
import SignIn from "./icons/SignIn";
import School from "./icons/School";
import Q from "./icons/Q";
import SignOut from "./icons/SignOut";
import NavBarIcon from "./NavBarIcon";

export default function NavBar() {
    return(
        <div className="fixed flex flex-col w-20 pb-4 space-y-12 bg-gray-900 rounded-md shadow-lg left-2 top-2 bottom-2">
            <div className="flex flex-col items-center p-2 mt-4 rounded-md">
                <Q />
            </div>
            <NavBarIcon icon={<House className={"navbar-icon"} />} text={"Home"} /> 
            <NavBarIcon icon={<Info className={"navbar-icon"} />} text={"Information"} /> 
            <NavBarIcon icon={<School className={"navbar-icon"} />} text={"Take a Quiz!"} /> 
            <NavBarIcon icon={<SignIn className={"navbar-icon"} />} text={"Sign In"} /> 
            <NavBarIcon icon={<SignOut className={"navbar-icon"} />} text={"Sign Out"} />
        </div>
    )
}