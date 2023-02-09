import React from "react";
import House from "./icons/House";
import Info from "./icons/Info";
import SignIn from "./icons/SignIn";
import Register from "./icons/Register";
import School from "./icons/School";
import PenRuler from "./icons/PenRuler";
import Q from "./icons/Q";

export default function NavBar() {
    return(
        <div className="fixed top-0 left-0 flex flex-row w-screen h-16 space-x-48 overflow-auto border-4 border-gray-200">
            <div className="flex flex-col items-center pl-2 space-y-2">
                <Q />
                <a className="text-black hover:text-red-400"><p>QuizMaster</p></a>
            </div>
            <div className="flex flex-col items-center space-y-2">
                <House />
                <a><p>Home</p></a>
            </div>
            <div className="flex flex-col items-center space-y-2">
                <Info />
                <a><p>Information</p></a>
            </div>
            <div className="flex flex-col items-center space-y-2">
                <Register />
                <a><p>Register</p></a>
            </div>
            <div className="flex flex-col items-center space-y-2">
                <School />
                <a><p>Take a Quiz!</p></a>
            </div>
            <button className="flex flex-row items-center m-2 space-x-2">
                <SignIn className="w-10 h-10"/>
                <p>Sign In</p>
            </button>
        </div>
    )
}