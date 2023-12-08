/**
This function holds the context for a single custom quiz when it is accessed or created. 

This context handles:
  - State that holds the custom quiz object
  - calling the DB to get the custom quiz and fill the state
  - deleting the custom quiz
  - updating the custom quiz with edited data
 */

import React, {useContext, useState, useRef } from 'react'
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

    const quizRef = useRef(null) // ref holds initial quiz data for reference when quiz is edited

    const navigate = useNavigate() // used when quiz is deleted

    // function calls api to retreive quiz from DB
    // params uid: string
    // # uid is the unique string necessary for finding and accessing the custom quiz in the db
    const getQuiz = async(uid) => {
        console.log("GetQuiz Function called")
        //http://127.0.0.1:6001/quizmaster-c66a2/us-central1/grabCustomQuiz
      // https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabCustomQuiz
      await fetch('https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabCustomQuiz?quizid=' + uid)
      .then((res) => res.json())
      .then((data) => {
        // successful retrieval of quiz
        // state updates
        updateQuiz(data.data)
        quizRef.current = data.data
      })
      .catch((err) => {
        // error found
        console.log("Respone Error: ", err.message);
      })
    }

    // function deletes the current quiz from the DB
    // params uid: string
    // # uid is the unique string necessary for finding and accessing the custom quiz in the db
    const deleteQuiz = async (uid) => {
        // https://us-central1-quizmaster-c66a2.cloudfunctions.net/deleteCustomQuiz
    
        await fetch("https://us-central1-quizmaster-c66a2.cloudfunctions.net/deleteCustomQuiz?quizid=" + uid)
        .then((res) => res.json())
        .then((response) => {
          // successful deletion
          console.log("Deletion Response: ", response)
          quizRef.current = null
          navigate("/dashboard") // navigate user to their dashboard
        })
        .catch((error) => {
          // error found
          console.log("Delete Error: ", error.message)
        })
      }

      // function calls api to update quiz in the DB
      // params uid: string
      // # uid is the unique string necessary for finding and accessing the custom quiz in the db
      const updateQuizDB = (uid) => {
        // check to see if quiz is different from quizRef
        const sendObj = {
          title: "", 
          questions: {}
        }
        var newData = false

        // check if title has been edited
        if (quizRef.current.title != quiz.title) {
          newData = true
          sendObj.title = quiz.title
        }

        // get key sizes to see if questions have been added or deleted
        let quizRefKeys = Object.keys(quizRef.current.questions)
        let quizKeys = Object.keys(quiz.questions)

        // checks for added or deleted keys
        if (quizRefKeys.size() != quizKeys.size()) {
          newData = true
          sendObj.questions = quiz.questions
        }
        else{
          // loop to check each question for edited data in the event that no questions have been added or deleted
          quizRefKeys.forEach((v, i) => {
            if (quizRef.current.questions[v].question != quiz.questions[v].question) {
              newData = true
              sendObj.questions = quiz.questions
            }
            else if (quizRef.current.questions[v].option_1 != quiz.questions[v].option_1) {
              newData = true
              sendObj.questions = quiz.questions
            }
            else if (quizRef.current.questions[v].option_2 != quiz.questions[v].option_2) {
              newData = true
              sendObj.questions = quiz.questions
            }
            else if (quizRef.current.questions[v].option_3 != quiz.questions[v].option_3) {
              newData = true
              sendObj.questions = quiz.questions
            }
            else if (quizRef.current.questions[v].option_4 != quiz.questions[v].option_4) {
              newData = true
              sendObj.questions = quiz.questions
            }
            else if (quizRef.current.questions[v].correct_answer != quiz.questions[v].corrent_answer) {
              newData = true
              sendObj.questions = quiz.questions
            }
          })
        }
        
        // return if there is no edited data
        if (!newData) return

        // call api to update custom quiz in DB
        alert("updating DB")
        quizRef.current = quiz
      }

    // packages data
    // # Anything added to this file that other files or components need access to get added to this object
    const value = {
        quiz, 
        updateQuiz,
        getQuiz,
        deleteQuiz, 
        updateQuizDB
    }
    
//context provider
    return (
        <CustomQuizContext.Provider value={value}>
            {children}
        </CustomQuizContext.Provider>
    )
}