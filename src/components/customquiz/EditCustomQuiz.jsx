import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useCustomQuizContext } from '../../contexts/CustomQuizContext'
import EditQuestion from './EditQuestion'

export default function EditCustomQuiz() {

  let titleRef = useRef()
  const customQuiz = useCustomQuizContext()
  const { quizID } = useParams()  // retrieves quiz ID from URL params 


  // function called when input field
  // for title is changed
  // - updates state to display properly 
  const handleTitleChange = (e) => {
    customQuiz.updateQuiz((prevState) => {
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
    if (titleRef == e.target.value) return

    // checks to make sure title is not empty 
    // if empty it resorts state back to default
    if (e.target.value == "") {
      customQuiz.updateQuiz((prev) => { return {...prev, title: titleRef.current}})
    }
    
    // call api to update title
  }

  const deleteButtonClick = (e) => {
    e.preventDefault()
    // ask the user to confirm deletion


    // call delete api
    customQuiz.deleteQuiz(quizID)
  }

  const postQuestions = () => {
    if (!customQuiz.quiz) {
      return (
        <h1>Loading Questions...</h1>
      )
    }

    return Object.keys(customQuiz.quiz.questions).map((key, index) => {
      return (
        // <div key={index}>
        //   <br></br>
        //   <h1>{key}</h1>
        //   <h2>{quiz.questions[key].question}</h2>
        //   <h2>A: {quiz.questions[key].option_1}</h2>
        //   <h2>B: {quiz.questions[key].option_2}</h2>
        //   <h2>C: {quiz.questions[key].option_3}</h2>
        //   <h4>D: {quiz.questions[key].option_4}</h4>
        //   <br></br>
        //   <h2>Correct Answer: {quiz.questions[key].correct_answer}</h2>
        // </div>
        <EditQuestion key={index} num={key} q={customQuiz.quiz.questions[key]}/>
      )
    })
  }

  useEffect(() => {
    // effect runs when quiz state changes

    // getQuiz(quizID)
    // .then(quizData => {
    //   console.log(quizData.data)
    //   updateQuiz(quizData.data)
    //   titleRef.current = quizData.data.title
    // })
    customQuiz.getQuiz(quizID)
  }, [])

  return (
    <main class="text-xl text-white border-2 mt-20 p-6">
      <div class="flex justify-between">
        <h1>Created: {customQuiz.quiz?.createdAt && ""}</h1>
        <h1>Last Edit: {customQuiz.quiz?.lastEdit && ""}</h1>
      </div>

      <form>
        <input type="text" class="text-white text-3xl bg-inherit p-3 underline text-center" value={customQuiz.quiz?.title || ""} onChange={handleTitleChange} onBlur={titleBlur}/>
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
      {
        customQuiz.quiz ? <button class="border-2 rounded-sm bg-red-500 p-2" onClick={deleteButtonClick}>Delete Quiz</button> : <></>
      }
    </main>
  )
}