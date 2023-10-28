import React, {useState, useEffect} from 'react'
import {useAuth} from '../../contexts/AuthContext'
import { Link, Navigate } from 'react-router-dom'



export default function QuizCreation ({ setQuizData, sendQuiz, quizName, setQuizName}) {

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
    let valid = false
    for (let i = 0; i < currentQuestion.length; i ++){
      if (!currentQuestion[i]) {
        return false
      } else {
        valid = true      
      }  
    }
    return valid
  }

  

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
    console.log(currentQuestion)
    const valid = verifyQuestionInput(currentQuestion)
    console.log(valid)
    if (valid === true) {
      setQuizData((prevQuizData) => 
      [
        ...prevQuizData,
        currentQuestion
      ]);
      setCurrentQuestion(["", "", "", "", "", ""]);
    } else {
      alert("Please fill out all inputs for the question.")
    }
  };

  const handleQuizNameChange = (e) => {
    setQuizName((prevQuizName) => {
      let newName = prevQuizName;
      newName = e.target.value;
      return newName;
    });
  }


  return(
    <>
      <h1 className="text-2xl font-bold text-gray-300 mb-10">
        Create a Custom Quiz!
      </h1>
      <div className='w-full'>
        <div name="quizName">
          <h1 className='text-white text-2xl mb-10'>First Type Your Quiz Name</h1>
          <input 
          type="text"
          placeholder='Quiz Name'
          className='text-2xl mb-4 rounded-md w-full h-12 focus:scale-110 duration-300'
          id="quizName"
          value={quizName}
          onChange={(e) => handleQuizNameChange(e)}
          />
        </div>

        <div name="question-form" >
          <h1 className='text-white text-2xl mb-8'>Now start adding your questions!</h1>
          <input
            id="question"
            type="text"
            placeholder="Enter your question"
            value={currentQuestion[0]}
            onChange={(e) => handleQuestionChange(e, 0)}
            className='text-2xl mb-4 rounded-md w-full h-12 focus:scale-110 duration-300'
          />
          {[0, 1, 2, 3].map((optionIndex) => (
          <div key={optionIndex}>
            <input
              id= {optionIndex + 1}
              type="text"
              placeholder={`Option ${optionIndex + 1}`}
              value={currentQuestion[optionIndex + 1]}
              onChange={(e) => handleQuestionChange(e, optionIndex + 1)}
              className='text-2xl mb-4 rounded-md w-full h-10 focus:scale-110 duration-300'
            />
          </div>
          ))}
          <div name="correctChoiceSection" className='w-full'>
            <h1 className='text-white text-2xl mb-8'>Lastly Select The Correct Answer!</h1>
            <select 
            name="correctChoice"
            id="correct-choice"
            placeholder='Select the correct answer'
            className='w-full h-10 focus:scale-110 duration-300'
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
        </div>
      </div>



      <div className='grid grid-cols-2 gap-y-3 gap-x-3 -sm:gap-x-24'>
        <div className='flex relative items-center justify-center mt-10 p-4 pl-8 pr-8 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600 -md:ml-20'>
          <button type='submit' onClick={addCurrentQuestion}>Add Question</button>
        </div>

        <div className='flex relative items-center justify-center mt-10 p-4 pl-8 pr-8 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600 -md:mr-20'>
          <button onClick={sendQuiz}>Finish Quiz</button>
        </div>
        <Link to={'/quizzes'}>
          <div className='flex relative items-center justify-center p-4 pl-8 pr-8 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600 -md:ml-20'>
            Take a premade quiz!
          </div>
        </Link>
        {!isGoogleAuth && <Link to={'/updateprofile'}>
          <div className='flex relative items-center p-4 pl-8 pr-8 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600'>
            Update Profile
          </div>
          </Link>}

        <button
          disabled={loading}
          onClick={handleLogout}
          className="flex relative items-center justify-center p-4 pl-8 pr-8 h-full text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600 -md:mr-20"
        >
          Logout
        </button>
      </div>     
    </>
  )
}