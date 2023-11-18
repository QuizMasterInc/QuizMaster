import { useState } from 'react'

function EditQuestion({num, q}) {
    const [question, updateQuestion] = useState(q)
    
    return (
        <div>
            <h1>{num}</h1>
            <h2>{question.question}</h2>
            <h2>Option 1: {question.option_1}</h2>
            <h2>Option 2: {question.option_2}</h2>
            <h2>Option 3: {question.option_3}</h2>
            <h2>Option 4: {question.option_4}</h2>
            <h1>Correct Answer: {question.correct_answer}</h1>
            <br></br>
        </div>
    )
}

export default EditQuestion