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

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuiz } from '../../contexts/QuizContext'
import EditQuestion from './EditQuestion'

export default function EditCustomQuiz() {
  const [deleteBtn, toggleDeleteBtn] = useState(false)
  const [editingTitle, toggleEditingTitle] = useState(false)
  const [quizTitle, changeQuizTitle] = useState("")
  const [quizDeletionText, updateDeletionText] = useState("")

  const customQuiz = useQuiz() // quiz context to access quiz state
  const { quizID } = useParams()  // retrieves quiz ID from URL params

  // Helper functions to access new nested structure
  const getQuizTitle = (quiz) => quiz?.metadata?.title || quiz?.title || "";
  const getQuizQuestionCount = (quiz) => quiz?.metadata?.questionCount || quiz?.content?.questionCount || quiz?.numQuestions || 0;
  const getQuizAttempts = (quiz) => quiz?.analytics?.stats?.attempts || quiz?.quizTaken || 0;
  const getQuizCreatedAt = (quiz) => quiz?.timestamps?.createdAt || quiz?.createdAt || "";
  const getQuizUpdatedAt = (quiz) => quiz?.timestamps?.updatedAt || quiz?.lastEdit || ""; 

  const handleTitleClick = (e) => {
    toggleEditingTitle(!editingTitle)
    changeQuizTitle(getQuizTitle(customQuiz.quiz))
  }

  const handleTitleBlur = (e) => {
    // checks for empty string for title
    if (quizTitle == "") {
      changeQuizTitle(getQuizTitle(customQuiz.quiz))
      toggleEditingTitle(!editingTitle)
      return
    }

    // updates quiz info in context - update both old and new structure
    if (quizTitle != getQuizTitle(customQuiz.quiz)) {
      customQuiz.updateQuiz(prev => {
        return {
          ...prev,
          // Update new nested structure
          metadata: {
            ...prev.metadata,
            title: e.target.value
          },
          // Keep old structure for backward compatibility during transition
          title: e.target.value
        }
      })

      toggleEditingTitle(!editingTitle)
    }
    
  }

  const handleTitleChange = (e) => {
    changeQuizTitle(e.target.value)
  }

  const handleConfirmationChange = (e) => {
    updateDeletionText(e.target.value)
  }

  // function handles when a user confirms they want to delete their quiz
  const handleQuizDeletion = (e) => {
    e.preventDefault()
    // check for confirmation off input 
    if (quizDeletionText != customQuiz.quiz?.title) {
      // run code to display non match

      return 
    }

    // delete quiz
    customQuiz.deleteQuiz(quizID)
  }

  const handleCancelQuizDeletion = (e) => {
    updateDeletionText("")
    toggleDeleteBtn(!deleteBtn)
  }

  const postQuestions = () => {
    if (!customQuiz.quiz) {
      return (
        <div className="bg-card rounded-2xl p-6 shadow-xl border border-accent">
          <h1 className="text-xl text-center text-secondary">Loading Questions...</h1>
        </div>
      );
    }

    // Get questions from new or old structure
    const questions = customQuiz.quiz.content?.questions || customQuiz.quiz.questions;
    
    if (!questions) {
      return (
        <div className="bg-card rounded-2xl p-6 shadow-xl border border-accent">
          <h1 className="text-xl text-center text-secondary">No questions found</h1>
        </div>
      );
    }

    // Handle both array format (new) and object format (old)
    const questionArray = Array.isArray(questions) 
      ? questions 
      : Object.keys(questions).sort((a, b) => {
          const firstNum = Number(a.split(" ")[1]);
          const secondNum = Number(b.split(" ")[1]);
          return firstNum - secondNum;
        }).map(key => questions[key]);

    return questionArray.map((question, index) => (
      <EditQuestion 
        key={question.id || index} 
        num={`Question ${index + 1}`} 
        q={question}
        index={index}
      />
    ));
  }

  // useEffect function runs on first render to get the quiz data from the DB and set the state in custom quiz context
  useEffect(() => {
    customQuiz.getQuiz(quizID)
    
  }, [])

  return (
    <div className="min-h-screen py-20 px-6 bg-primary text-primary">
      {
        deleteBtn && (
          <div className="fixed flex z-50 w-full h-full top-0 left-0 items-center justify-center backdrop-blur-lg backdrop-brightness-50">
            <form className="bg-card rounded-3xl p-8 shadow-xl border border-accent max-w-md w-full mx-4" onSubmit={handleQuizDeletion}>
              <h2 className="text-2xl font-semibold mb-4 text-center text-gradient-primary">
                Confirm Deletion
              </h2>
              <label className="block text-base mb-4 text-secondary">
                Type "{customQuiz.quiz?.title}" to confirm deletion:
              </label>
              <input 
                type="text" 
                placeholder={customQuiz.quiz?.title} 
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
        )
      }
      
      <div className="max-w-6xl mx-auto">
        {/* Header with dates */}
        <div className="mb-6">
          <div className="bg-card rounded-2xl p-6 shadow-xl border border-accent">
          <div className="flex justify-between mb-4 text-sm text-secondary">
            <h2>Created: {getQuizCreatedAt(customQuiz.quiz)}</h2>
            <h2>Last Edit: {getQuizUpdatedAt(customQuiz.quiz)}</h2>
          </div>            {/* Title editing section */}
            {
              editingTitle ? (
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
                <h1 className="text-4xl font-bold text-center hover:cursor-pointer p-3 text-gradient-primary transition-colors duration-200 hover:opacity-80" onClick={handleTitleClick}>
                  {getQuizTitle(customQuiz.quiz)}
                </h1>
              )
            }

            {/* Quiz stats */}
            <div className="flex justify-center gap-8 mt-4 text-secondary">
              <h2 className="text-lg">Questions: <span className="text-accent font-medium">{getQuizQuestionCount(customQuiz.quiz)}</span></h2>
              <h2 className="text-lg">Attempts: <span className="text-accent font-medium">{getQuizAttempts(customQuiz.quiz)}</span></h2>
            </div>
          </div>
        </div>

        {/* Questions section */}
        <div className="space-y-6 mb-8">
          {postQuestions()}
        </div>

        {/* Action buttons */}
        {
          customQuiz.quiz && (
            <div className="bg-card rounded-2xl p-6 shadow-xl border border-accent">
              <div className="flex gap-4 justify-center">
                <button 
                  className="px-8 py-3 bg-accent hover:bg-accent-hover text-btn-primary rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg border border-accent" 
                  onClick={() => customQuiz.updateQuizDB(quizID)}
                >
                  Save Changes
                </button>
                <button 
                  className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg border border-red-600" 
                  onClick={() => toggleDeleteBtn(!deleteBtn)}
                >
                  Delete Quiz
                </button>
              </div>
            </div>
          )
        }
      </div>
    </div>
  )
}