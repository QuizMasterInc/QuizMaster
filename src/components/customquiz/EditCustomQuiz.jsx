import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigate } from "react-router-dom"

const getQuiz = async (uid) => {
      //http://127.0.0.1:6001/quizmaster-c66a2/us-central1/grabCustomQuiz
      // https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabCustomQuiz
      return await fetch('https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabCustomQuiz?quizid=' + uid)
        .then((res) => res.json())
        .catch((err) => {
          console.log("Respone Error: ", err.message);
        })
}

export default function EditCustomQuiz() {
  const [quiz, updateQuiz] = useState(null)

  let titleRef = useRef()

  const { quizID } = useParams()  // retrieves quiz ID from URL params 
  const navigate = useNavigate()

  const deleteQuiz = async (e) => {
    e.preventDefault()
    console.log("Delete Quiz button clicked")
    // call function to delete quiz from DB
    // https://us-central1-quizmaster-c66a2.cloudfunctions.net/deleteCustomQuiz

    await fetch("https://us-central1-quizmaster-c66a2.cloudfunctions.net/deleteCustomQuiz?quizid=" + quizID)
    .then((res) => res.json())
    .then((response) => {
      console.log("Deletion Response: ", response)
      navigate("/home")
    })
    .catch((error) => {
      console.log("Delete Error: ", error.message)
    })
  }

  // function called when input field
  // for title is changed
  // - updates state to display properly 
  const handleTitleChange = (e) => {
    updateQuiz((prevState) => {
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
      updateQuiz((prev) => { return {...prev, title: titleRef.current}})
    }
    
    // call api to update title
  }

  const postQuestions = () => {
    if (!quiz) {
      return (
        <h1>Loading Questions...</h1>
      )
    }

    return Object.keys(quiz.questions).map((key, index) => {
      return (
        <div key={index}>
          <br></br>
          <h1>{key}</h1>
          <h2>{quiz.questions[key].question}</h2>
          <h2>A: {quiz.questions[key].option_1}</h2>
          <h2>B: {quiz.questions[key].option_2}</h2>
          <h2>C: {quiz.questions[key].option_3}</h2>
          <h4>D: {quiz.questions[key].option_4}</h4>
          <br></br>
          <h2>Correct Answer: {quiz.questions[key].correct_answer}</h2>
        </div>
      )
    })
  }

  useEffect(() => {
    // effect runs when quiz state changes

    getQuiz(quizID)
    .then(quizData => {
      updateQuiz(quizData.data)
      titleRef.current = quizData.data.title
    })
  }, [])

  return (
    <main class="text-xl text-white border-2 mt-20 p-6">
      <div class="flex justify-between">
        <h1>Created: 05/08/1999</h1>
        <h1>Last Edit: 11/13/2023</h1>
      </div>

      <form>
        <input type="text" class="text-white text-3xl bg-inherit p-3 underline" value={quiz?.title || ""} onChange={handleTitleChange} onBlur={titleBlur}/>
      </form>

      <div class="flex justify-around">
        <h2>Number of Questions: {quiz?.numQuestions || "Loading..."}</h2>
        <h2>Number of attempts: {quiz?.quizTaken && "Loading..."}</h2>
      </div>

      <div>
        {
          postQuestions()
        }
      </div>

      <br></br>
      {
        quiz ? <button class="border-2 rounded-sm bg-red-500 p-2" onClick={deleteQuiz}>Delete Quiz</button> : <></>
      }
    </main>
  )
}