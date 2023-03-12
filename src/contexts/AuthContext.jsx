import React, {useContext, useState, useEffect} from 'react'
import {GoogleAuthProvider, signInWithPopup} from 'firebase/auth'
import {auth} from '../../firebase'

const AuthContext = React.createContext()

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState()
    const [loading, setLoading] = useState(true)

    function signup(email, password){
        return auth.createUserWithEmailAndPassword(email, password)
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
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user)
            setLoading(false)
        })

        return unsubscribe
    }, [])
    

    const value = {
        currentUser,
        login,
        signup,
        logout,
        resetPassword,
        googleLogin
    }

  return (
    <AuthContext.Provider value={value}>
        {!loading && children}
    </AuthContext.Provider>
  )
}
