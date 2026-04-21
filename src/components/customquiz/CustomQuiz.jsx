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
  const [quizDescription, setQuizDescription] = useState("")
  const [privateQuizPassword, setPrivateQuizPassword] = useState("")
  const [privateQuiz, setPrivateQuiz] = useState(false)
  const [quizTags, setQuizTags] = useState([])
  const [customQuizzes, setCustomQuizzes] = useState([])
  const [teacherQuiz, setTeacherQuiz] = useState(false)
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false)
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchUserQuizzes() {
      try {
        const data = await quizRetrievalService.getCustomQuizzesByUser(currentUser.uid);
        setCustomQuizzes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching user quizzes:', error);
        setCustomQuizzes([]);
      }
    }

    if (currentUser?.uid) {
      fetchUserQuizzes();
    }
  }, [currentUser?.uid]);

  async function sendQuiz() {
    try {
      if (quizData.length < 1) {
        toast.warn("You need to have at least one question in the quiz.");
        return;
      }

      setIsCreatingQuiz(true);
      const normalizedDescription = quizDescription.trim();

      const quizInput = {
        quizName,
        quizData: quizData,
        quizTags,
        privateQuiz,
        privateQuizPassword,
        currentUserId: currentUser.uid,
        teacherQuiz,
        description: normalizedDescription,
        category: ""
      };

      const validationResult = await quizCreationService.createValidatedQuizObject(quizInput);

      if (!validationResult.success) {
        toast.error(validationResult.error);
        return;
      }

      const response = await quizCreationService.submitCustomQuiz(validationResult.quizObject);

      if (response.quizID) {
        // Save values before resetting form
        const password = privateQuizPassword;
        const name = quizName;

        // Reset form
        setQuizData([]);
        setQuizName("");
        setQuizDescription("");
        setPrivateQuizPassword("");
        setQuizTags([]);

        // Refresh the custom quizzes list
        try {
          const updatedQuizzes = await quizRetrievalService.getCustomQuizzesByUser(currentUser.uid);
          setCustomQuizzes(Array.isArray(updatedQuizzes) ? updatedQuizzes : []);
        } catch (error) {
          console.error('Error refreshing quiz list:', error);
        }

        toast.success(`Quiz "${name}" created successfully!`);
        navigate(`/customquiz/settings/${response.quizID}`, {
          state: { password }
        });
      }

    } catch (error) {
      console.error("Error creating quiz:", error);
      toast.error("Failed to create quiz. Please try again.");
    } finally {
      setIsCreatingQuiz(false);
    }
  }

  const handleDeleteQuestion = (index) => {
    const updatedQuizData = quizData.filter((_, i) => i !== index);
    setQuizData(updatedQuizData);
  };

  return (
    <div className="min-h-screen py-20 px-6 bg-primary text-primary">
      <div className="max-w-6xl mx-auto">
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

        <div className="bg-card rounded-3xl p-8 shadow-xl border border-accent space-y-6">
          <QuizCreation
            setQuizData={setQuizData}
            sendQuiz={sendQuiz}
            quizName={quizName}
            setQuizName={setQuizName}
            quizDescription={quizDescription}
            setQuizDescription={setQuizDescription}
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