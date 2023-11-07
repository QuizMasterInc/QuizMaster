import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

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

  const { quizID } = useParams()  // retrieves quiz ID from URL params 

  const deleteQuiz = (e) => {
    e.preventDefault()
    console.log("Delete Quiz button clicked")

    // call function to delete quiz from DB
    
  }

  const postQuestions = () => {
    console.log("Post Questions Function call")
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
          <h2>Correct Answer: {quiz.questions[key].correct_answer}</h2>
        </div>
      )
    })
  }

  useEffect(() => {
    // this runs on component load to call https get request for quiz object from quiz ID
    
    getQuiz(quizID)
    .then(quizData => {
      console.log("Data Recieved: ", quizData.data)
      console.log("Questions", quizData.data.questions["Question 1"].correct_answer)
      updateQuiz(quizData.data)
    })
  }, [])

  return (
    <div>
      <h1>{quiz?.title || "Loading..."}</h1>
      <h2>Number of Questions: {quiz?.numQuestions || "Loading..."}</h2>
      <h2>Number of attempts: {quiz?.quizTaken && "Loading..."}</h2>
      {
         postQuestions()
      }
      <br></br>
      <button onClick={deleteQuiz}>Delete Quiz</button>
    </div>
  )
}