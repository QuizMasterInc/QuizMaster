import React from "react";

const NavBarIcon = ({ icon, text }) => (
  <div className="group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 ease-in-out shadow-md hover:scale-110 cursor-pointer">
    {/* Icon */}
    <div className="flex items-center justify-center text-gray-200 w-full h-full">
      {icon}
    </div>

    {/* Tooltip */}
    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-black text-white text-xs font-semibold px-3 py-1 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-[999]">
      {text}
    </div>
  </div>
);

export default NavBarIcon;
