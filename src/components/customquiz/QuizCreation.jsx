//This file handles creating the users custom quiz and making it able to be accessed within the product and database
import React, {useState, useEffect} from 'react'
import {useAuth} from '../../contexts/AuthContext'
import { Link, Navigate } from 'react-router-dom'



export default function QuizCreation ({ setQuizData, sendQuiz, quizName, setQuizName, privateQuiz, setPrivateQuiz, privateQuizPassword, setPrivateQuizPassword, quizTags, setQuizTags }) {

  const { logout, isGoogleAuth} = useAuth()
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(["", "", "", "", "", ""]);

  


  /**
   * Logout function
   * @returns to signin once the user logs out
   */
  async function handleLogout(){
    setError('')
     var isAuth = false
    try{
        await logout()
        setLoading(true)
        isAuth = true
    }catch{
        setError("Failed to logout")
    }
    setLoading(false)
    localStorage.setItem('isAuthenticated', 'false');
    if(isAuth){
      return (
        <Navigate to="/signin" />
      )
    }
  }


    //THIS FUNCTION VERIFIES THAT ALL THE REQUIRED INPUTS ARE NOT EMPTY FOR EACH QUESTION
  const verifyQuestionInput = (currentQuestion) => {
    if (currentQuestion[6] === "TrueFalse") {
      return currentQuestion[0].trim() !== "" && currentQuestion[5] !== "";
    } else {
      let valid = true;
      for (let i = 0; i < currentQuestion.length; i++){
        if (!currentQuestion[i].trim()) {
          valid = false;
          break;
        }
      }
      return valid;
    }
  };

  

  //This function updates the information for each individual question
  const handleQuestionChange = (e, index) => {
    setCurrentQuestion((prevCurrentQuestion) => {
      const updatedQuestion = [...prevCurrentQuestion];
      updatedQuestion[index] = e.target.value;
      return updatedQuestion;
    })
  };

  //this function adds the question to the quizData array after user finished making the question 
  // ALSO CALLS THE FUNCTION THAT VERIFIES IF THE QUESTION INPUTS ARE ALL COMPLETED
  const addCurrentQuestion = () => {
    console.log(currentQuestion);
    const valid = verifyQuestionInput(currentQuestion);
    if (valid) {
      if (currentQuestion[6] === "TrueFalse") {
        const question = [currentQuestion[0], "True", "False", "", "",currentQuestion[5], "TrueFalse"];
        setQuizData((prevQuizData) => [...prevQuizData, question]);
      } else {
        setQuizData((prevQuizData) => [...prevQuizData, currentQuestion]);
      }
      setCurrentQuestion(["", "", "", "", "", "", ""]);
    } else {
      alert("Please fill out all inputs for the question.");
    }
   };

  const handleQuizNameChange = (e) => {
    setQuizName((prevQuizName) => {
      let newName = prevQuizName;
      newName = e.target.value;
      return newName;
    });
  }

  //THIS USE EFFECT CHECKS FOR ANYTIME THE USER SWITCHES FROM YES TO NO ON PRIVATE QUIZ SELECTION AND RESETS THE PASSWORD IF THEY SELECT NO
  useEffect(() => {
    // Reset password when switching from "Yes" to "No"
    if (!privateQuiz) {
      setPrivateQuizPassword("");
    }
  }, [privateQuiz]);


  const handlePrivateQuizChange = (e) => {
    setPrivateQuiz((previousChoice) => {
      let newChoice = previousChoice;
      newChoice = e.target.value;
      console.log(newChoice);
      if (newChoice === "yes") {
        return true
      } else if (newChoice === "no") {
        console.log(privateQuizPassword);
        return false  
      }
    })
  }

  const handleQuizPasswordChange = (e) => {
    setPrivateQuizPassword((prevQuizPassword) => {
      let newPassword = prevQuizPassword;
      newPassword = e.target.value;
      console.log(newPassword)
      return newPassword
    })
  }

  const updateQuizTags = (e) => {
    // Split the input string into an array of tags using space as the delimiter
    const arr = e.target.value.split(' ');
    // Update the quizTags state with the new array
    console.log("Newtags: ", arr)
    setQuizTags(arr);
  };


  return(
    <>
      <h1 className="text-3xl font-bold text-gray-300 mb-10">
        Create a Custom Quiz!
      </h1>
      <div className='w-full'>
        <div>
          <div className='flex justify-center mb-10'>
            <h1 className='font-bold text-gray-300 text-2xl'>Do you want this to be a private quiz?</h1>
            <select name="privateQuiz" id="privateQuiz" onChange={handlePrivateQuizChange} className='ml-10'>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
            <button></button>
          </div>
          {privateQuiz ?
           <input
            type='text'
            placeholder='Type your quiz password'
            className='text-2xl mb-4 rounded-md w-full h-12 focus:scale-110 duration-300'
            id="quizPassword"
            value={privateQuizPassword}
            onChange={handleQuizPasswordChange}
           >
           </input> : <></>}
        </div>
        <div name="quizName">
          <h1 className='font-bold text-gray-300 text-2xl mb-10'>Type Your Quiz Name</h1>
          <input 
          type="text"
          placeholder='Quiz Name'
          className='text-2xl mb-4 bg-gray-300 rounded-md w-full h-12 focus:scale-110 duration-300'
          id="quizName"
          value={quizName}
          onChange={(e) => handleQuizNameChange(e)}
          />
        </div>

        <div name="question-form" >
          <h1 className='font-bold text-gray-300 text-2xl mb-8'>Now start adding your questions!</h1>
          <input
            id="question"
            type="text"
            placeholder="Enter your question"
            value={currentQuestion[0]}
            onChange={(e) => handleQuestionChange(e, 0)}
            className='text-2xl bg-gray-300 mb-4 rounded-md w-full h-12 focus:scale-110 duration-300'
          />
          <select
            value={currentQuestion[6]}
            onChange={(e) => handleQuestionChange(e, 6)}
            className='text-2xl mb-4 bg-gray-300 rounded-md w-full h-12 focus:scale-110 duration-300'
            >
            <option value= "">Select Question Type</option>
            <option value="Multiple">Multiple Choice</option>
            <option value="TrueFalse">True/False</option>
          </select>
          {currentQuestion[6] === "Multiple" ? (
            [0, 1, 2, 3].map((optionIndex) => (
            <div key={optionIndex}>
                <input
                  id= {optionIndex + 1}
                  type="text"
                  placeholder={`Option ${optionIndex + 1}`}
                  value={currentQuestion[optionIndex + 1]}
                  onChange={(e) => handleQuestionChange(e, optionIndex + 1)}
                  className='text-2xl mb-4 bg-gray-300 rounded-md w-full h-10 focus:scale-110 duration-300'
                />
              </div>
            ))
          ) : currentQuestion[6]=== "TrueFalse" ? (
            
            <div className='mb-4'>  
              <h1 className='font-bold text-gray-300 text-2xl mb-8'>Select The Correct Answer!</h1>

              <label htmlFor='true' className='ml-8 text-gray-300 text-x1'>True</label>
              <input
                type="radio"
                id="true"
                name="truefalse"
                value="True"
                onChange={(e) => handleQuestionChange(e, 5)}
                checked={currentQuestion[5] === "True"}
              />
              <label htmlFor="false" className='ml-8 text-gray-300 text-xl'>False</label>
              <input
                type="radio"
                id="false"
                name="truefalse"
                value="False"
                onChange={(e) => handleQuestionChange(e, 5)}
                checked={currentQuestion[5] === "False"}
              />
            </div>
          ) : null}
          {currentQuestion[6] === "Multiple" && (
            <div name="correctChoiceSection" className='w-full'>
              <h1 className='font-bold text-gray-300 text-2xl mb-8'>Select The Correct Answer!</h1>
              <select 
              name="correctChoice"
              id="correct-choice"
              placeholder='Select the correct answer'
              className='w-full bg-gray-300 h-10 focus:scale-110 duration-300'
              onChange={(e) => handleQuestionChange(e, 5)}
              value={currentQuestion[5]}
              >
                <option value="">
                  Please select the correct answer
                </option>
                {[1, 2, 3, 4].map((question, index) => (
                  <option value={currentQuestion[question]} key={index}>
                    {currentQuestion[question] ? currentQuestion[question] : "Please type an answer for this option"}
                  </option>
                ))}
              </select>
            </div>
          )}
          <br />
          <div name="quizTags">
          <h1 className='font-bold text-gray-300  text-2xl mb-8'>Type Your Quiz Tags</h1>
          <input 
          type="text"
          placeholder='Eg. history, sports'
          className='text-2xl mb-4 bg-gray-300 rounded-md w-full h-12 focus:scale-110 duration-300'
          id="quizTags"
          value={quizTags.join(' ')}
          onChange={(e) => updateQuizTags(e)}
          />
        </div>
        </div>
      </div>



      <div className='grid grid-cols-2 gap-y-3 gap-x-3 -sm:gap-x-24'>
        <button
          type = 'submit'
          onClick={addCurrentQuestion}
          className='flex relative items-center justify-center mt-10 p-4 pl-8 pr-8 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600 -md:ml-20'>
          Add Question
        </button>

        <button
          onClick={sendQuiz}
          className='flex relative items-center justify-center mt-10 p-4 pl-8 pr-8 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600 -md:mr-20'>
          Finish Quiz
        </button>

      </div>     
    </>
  )
}