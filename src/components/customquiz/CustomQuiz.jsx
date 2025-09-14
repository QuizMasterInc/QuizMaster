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

    // Fetch user's existing quizzes on component mount
  useEffect(() => {
    async function fetchUserQuizzes() {
      if (!currentUser?.uid) return;
      
      try {
        const quizzes = await quizService.getCustomQuizzesByUser(currentUser.uid);
        setCustomQuizzes(quizzes);
        console.log('Custom Quizzes:', quizzes);
      } catch (error) {
        console.error('Error fetching user quizzes:', error);
        setCustomQuizzes([]);
      }
    }
    fetchUserQuizzes();
  }, [currentUser.uid]);

  // Create and submit quiz using service layer
  async function sendQuiz() {
    try {
      // Validate minimum quiz length
      if (quizData.length < 1) {
        alert("You need to have at least one question in the quiz.");
        return;
      }

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
    </div>
    </>
  )
}
