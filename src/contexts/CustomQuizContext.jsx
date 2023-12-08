/**
This function holds the context for a single custom quiz when it is accessed or created. 
 */
import React, {useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

    const navigate = useNavigate()

    const getQuiz = async(uid) => {
        console.log("GetQuiz Function called")
        //http://127.0.0.1:6001/quizmaster-c66a2/us-central1/grabCustomQuiz
      // https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabCustomQuiz
      await fetch('https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabCustomQuiz?quizid=' + uid)
      .then((res) => res.json())
      .then((data) => {
        updateQuiz(data.data)
        updateEditedQuiz(data.data)
      })
      .catch((err) => {
        console.log("Respone Error: ", err.message);
      })
    }

    const deleteQuiz = async (uid) => {
        // call function to delete quiz from DB
        // https://us-central1-quizmaster-c66a2.cloudfunctions.net/deleteCustomQuiz
    
        await fetch("https://us-central1-quizmaster-c66a2.cloudfunctions.net/deleteCustomQuiz?quizid=" + uid)
        .then((res) => res.json())
        .then((response) => {
          console.log("Deletion Response: ", response)
          navigate("/dashboard")
        })
        .catch((error) => {
          console.log("Delete Error: ", error.message)
        })
      }

    //packages data
    const value = {
        quiz, 
        updateQuiz,
        getQuiz,
        deleteQuiz
    }
    
//context provider
    return (
        <CustomQuizContext.Provider value={value}>
            {children}
        </CustomQuizContext.Provider>
    )
}