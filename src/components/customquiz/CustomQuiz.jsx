//This file handles UI for creating a custom quiz. Business logic is in quizService.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizQuestionsList from './QuizQuestionsList';
import QuizCreation from './QuizCreation';
import { useAuth } from '../../contexts/AuthContext';
import quizCreationService from '../../services/quiz/quizCreationService';
import quizRetrievalService from '../../services/quiz/quizRetrievalService';
import { toast } from 'react-toastify';

export default function CustomQuiz() {
  const [quizData, setQuizData] = useState([])
  const [quizName, setQuizName] = useState("")
  const [privateQuizPassword, setPrivateQuizPassword] = useState("")
  const [privateQuiz, setPrivateQuiz] = useState(false)
  const [quizTags, setQuizTags] = useState([])
  const [customQuizzes, setCustomQuizzes] = useState([])
  const [teacherQuiz, setTeacherQuiz] = useState(false)
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false)
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  // Fetch user's existing quizzes on component mount
  useEffect(() => {
    async function fetchUserQuizzes() {
      try {
        // Use the service layer instead of direct fetch
        const data = await quizRetrievalService.getCustomQuizzesByUser(currentUser.uid);
        setCustomQuizzes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching user quizzes:', error);
        // Set empty array on error to prevent crashes
        setCustomQuizzes([]);
        // Don't show alert here as it's not critical for quiz creation
      }
    }

    if (currentUser?.uid) {
      fetchUserQuizzes();
    }
  }, [currentUser?.uid]);

  // Create and submit quiz using service layer
  async function sendQuiz() {
    try {
      // Validate minimum quiz length
      if (quizData.length < 1) {
        toast.warn("You need to have at least one question in the quiz.");
        return;
      }

      setIsCreatingQuiz(true);

      // Create validated quiz object using service (let quizService.js handle the transformation)
      const quizInput = {
        quizName,
        quizData: quizData, // Send original array format - let service handle transformation
        quizTags,
        privateQuiz,
        privateQuizPassword,
        currentUserId: currentUser.uid,
        teacherQuiz, // Add teacher quiz flag
        // NEW FIELDS for new schema
        description: "", // Add a description input field if desired
        category: "" // Add a category selector if desired
      };

      const validationResult = await quizCreationService.createValidatedQuizObject(quizInput);

      if (!validationResult.success) {
        toast.error(validationResult.error);
        return;
      }

      // Submit quiz to database
      const response = await quizCreationService.submitCustomQuiz(validationResult.quizObject);

      if (response.quizID) {
        // Reset form
        setQuizData([]);
        setQuizName("");
        setPrivateQuizPassword("");
        setQuizTags([]);

        // Refresh the custom quizzes list to include the new quiz
        try {
          const updatedQuizzes = await quizRetrievalService.getCustomQuizzesByUser(currentUser.uid);
          setCustomQuizzes(Array.isArray(updatedQuizzes) ? updatedQuizzes : []);
        } catch (error) {
          console.error('Error refreshing quiz list:', error);
        }

        // Show success message and navigate to the newly created quiz
        toast.success(`Quiz "${quizName}" created successfully!`);
        navigate(`/customquiz/settings/${response.quizID}`, {
          state: { password: privateQuizPassword }
        });
      }

    } catch (error) {
      console.error("Error creating quiz:", error);
      toast.error("Failed to create quiz. Please try again.");
    } finally {
      setIsCreatingQuiz(false);
    }
  }

  // Handle question deletion
  const handleDeleteQuestion = (index) => {
    const updatedQuizData = quizData.filter((_, i) => i !== index);
    setQuizData(updatedQuizData);
  };

  return (
    <div className="min-h-screen py-20 px-6 bg-primary text-primary">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-card rounded-2xl p-6 shadow-xl border border-accent">
            <h1 className="text-4xl font-bold text-center mb-2 text-gradient-primary">
              Create Your Custom Quiz
            </h1>
            <p className="text-lg text-center text-secondary">
              Build engaging quizzes with your own questions and share them with others
            </p>
          </div>
        </div>

        {/* Main content container */}
        <div className="bg-card rounded-3xl p-8 shadow-xl border border-accent space-y-6">
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
            isCreatingQuiz={isCreatingQuiz}
          />
          <QuizQuestionsList
            quizData={quizData}
            setQuizData={setQuizData}
            handleDeleteQuestion={handleDeleteQuestion}
          />
        </div>
      </div>
    </div>
  )
}