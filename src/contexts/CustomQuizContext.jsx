/**
This function holds the context for a single custom quiz when it is accessed or created. 
 */
import React, {useContext, useState, useEffect} from 'react'

//creates context
const CustomQuizContext = React.createContext()

/**
 * This creates the useContext
 * @returns the useContext to be used in other components
 */
export function useCustomQuizContext() {
    return useContext(CustomQuizContext)
}

export function CustomQuizProvider({ children }) {
    const [quiz, updateQuiz] = useState(null)
    
    
    //packages data
    const value = {
        quiz, 
        updateQuiz
    }
    
//context provider
    return (
    <CustomQuizContext.Provider value={value}>
        {children}
    </CustomQuizContext.Provider>
    )
}