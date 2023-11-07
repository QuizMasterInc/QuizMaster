import React, {useState, useEffect} from 'react'
import { useNavigate } from "react-router-dom";
import QuizQuestionsList from './QuizQuestionsList'
import QuizCreation from './QuizCreation'
import {useAuth} from '../../contexts/AuthContext'


export default function CustomQuiz () {

  const {currentUser} = useAuth()
  const [quizData, setQuizData] = useState([])
  const [quizName, setQuizName] = useState("")
  const [privateQuizPassword, setPrivateQuizPassword] = useState("")
  const [privateQuiz, setPrivateQuiz] = useState(false)
  const [quizTags, setQuizTags] = useState([])

  const navigate = useNavigate()

  //THIS FUNCTION FIRST CREATES THE QUIZ OBJECT AND THEN SENDS IT TO THE DATABASE WHEN USER HITS FINISH QUIZ 
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

  const verifyQuizNameInput = (quizName) => {
    if (!quizName){
      return false
    }
    return true
  }

  const verifyQuizPasswordInput = (privateQuizPassword) => {
    if (privateQuizPassword === "") {
      return false
    }
    return true
  }
  const verifyQuizTagsInput = (quizTags) => {
    if (!quizTags){
      return false
    }
    return true
  }

  // this creates the quiz object which we can use to send all the required data to the database
  const createQuizObject = () => {
    const validQuizName = verifyQuizNameInput(quizName)
    const validQuizTags = verifyQuizTagsInput(quizTags)
    console.log("Gold Quiz Tags:", quizTags)
    if (privateQuiz) {
      const validQuizPassword = verifyQuizPasswordInput(privateQuizPassword)
      if (validQuizName && validQuizPassword && validQuizTags) {
        const userId = currentUser.uid
        const questionCount = quizData.length
        const quizObject = {
          quizPassword: privateQuizPassword,
          creatorID: userId,
          title: quizName,
          questionCount: questionCount,
          quizData: createQuizDataObject(quizData),
          quizTags: quizTags
        }
        //resets quiz questions to start a new quiz 
        setQuizData([])
        // WHEN A USER CLICKS FINISH QUIZ THIS LOGS THE OBJECT TO ENSURE IT IS CORRECT. USE THIS DATA ON DATABASE
        console.log(quizData)
        console.log(quizObject);
        console.log("quizTags: ", quizTags)
        return quizObject;
      } else {
        alert("Please type a quiz name and password!")
      }
      
    } else if (validQuizName) {
      const userId = currentUser.uid
      const questionCount = quizData.length
      const quizObject = {
        creatorID: userId,
        title: quizName,
        questionCount: questionCount,
        quizData: createQuizDataObject(quizData),
        quizTags: tag
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
          // data returns properly in format
          // { status: 200, quidID: (insert UID), message: (insert message) }
          console.log("Response Data", data)
          if (data.quizID) {
            navigate(`/customquiz/${data.quizID}`)
          }
        })
        .catch((err) => {
          console.log("Respone Error", err.message);
        })
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
            <QuizCreation
              quizData={quizData} 
              setQuizData={setQuizData}
              sendQuiz={sendQuiz}
              quizname={quizName}
              setQuizName={setQuizName}
              privateQuiz = {privateQuiz}
              setPrivateQuiz= {setPrivateQuiz}
              privateQuizPassword={privateQuizPassword}  
              setPrivateQuizPassword={setPrivateQuizPassword}
              quizTags={quizTags}
              setQuizTags={setQuizTags}
            />
            <QuizQuestionsList quizData={quizData}/>
          </div>
        </div>
    </div>
    </>
    )
}

