import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useCustomQuizContext } from '../../contexts/CustomQuizContext'
import EditQuestion from './EditQuestion'

export default function EditCustomQuiz() {
  const [deleteBtn, toggleDeleteBtn] = useState(false)

  const customQuiz = useCustomQuizContext()
  const { quizID } = useParams()  // retrieves quiz ID from URL params 


  // function called when input field
  // for title is changed
  // - updates state to display properly 
  const handleTitleChange = (e) => {
    customQuiz.updateEditedQuiz((prevState) => {
      return {
        ...prevState,
        title: e.target.value
      }
    })
  }

  // function called when title input field un-focuses
  // do some checks to maintain effeciency
  // - used to update db
  const titleBlur = (e) => {
    // checks if changed title is equal to old title
    // just returns if true
    if (customQuiz.updateEditedQuiz.title == e.target.value) return

    // checks to make sure title is not empty 
    // if empty it resorts state back to default
    if (e.target.value == "") {
      customQuiz.updateeditedQuiz((prev) => { return {...prev, title: titleRef.current}})
    }
    
    // call api to update title
  }

  const postQuestions = () => {
    if (!customQuiz.quiz) {
      return (
        <h1>Loading Questions...</h1>
      )
    }

    return Object.keys(customQuiz.quiz.questions).sort((a, b) => {
      const firstNum = Number(a.split(" ")[1])
      const secondNum = Number(b.split(" ")[1])
      
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

      <form>
        <input type="text" class="text-white text-4xl bg-inherit h-12 p-3 text-center" value={customQuiz.quiz?.title || ""} onChange={handleTitleChange} onBlur={titleBlur}/>
      </form>

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