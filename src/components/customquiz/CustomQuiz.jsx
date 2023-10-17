import React, {useState, useEffect} from 'react'
import { useCategory } from '../../contexts/CategoryContext'
import {useAuth} from '../../contexts/AuthContext'
import { Link, Navigate } from 'react-router-dom'
import Q from '../icons/Q'


export default function CustomQuiz () {
  /**
   * state variables
   */
  const [error, setError] = useState('')
  const {currentUser, logout, isGoogleAuth} = useAuth()
  const [loading, setLoading] = useState(false)
  const {quizCategories, icons} = useCategory()
  const [results, setResults] = useState([])
  const [finishedMakingQuiz, setFinishedMakingQuiz] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(["", "", "", "", "", ""]);
  const [quizData, setQuizData] = useState([])
  const [quizName, setQuizName] = useState("")

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


  // this creates the quiz object which we can use to send all the required data to the database
  const createQuizObject = () => {
    const createdDate = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    const userId = currentUser.uid
    const questionCount = quizData.length
    const quizObject = {
        creator: userId,
        createdDate: createdDate,
        questionCount: questionCount,
        quizName: quizName,
        quizData: quizData,
    }
    //resets quiz questiOns to start a new quiz 
    setQuizData([])
    // WHEN A USER CLICKS FINISH QUIZ THIS LOGS THE OBJECT TO ENSURE IT IS CORRECT. USE THIS DATA ON DATABASE
    console.log(quizObject);
    return quizObject;
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
  const addCurrentQuestion = () => {
    setQuizData((prevQuizData) => 
    [
      ...prevQuizData,
      currentQuestion
    ]);
    setCurrentQuestion(["", "", "", "", "", ""]);
  };


  const handleQuizNameChange = (e) => {
    setQuizName((prevQuizName) => {
      let newName = prevQuizName;
      newName = e.target.value;
      return newName;
    });
  }

  //Used this to make sure the proper question was added to the quizData array after pressing add question
  useEffect(() => {
    console.log(quizData); // This just shows the updated state of quizData which is all the current questions in the array
  }, [quizData]);
  

    return (
    <>
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg space-y-8">
          <div className='flex flex-col items-center justify-center'>
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
                  required
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
                    required
                  />
                </div>
                ))}
                <input
                  id="right-answer"
                  type="text"
                  placeholder='Enter the correct Answer'
                  value={currentQuestion[5]}
                  onChange={(e) => handleQuestionChange(e, 5)}
                  className='text-2xl mb-4 rounded-md w-full h-10 focus:scale-110 duration-500'
                  required
                />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-y-3 gap-x-3 items-center justify-center'>
              <div className='flex relative items-center mt-10 p-4 pl-8 pr-8 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600 -md:ml-20'>
                <button type='submit' onClick={addCurrentQuestion}>Add Question</button>
              </div>

              <div className='flex relative items-center mt-10 p-4 pl-8 pr-8 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600 -md:ml-20'>
                <button onClick={createQuizObject}>Finish Quiz</button>
              </div>
              <Link to={'/quizzes'}>
                <div className='flex relative items-center p-4 pl-8 pr-8 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600 -md:ml-20'>
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
                className="flex relative items-center p-4 pl-8 pr-8 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600"
              >
                Logout
              </button>
            </div>
            <div id="questionsList" className='mt-10'>
              {quizData.map((quiz, index) => (
                <ul key={index} className='text-xl m-10'>
                  <li className='text-white flex justify-start max-w-lg break-words'>Question {index + 1}: {quizData[index][0]}</li>
                  <li className='text-white flex justify-start max-w-lg break-words'>Option 1: {quizData[index][1]}</li>
                  <li className='text-white flex justify-start max-w-lg break-words'>Option 2: {quizData[index][2]}</li>
                  <li className='text-white flex justify-start max-w-lg break-words'>Option 3: {quizData[index][3]}</li>
                  <li className='text-white flex justify-start max-w-lg break-words'>Option 4: {quizData[index][4]}</li>
                  <li className='text-white flex justify-start max-w-lg break-words'>Right Answer: {quizData[index][5]}</li>
                </ul>
              ))}
            </div>
          </div>
        </div>
    </div>
    </>
    )
}
