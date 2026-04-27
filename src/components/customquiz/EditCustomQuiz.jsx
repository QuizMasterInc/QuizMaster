/*
This is the main component for every custom quiz once they are created to be viewed and possibly edited.

- The router renders this component at the url "url/customquiz/${customQuizID}"

This component provides state to allow the following editing features on a custom quiz:
  - Editing the quizzes title
  - Choosing to delete the quiz entirely 
  - Save all editing changes to the DB
  ** Editing features for each question found in the child component EditQuestion.jsx provided in this component via postQuestions()

  NOT IMPLEMENTED YET:
    - changing the toggle on if a quiz is password locked or not
    - editing the password for accessing the quiz if it is password locked
    - allowing the adding or deletion of tags for the quiz
    - Defensive programming to make sure that the title is never saved as anything that matches the title of another custom quiz by the same user. 
*/

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuiz } from '../../contexts/QuizContext'
import { useAuth } from '../../contexts/AuthContext'
import QuizQuestionsList from './QuizQuestionsList'
import { toast } from 'react-toastify'

export default function EditCustomQuiz() {
  const [deleteBtn, toggleDeleteBtn] = useState(false)
  const [editingTitle, toggleEditingTitle] = useState(false)
  const [quizTitle, changeQuizTitle] = useState("")
  const [quizDeletionText, updateDeletionText] = useState("")
  const [saving, setSaving] = useState(false)
  const [quizDataArray, setQuizDataArray] = useState([])

  const customQuiz = useQuiz() // quiz context to access quiz state
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const { quizID } = useParams()  // retrieves quiz ID from URL params

  // Helper functions to access new nested structure
  const getQuizTitle = (quiz) => quiz?.metadata?.title || quiz?.title || "";
  const getQuizQuestionCount = (quiz) => quiz?.metadata?.questionCount || quiz?.content?.questionCount || quiz?.numQuestions || 0;
  const getQuizAttempts = (quiz) => quiz?.analytics?.stats?.attempts || quiz?.quizTaken || 0;
  const getQuizCreatedAt = (quiz) => quiz?.timestamps?.createdAt || quiz?.createdAt || "";
  const getQuizUpdatedAt = (quiz) => quiz?.timestamps?.updatedAt || quiz?.lastEdit || "";

  // Convert quiz object questions to array format for QuizQuestionsList
  const convertQuizToArray = useCallback((quiz) => {
    if (!quiz) return [];
    
    const questions = quiz.content?.questions || quiz.questions || {};
    
    // If already an array, use it
    if (Array.isArray(questions)) {
      return questions;
    }
    
    // Convert object format to array format
    return Object.keys(questions)
      .sort((a, b) => {
        const aNum = Number(a.split(" ")[1]) || 0;
        const bNum = Number(b.split(" ")[1]) || 0;
        return aNum - bNum;
      })
      .map(key => {
        const q = questions[key];
        return [
          q.question || "",
          q.option_1 || q.options?.[0] || "",
          q.option_2 || q.options?.[1] || "",
          q.option_3 || q.options?.[2] || "",
          q.option_4 || q.options?.[3] || "",
          q.correct_answer || q.correctAnswer || ""
        ];
      });
  }, []);

  // Convert array format back to quiz object format
  const convertArrayToQuiz = useCallback((arrayData) => {
    const questionsObject = {};
    arrayData.forEach((q, index) => {
      const key = `Question ${index + 1}`;
      questionsObject[key] = {
        question: q[0],
        option_1: q[1],
        option_2: q[2],
        option_3: q[3],
        option_4: q[4],
        correct_answer: q[5],
        type: "Multiple",
        difficulty: 3,
        explanation: "",
        points: 1
      };
    });
    return questionsObject;
  }, []);

  // Sync quiz from context to array on load
  useEffect(() => {
    if (customQuiz.quiz) {
      const arrayData = convertQuizToArray(customQuiz.quiz);
      setQuizDataArray(arrayData);
    }
  }, [customQuiz.quiz, convertQuizToArray]); 

  const handleTitleClick = () => {
    toggleEditingTitle(true)
    changeQuizTitle(getQuizTitle(customQuiz.quiz))
  }

  const handleTitleBlur = (e) => {
    const newTitle = e.target.value.trim();
    
    if (newTitle === "") {
      toast.error("Quiz title cannot be empty.");
      toggleEditingTitle(false)
      return
    }

    if (newTitle !== getQuizTitle(customQuiz.quiz)) {
      customQuiz.updateQuiz(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          title: newTitle
        },
        title: newTitle
      }))
    }
    
    toggleEditingTitle(false)
  }

  const handleTitleChange = (e) => {
    changeQuizTitle(e.target.value)
  }

  const handleConfirmationChange = (e) => {
    updateDeletionText(e.target.value)
  }

  // Handle question changes from QuizQuestionsList
  const handleQuizDataChange = (newData) => {
    setQuizDataArray(newData)
  }

  // Delete question from array
  const handleDeleteQuestion = (index) => {
    setQuizDataArray(prev => prev.filter((_, i) => i !== index))
  }

  // function handles when a user confirms they want to delete their quiz
  const handleQuizDeletion = (e) => {
    e.preventDefault()
    const currentTitle = getQuizTitle(customQuiz.quiz)

    if (quizDeletionText !== currentTitle) {
      toast.error('Deletion text does not match quiz title.')
      return 
    }

    customQuiz.deleteQuiz(quizID)
      .then(() => {
        toast.success('Quiz deleted successfully.')
        navigate('/myquizzes')
      })
      .catch((error) => {
        toast.error(error?.message || 'Failed to delete quiz.')
      })
  }

  const handleCancelQuizDeletion = () => {
    updateDeletionText("")
    toggleDeleteBtn(false)
  }

  // useEffect function runs on first render to get the quiz data from the DB and set the state in custom quiz context
  useEffect(() => {
    customQuiz.getQuiz(quizID)
  }, [quizID])

  const creatorId = customQuiz.quiz?.creator?.uid || customQuiz.quiz?.creator?.userId || customQuiz.quiz?.creatorID
  const canEditQuiz = !creatorId || creatorId === currentUser?.uid

  const handleSaveChanges = async () => {
    try {
      if (quizDataArray.length === 0) {
        toast.error('Quiz must have at least one question.')
        return
      }

      setSaving(true)

      // Build the updated quiz object synchronously from local array state
      const questionsObject = convertArrayToQuiz(quizDataArray)
      const questionCount = quizDataArray.length
      const currentQuiz = customQuiz.quiz

      const updatedQuiz = {
        ...currentQuiz,
        questions: questionsObject,
        content: {
          ...currentQuiz?.content,
          questions: questionsObject,
          totalQuestions: questionCount
        },
        metadata: {
          ...currentQuiz?.metadata,
          title: currentQuiz?.metadata?.title || currentQuiz?.title || 'Untitled Quiz',
          questionCount
        },
        numQuestions: questionCount
      }

      // Pass updatedQuiz directly so updateQuizDB never reads stale state
      await customQuiz.updateQuizDB(quizID, updatedQuiz)
      toast.success('Quiz changes saved.')
      navigate('/myquizzes')
    } catch (error) {
      toast.error(error?.message || 'Failed to save quiz changes.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen py-20 px-6 bg-primary text-primary">
      {!canEditQuiz ? (
        <div className="max-w-2xl mx-auto bg-card rounded-2xl p-8 shadow-xl border border-accent text-center">
          <h1 className="text-2xl font-bold text-gradient-primary mb-3">You cannot edit this quiz</h1>
          <p className="text-secondary mb-6">Only the creator of this quiz can make changes.</p>
          <button
            className="px-6 py-2 bg-accent hover:bg-accent-hover text-btn-primary rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg border border-accent"
            onClick={() => navigate('/myquizzes')}
          >
            Back to My Quizzes
          </button>
        </div>
      ) : (
        <>
          {deleteBtn && (
            <div className="fixed flex z-50 w-full h-full top-0 left-0 items-center justify-center backdrop-blur-lg backdrop-brightness-50">
              <form className="bg-card rounded-3xl p-8 shadow-xl border border-accent max-w-md w-full mx-4" onSubmit={handleQuizDeletion}>
                <h2 className="text-2xl font-semibold mb-4 text-center text-gradient-primary">
                  Confirm Deletion
                </h2>
                <label className="block text-base mb-4 text-secondary">
                  Type "{getQuizTitle(customQuiz.quiz)}" to confirm deletion:
                </label>
                <input 
                  type="text" 
                  placeholder={getQuizTitle(customQuiz.quiz)} 
                  className="w-full px-3 py-2 mb-6 rounded-lg bg-input text-primary border border-accent" 
                  onChange={handleConfirmationChange} 
                />
                <div className="flex gap-4">
                  <button 
                    className="flex-1 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg border border-red-600" 
                    type="submit"
                  >
                    Confirm Delete
                  </button>
                  <button 
                    className="flex-1 px-6 py-2 bg-neutral-500 hover:bg-neutral-600 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg border border-neutral-500" 
                    type="button"
                    onClick={handleCancelQuizDeletion}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
          
          <div className="max-w-6xl mx-auto">
            {/* Header section */}
            <div className="mb-8">
              <div className="bg-card rounded-2xl p-6 shadow-xl border border-accent space-y-4">
                {/* Created/Updated dates */}
                <div className="flex justify-between text-sm text-secondary">
                  <h2>Created: {getQuizCreatedAt(customQuiz.quiz)}</h2>
                  <h2>Last Edit: {getQuizUpdatedAt(customQuiz.quiz)}</h2>
                </div>

                {/* Title editing section */}
                {editingTitle ? (
                  <form className="text-center">
                    <input 
                      type="text" 
                      className="text-4xl font-bold bg-transparent text-center w-full text-gradient-primary border-b-2 border-accent focus:outline-none" 
                      value={quizTitle} 
                      autoFocus 
                      onBlur={handleTitleBlur} 
                      onChange={handleTitleChange} 
                    />
                  </form>
                ) : (
                  <h1 
                    className="text-4xl font-bold text-center hover:cursor-pointer p-3 text-gradient-primary transition-colors duration-200 hover:opacity-80" 
                    onClick={handleTitleClick}
                  >
                    {getQuizTitle(customQuiz.quiz)}
                  </h1>
                )}

                {/* Quiz stats */}
                <div className="flex justify-center gap-8 text-secondary">
                  <h2 className="text-lg">Questions: <span className="text-accent font-medium">{quizDataArray.length}</span></h2>
                  <h2 className="text-lg">Attempts: <span className="text-accent font-medium">{getQuizAttempts(customQuiz.quiz)}</span></h2>
                </div>
              </div>
            </div>

            {/* Questions section with QuizQuestionsList component */}
            <div className="mb-8">
              <QuizQuestionsList 
                quizData={quizDataArray}
                setQuizData={handleQuizDataChange}
                handleDeleteQuestion={handleDeleteQuestion}
              />
            </div>

            {/* Action buttons */}
            {customQuiz.quiz && (
              <div className="bg-card rounded-2xl p-6 shadow-xl border border-accent">
                <div className="flex gap-4 justify-center flex-wrap">
                  <button 
                    className="px-8 py-3 bg-accent hover:bg-accent-hover text-btn-primary rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg border border-accent disabled:opacity-50" 
                    onClick={handleSaveChanges}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}