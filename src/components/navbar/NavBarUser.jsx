import React from "react";
import {useAuth} from '../../contexts/AuthContext'

export default function NavBarUser() {
    const { currentUser } = useAuth();

    return(
        <div className="fixed space-y-4 right-6 top-2 -sm:w-16 -sm:space-y-1">
            <div className="mt-2 mb-4 text-xs font-bold text-gray-100 right-2 -md:text-sm -xl:ml-20">
            {/* Conditionally render the user's account if they are currently signed in */}
            {!currentUser ? null:(
            <h6>Welcome, {currentUser.email}</h6>
            )}
            </div>
            </div>
        ) 
}
