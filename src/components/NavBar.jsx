import React from "react";
import House from "./icons/House";
import Info from "./icons/Info";
import SignIn from "./icons/SignIn";
import Register from "./icons/Register";
import School from "./icons/School";
import PenRuler from "./icons/PenRuler";

export default function NavBar() {
    return(
        <div className="fixed top-0 left-0 flex flex-row w-screen h-16 space-x-48 border-4 border-gray-200">
            <div className="flex flex-col items-center">
                <PenRuler />
                <p>QuizMaster</p>
            </div>
            <div className="flex flex-row items-center">
                <House />
                <p>Home</p>
            </div>
            <div className="flex flex-row items-center">
                <Info />
                <p>Information</p>
            </div>
            <div className="flex flex-row items-center">
                <SignIn />
                <p>Sign In</p>
            </div>
            <div className="flex flex-row items-center">
                <Register />
                <p>Register</p>
            </div>
            <div className="flex flex-row items-center">
                <School />
                <p>Take a Quiz!</p>
            </div>
        </div>
    )
}