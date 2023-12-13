import React from "react";
import {useAuth} from '../../contexts/AuthContext'
import {useNavigate} from 'react-router-dom'

export default function NavBarUser() {
    const {currentUser, logout} = useAuth();
    const navigate = useNavigate();

    /**
     * Logout function
     * @returns to signin once the user logs out
     */
        async function handleLogout(){
            try{
                await logout()
                localStorage.setItem('isAuthenticated', 'false');
                navigate('/signin');
            }catch{
                setError("Failed to logout")
            }
        }
        

    return(
        <div className="fixed space-y-4 right-6 top-2 -sm:w-16 -sm:space-y-1">
            <div className="mt-2 mb-4 text-xs font-bold text-gray-100 right-2 -md:text-sm -xl:ml-20">
            {/* Conditionally render the user's account if they are currently signed in */}
            {!currentUser ? null:(
            <h6>Welcome, {currentUser.email}</h6>
            )}
            </div>
            {/* We also conditionally render a logout button for when the user is signed in */}
            {!currentUser ? null :(
               <button
                    onClick={handleLogout}
                    className="flex relative font-bold items-center p-4 pl-8 pr-8 space-y-4 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600 -md:ml-20">
                    Logout
                </button>
            )}
        </div>
        ) 
}
