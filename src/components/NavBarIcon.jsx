import React from "react";

const NavBarIcon = ({icon, text}) => (
    <button className="navbar-icon group">
        {icon}
        <span className="navbar-tooltip group-hover:scale-100">
            {text}
        </span>
    </button>
)

export default NavBarIcon;