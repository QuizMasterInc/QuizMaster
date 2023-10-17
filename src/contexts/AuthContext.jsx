/**
 * This context holds all the Firebase authenticate functions for both email/password and Google.
 * imports Firebase and auth from firebase.js
 */
import React, {useContext, useState, useEffect} from 'react'
import {GoogleAuthProvider, signInWithPopup, EmailAuthProvider} from 'firebase/auth'
import {auth} from '../../firebase'

//creates context
const AuthContext = React.createContext()

/**
 * This creates the useContext
 * @returns the useContext to be used in other components
 */
export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState()
    const [isGoogleAuth, setIsGoogleAuth] = useState(false)
    const [loading, setLoading] = useState(true)

    function signup(email, password){
        return auth.createUserWithEmailAndPassword(email, password)
        .then((user) => {
            // store new user in firestore
            
        })
    }

    function login(email, password){
        return auth.signInWithEmailAndPassword(email, password)
    }

    function logout(){
        return auth.signOut()
    }

    function resetPassword(email){
        return auth.sendPasswordResetEmail(email)
    }

    function googleLogin(){
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider)
        .then((user) => {

        })
    }

    function updateEmail(email){
        return currentUser.updateEmail(email)
    }

    function updatePassword(password){
       return currentUser.updatePassword(password)
    }
    //Re Authenticate used in UpdateProfile to check if the user entered their current password correctly
    function reAuthUser(password){
        const credentials = EmailAuthProvider.credential(
            currentUser.email,
            password
        )
        
        return currentUser.reauthenticateWithCredential(credentials)
    }
    //Will change the user based on the authentication change
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user)
            setLoading(false)
            //Will set googleAuth to true if the user is using a Google account.
            if(user){
                setIsGoogleAuth(user.providerData[0].providerId === 'google.com')
            }
        })

        return unsubscribe
    }, [])
    
//packages data
    const value = {
        currentUser,
        isGoogleAuth,
        login,
        signup,
        logout,
        resetPassword,
        googleLogin,
        updateEmail,
        updatePassword,
        reAuthUser
    }
//context provider
    return (
    <AuthContext.Provider value={value}>
        {!loading && children}
    </AuthContext.Provider>
    )
}
