import React from "react";
import House from "./icons/House";
import Info from "./icons/Info";
import SignIn from "./icons/SignIn";
import Register from "./icons/Register";
import School from "./icons/School";
import Q from "./icons/Q";
import Bars from "./icons/Bars";
import SignOut from "./icons/SignOut";

export default function NavBar() {
    return(
        <div className="fixed flex flex-col w-20 space-y-12 bg-gray-900 rounded-md left-2 top-2 bottom-2">
            <div className="flex flex-col items-center p-2 mt-4 rounded-md">
                <Q />
            </div>
            <button className="flex flex-col items-center m-1 bg-transparent hover:bg-gray-300">
                <Bars />
            </button>
            <button className="flex flex-col items-center p-2 m-1 bg-transparent rounded-md hover:bg-gray-300">
                <House />
            </button>
            <button className="flex flex-col items-center p-2 m-1 bg-transparent rounded-md hover:bg-gray-300">
                <Info />
            </button>
            <button className="flex flex-col items-center p-2 m-1 bg-transparent rounded-md hover:bg-gray-300">
                <Register />
            </button>
            <button className="flex flex-col items-center p-2 m-1 bg-transparent rounded-md hover:bg-gray-300">
                <School />
            </button>
            <button className="flex flex-col items-center p-2 m-1 space-x-2 bg-transparent rounded-md hover:bg-gray-300">
                <SignIn />
            </button>
            <button className="flex flex-col items-center p-2 pb-4 m-1 space-x-2 bg-transparent rounded-md hover:bg-gray-300">
                <SignOut />
            </button>
        </div>
    )
}