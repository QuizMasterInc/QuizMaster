import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

export default function EditCustomQuiz() {
  const [quiz, setQuiz] = useState({})

  const { quizID } = useParams()  // retrieves quiz ID from URL params 

  useEffect(() => {
    // this runs on component load to call https get request for quiz object from quiz ID

  }, [])

  return (
    <div>
      <h1>New Quiz</h1>
      <h1>ID: {quizID}</h1>
    </div>
  )
}