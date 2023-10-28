import React, {useState, useEffect} from 'react'
import {useAuth} from '../../contexts/AuthContext'
import { Link, Navigate, json } from 'react-router-dom'


export default function CustomQuiz () {
  /**
   * state variables
   */
  const {currentUser, logout, isGoogleAuth} = useAuth()
  const [loading, setLoading] = useState(true)
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

  // THIS FUNCTION TAKES THE ARRAY OF QUESTIONS DATA AND THEN IT CREATES IT INTO AN OBJECT SO THAT IT CAN GO TO FIRESTORE SUCCESFULLY
  const createQuizDataObject = (quizData) => {
    const quizDataObject = {}
    for (let i = 0; i < quizData.length; i++) {
      const questionDetailsArray = quizData[i];
      const questionNumber = `Question ` + (quizData.indexOf(questionDetailsArray) + 1);
      const questionObject = {
        question: questionDetailsArray[0],
        option_1: questionDetailsArray[1],
        option_2: questionDetailsArray[2],
        option_3: questionDetailsArray[3],
        option_4: questionDetailsArray[4],
        correct_answer: questionDetailsArray[5],
      }
      quizDataObject[questionNumber] = questionObject
    }
    console.log(quizDataObject);
    return quizDataObject
  }


  // this creates the quiz object which we can use to send all the required data to the database
  const createQuizObject = () => {
    const validQuizName = verifyQuizNameInput(quizName)
    if (validQuizName) {
      const userId = currentUser.uid
      const questionCount = quizData.length
      const quizObject = {
          creatorID: userId,
          title: quizName,
          questionCount: questionCount,
          quizData: createQuizDataObject(quizData)
      }
      //resets quiz questions to start a new quiz 
      setQuizData([])
      // WHEN A USER CLICKS FINISH QUIZ THIS LOGS THE OBJECT TO ENSURE IT IS CORRECT. USE THIS DATA ON DATABASE
      console.log(quizData)
      console.log(quizObject);
      return quizObject;
      } else {
        alert("Please Type a Quiz Name!")
      }
  }

    //THIS FUCNTION FIRST CREATES THE QUIZ OBJECT AND THEN SENDS IT TO THE DATABASE WHEN USER HITS FINISH QUIZ 
  async function sendQuiz() {
    const obj = createQuizObject()
    //http://127.0.0.1:6001/quizmaster-c66a2/us-central1/addCustomQuiz
    //https://us-central1-quizmaster-c66a2.cloudfunctions.net/addCustomQuiz
    await fetch('https://us-central1-quizmaster-c66a2.cloudfunctions.net/addCustomQuiz', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(obj)
      })
      .then((res) => res.json())
      .then((data) => {
        // here is where functionality off the created data will be. 
        
        // redirect user to quiz display page using the returned ID in data
        console.log("Response Data", data)
      })
      .catch((err) => {
        console.log("Respone Error", err.message);
      })
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


  const verifyQuizNameInput = (quizName) => {
    if (!quizName){
      return false
    }
    return true
  }

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
        <div className="w-full max-w-2xl space-y-8 -sm:ml-10">
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
            <div className='w-full' id="questionsList">
              {quizData.map((quiz, index) => (
                <div key={index} className='flex flex-col pb-4 mb-4 mt-10 bg-gray-900 rounded-lg shadow-lg -md:pl-2 -md:pr-2 -md:pb-2'>
                  <div className='flex flex-row pt-4 pb-4 pl-2 pr-6 text-3xl text-gray-300 align-middle space-x-3 -md:text-sm -md:space-x-2S'>
                    <p className='ml-2'>{index + 1 + "."}</p>
                    <p className='mr-2'>{quizData[index][0]}</p>
                  </div>
                  <button className='p-2 mb-3 ml-2 mr-2 text-gray-300 bg-gray-800 rounded-md shadow-md -md:text-sm hover:bg-gray-600'>{quizData[index][1]}</button>
                  <button className='p-2 mb-3 ml-2 mr-2 text-gray-300 bg-gray-800 rounded-md shadow-md -md:text-sm hover:bg-gray-600'>{quizData[index][2]}</button>
                  <button className='p-2 mb-3 ml-2 mr-2 text-gray-300 bg-gray-800 rounded-md shadow-md -md:text-sm hover:bg-gray-600'>{quizData[index][3]}</button>
                  <button className='p-2 mb-3 ml-2 mr-2 text-gray-300 bg-gray-800 rounded-md shadow-md -md:text-sm hover:bg-gray-600'>{quizData[index][4]}</button>
                  <p className='text-2xl mb-4 text-gray-300 align-middle -md:text-sm'>Correct Awnser</p>
                  <button className='p-2 mb-3 ml-2 mr-2 text-gray-300 bg-gray-800 rounded-md shadow-md -md:text-sm hover:bg-gray-600'>{quizData[index][5]}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
    </div>
    </>
    )
}

