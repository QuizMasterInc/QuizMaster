//This file handles UI for creating a custom quiz. Business logic is in quizService.
import React, {useState, useEffect} from 'react'
import { useNavigate } from "react-router-dom";
import QuizQuestionsList from './QuizQuestionsList'
import QuizCreation from './QuizCreation'
import {useAuth} from '../../contexts/AuthContext'
import quizService from '../../services/quizService'


export default function CustomQuiz () {

  const [quizData, setQuizData] = useState([])
  const [quizName, setQuizName] = useState("")
  const [privateQuizPassword, setPrivateQuizPassword] = useState("")
  const [privateQuiz, setPrivateQuiz] = useState(false)
  const [quizTags, setQuizTags] = useState([])
  const [customQuizzes, setCustomQuizzes] = useState([])
  const [teacherQuiz, setTeacherQuiz] = useState(false)
  const { currentUser } = useAuth()
  

  const navigate = useNavigate()


  //THIS FETCHES THE USERS CUSTOM QUIZZES FROM DATABASE 
  useEffect(() => {
    async function fetchUserQuizzes() {
      try {
        //http://127.0.0.1:6001/quizmaster-c66a2/us-central1/grabCustomQuizzesByUser
        //https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabCustomQuizzesByUser
        const response = await fetch('https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabCustomQuizzesByUser?creator=' + currentUser.uid, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        })
        if (response.ok) {
          const data = await response.json()
          setCustomQuizzes(data)
          console.log('Custom Quizzes:', data)
          
        } else {
          // Handle the case when the response is not ok (e.g., error handling)
          console.error('Response Error:', response.statusText);
        }
      } catch (error) {
        // Handle any fetch-related errors here
        console.error('Fetch error:', error);
        console.log(customQuizzes)
      }
    }
    fetchUserQuizzes(currentUser.uid);
  }, []);



  //THIS FUNCTION CREATES AND SUBMITS THE QUIZ USING THE SERVICE LAYER
  async function sendQuiz() {
    try {
      // Create validated quiz object using service
      const quizInput = {
        quizName,
        quizData,
        quizTags,
        privateQuiz,
        privateQuizPassword,
        currentUserId: currentUser.uid,
        userQuizzes: customQuizzes
      };

      const validationResult = quizService.createValidatedQuizObject(quizInput);
      
      if (!validationResult.success) {
        alert(validationResult.error);
        return;
      }

      // Submit quiz to database
      const response = await quizService.submitCustomQuiz(validationResult.quizObject);
      console.log("Quiz created successfully:", response);

      if (response.quizID) {
        // Reset form and navigate to quiz
        setQuizData([]);
        setQuizName("");
        setPrivateQuizPassword("");
        setQuizTags([]);
        navigate(`/customquiz/${response.quizID}`);
      }

    } catch (error) {
      console.error("Error creating quiz:", error);
      alert("Failed to create quiz. Please try again.");
    }
  }

  // Handle question deletion
  const handleDeleteQuestion = (index) => {
    const updatedQuizData = quizData.filter((_, i) => i !== index);
    setQuizData(updatedQuizData);
  };

  return (

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
      <div className="h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Create Your Custom Quiz
            </h1>
            <p className="text-lg text-gray-600">
              Build engaging quizzes with your own questions and share them with others
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl p-8 space-y-6">
            <QuizCreation 
              setQuizData={setQuizData}
              sendQuiz={sendQuiz}
              quizName={quizName}
              setQuizName={setQuizName}
              privateQuiz={privateQuiz}
              setPrivateQuiz={setPrivateQuiz}
              privateQuizPassword={privateQuizPassword}
              setPrivateQuizPassword={setPrivateQuizPassword}
              quizTags={quizTags}
              setQuizTags={setQuizTags}
              teacherQuiz={teacherQuiz}
              setTeacherQuiz={setTeacherQuiz}
            />
            <QuizQuestionsList quizData={quizData} setQuizData={setQuizData} handleDeleteQuestion={handleDeleteQuestion}/>  
          </div>
        </div>
    </div>
    </>
    )

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

    // THIS FUNCTION GETS ALL THE USERS QUIZ TITLES
    function getQuizTitles(customQuizzes) {
      console.log("custom quizzes:", customQuizzes)
      return (customQuizzes.data.map((quiz) => quiz.data.title))
    }
    // THIS FUNCTION TESTS TO SEE IF A TITLE THE USER IS CREATING ALREADY EXISTS IN THEIR QUIZZES 
    function isTitleExists(quizTitles, newTitle) {
      return quizTitles.some(quiz => quiz.toLowerCase() === newTitle.toLowerCase());
    }
  

  // this creates the quiz object which we can use to send all the required data to the database
  const createQuizObject = () => {
    const validQuizName = verifyQuizNameInput(quizName)
    const duplicateQuizTitles = isTitleExists(getQuizTitles(customQuizzes), quizName)
    console.log(duplicateQuizTitles)
    const validQuizTags = verifyQuizTagsInput(quizTags)
    console.log("Gold Quiz Tags:", quizTags)
    if (duplicateQuizTitles) {
      alert("You already have a quiz with this title. Please choose a different title for this quiz. ")
      return 
    } else if (privateQuiz) {
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
        quizTags: quizTags
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
      const quizDataLenght = obj.questionCount
      console.log("quiz lenght: ", quizDataLenght)
      if (quizDataLenght < 1) {
        return alert("You need to have at least one question in the quiz.")
      } else {
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
    }


    // THIS FUNCTION IS USED IN THE QUIZQUESTIONLIST COMPONENT TO DELETE A QUESTION IF A USER DOES NOT WANT IT ANYMORE
    const handleDeleteQuestion = (index) => {
      let updatedQuizData = [...quizData]
      updatedQuizData.splice(index, 1)
      setQuizData(updatedQuizData)
    }

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
              teacherQuiz={teacherQuiz}
              setTeacherQuiz={setTeacherQuiz}
            />
            <QuizQuestionsList quizData={quizData} setQuizData={setQuizData} handleDeleteQuestion={handleDeleteQuestion}/>  
          </div>
        </div>
    </div>
    </>
    )
}

