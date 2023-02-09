import React from "react";
import House from "./icons/House";
import Info from "./icons/Info";

export default function NavBar() {
    return(
        <div className="fixed top-0 left-0 flex flex-row w-screen h-16 space-x-48 border-4 border-gray-200">
            <House />
            <Info />
            <p>Test</p>
            <p>test2</p>
            <p>test3</p>
        </div>
    )
}