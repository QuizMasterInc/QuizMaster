import React from "react";


const NavBarIcon = ({ icon, text }) => (
    <div className="flex flex-col items-center  p-3 rounded-3xl hover:bg-gray-600 bg-gray-800 group ">
      {/* Set a fixed size for the icons */}
      <div className="w-10 h-10 fill-gray-300">
        {icon}
      </div>
      <span className="absolute bottom-16 w-auto p-3 min-w-max left-1/2 transform -translate-x-1/2 rounded-md shadow-md text-white bg-gray-900 text-xs font-bold transition-all duration-100 scale-0 origin-left group-hover:scale-100 pointer-events-none">
        {text}
      </span>
    </div>
  );

export default NavBarIcon;
