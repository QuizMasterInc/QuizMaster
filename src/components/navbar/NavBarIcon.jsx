import React from "react";

const NavBarIcon = ({icon, text}) => (
    <div className="navbar-icon-button group">
        {icon}
        <span className="navbar-tooltip group-hover:scale-100">
            {text}
        </span>
    </div>
)

export default NavBarIcon;