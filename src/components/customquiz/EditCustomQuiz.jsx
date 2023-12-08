import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useCustomQuizContext } from '../../contexts/CustomQuizContext'
import EditQuestion from './EditQuestion'

export default function EditCustomQuiz() {
  const [deleteBtn, toggleDeleteBtn] = useState(false)
  const [editingTitle, toggleEditingTitle] = useState(false)
  const [quizTitle, changeQuizTitle] = useState("")

  const customQuiz = useCustomQuizContext()
  const { quizID } = useParams()  // retrieves quiz ID from URL params 

  const handleTitleClick = (e) => {
    toggleEditingTitle(!editingTitle)
    changeQuizTitle(customQuiz.quiz?.title)
  }

  const handleTitleBlur = (e) => {
    // checks for empty string for title
    if (quizTitle == "") {
      changeQuizTitle(customQuiz.quiz.title)
      toggleEditingTitle(!editingTitle)
      return
    }

    // updates quiz info in context
    if (quizTitle != customQuiz.quiz.title) {
      customQuiz.updateQuiz(prev => {
        return {
          ...prev,
          title: e.target.value
        }
      })

      toggleEditingTitle(!editingTitle)
    }
    
  }

  const handleTitleChange = (e) => {
    changeQuizTitle(e.target.value)
  }

  const postQuestions = () => {
    // checks for quiz.. otherwise shows loading
    if (!customQuiz.quiz) {
      return (
        <h1>Loading Questions...</h1>
      )
    }

    // map over Object keys for questions
    // - sorts in ascending order
    // - maps with the key as the index 
    return Object.keys(customQuiz.quiz.questions).sort((a, b) => {
      // splits object key for each question to get just the question number and casts the string to and int
      const firstNum = Number(a.split(" ")[1])
      const secondNum = Number(b.split(" ")[1])
      
      // returns to sort in ascending order
      if (firstNum < secondNum) return -1
      if (firstNum > secondNum) return 1
      
      return 0
    }).map((key, index) => {
      return (
        <EditQuestion key={index} num={key} q={customQuiz.quiz.questions[key]}/>
      )
    })
  }

  useEffect(() => {
    // effect runs when quiz state changes
    customQuiz.getQuiz(quizID)
    
  }, [])

  return (
    <main class="text-xl text-white mt-20 p-6">
      <div class="flex justify-between mb-12">
        <h1 class="text-s">Created: {customQuiz.quiz?.createdAt || ""}</h1>
        <h1 class="text-s">Last Edit: {customQuiz.quiz?.lastEdit || ""}</h1>
      </div>

      {
        editingTitle
        ?
        <form>
          <input type="text" class="text-white text-4xl bg-inherit h-12 p-3 text-center" value={quizTitle} autoFocus onBlur={handleTitleBlur} onChange={handleTitleChange} />
        </form>
        :
        <h1 class="text-4xl hover:cursor-pointer p-3" onClick={handleTitleClick}>{customQuiz.quiz?.title || ""}</h1>
      }

      <div class="flex justify-around">
        <h2>Number of Questions: {customQuiz.quiz?.numQuestions || "Loading..."}</h2>
        <h2>Number of attempts: {customQuiz.quiz?.quizTaken && "Loading..."}</h2>
      </div>

      <div>
        {
          postQuestions()
        }
      </div>

      <br></br>
      <div>
        {
          customQuiz.quiz ? <button class="border-2 rounded-sm bg-red-500 p-2" onClick={() => toggleDeleteBtn(!deleteBtn)}>Delete Quiz</button> : <></>
        }
        {
          deleteBtn ? <div class="">
            <h2 class="text-white">Delete Button Clicked</h2>
          </div> : <></>
        }
      </div>
    </main>
  )
}