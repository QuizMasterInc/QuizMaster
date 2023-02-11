import React from "react";
import House from "./icons/House";
import Info from "./icons/Info";
import SignIn from "./icons/SignIn";
import School from "./icons/School";
import Q from "./icons/Q";
import Bars from "./icons/Bars";
import SignOut from "./icons/SignOut";
import NavBarIcon from "./NavBarIcon";

export default function NavBar() {
    return(
        <div className="fixed flex flex-col w-20 space-y-12 bg-gray-900 rounded-md shadow-lg left-2 top-2 bottom-2">
            <div className="flex flex-col items-center p-2 mt-4 rounded-md">
                <Q />
            </div>
            <NavBarIcon icon={<Bars />} text={"Expand"}/>              
            <NavBarIcon icon={<House />} text={"Home"} /> 
            <NavBarIcon icon={<Info />} text={"Information"} /> 
            <NavBarIcon icon={<School />} text={"Take a Quiz!"} /> 
            <NavBarIcon icon={<SignIn />} text={"Sign In"} /> 
            <NavBarIcon icon={<SignOut />} text={"Sign Out"} />
        </div>
    )
}