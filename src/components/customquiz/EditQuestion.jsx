/* 
This component is for each question provided via a custom quiz.
- Component provides state for each input field that allows editing the question data.

- COMPONENT PARAMS ({num, q})}
    - num: string 
        # Always comes in as a string in the format "Question (whatver the question number is)"
        Ex: "Question 5"
        # this is also the key used to access the questions data from the custom quiz context provider 
            - customQuizData: customQuizContextProvider()
            # use "num" as the key to access questions in the quiz object provided via the custom quiz context. NECESSARY FOR HANDLING CHANGING A QUESTIONS NUMBER ORDER.
            Ex: customQuizData.quiz.questions[num]

    - q: object
        # q is the question object passed to the component so the data can be displayed and used for editing
        - Currently every question contains:
            - The Question
            - Answer A
            - Answer B
            - Answer C
            - Answer D
            - The Correct Answer
    
This component is what allows the editing capability of each individual question in a custom quiz. 
*/

import { useState, useEffect } from 'react'
import { useCustomQuizContext } from '../../contexts/CustomQuizContext'

function EditQuestion({num, q}) {
    const [editingQuestion, toggleEditing] = useState(false)
    const [question, editQuestion] = useState(q.question)
    const [questionNum, changeQuestionNum] = useState(num.split(" ")[1])
    const [answer_A, editAnswer_A] = useState(q.option_1) 
    const [answer_B, editAnswer_B] = useState(q.option_2)
    const [answer_C, editAnswer_C] = useState(q.option_3)
    const [answer_D, editAnswer_D] = useState(q.option_4)
    const [correctAnswer, changeCorrectAnswer] = useState(q.correct_answer)

    const customQuizData = useCustomQuizContext() // custom quiz context object

    // Following functions handle onChange handlers for all input fields
    const questionChange = (e) => {
        editQuestion(e.target.value)
    }

    const questionNumChange = (e) => {
        changeQuestionNum(e.target.value)
    }

    const changeAnswer_A = (e) => {
        editAnswer_A(e.target.value)
    }

    const changeAnswer_B = (e) => {
        editAnswer_B(e.target.value)
    }

    const changeAnswer_C = (e) => {
        editAnswer_C(e.target.value)
    }

    const changeAnswer_D = (e) => {
        editAnswer_D(e.target.value)
    }

    const changeCorrect_AnswerHandler = (e) => {
        changeCorrectAnswer(e.target.value)
    }

    // following functions handle onBlur handlers for all inputs to check for empty strings
    // onBlur is called when an input field is un focused 
    const questionBlur = (e) => {
        if (question == "") {
            editQuestion(q.question)
        }
    }

    const answer_A_Blur = (e) => {
        if (answer_A == "") {
            editAnswer_A(q.option_1)
        }
    }

    const answer_B_Blur = (e) => {
        if (answer_B == "") {
            editAnswer_B(q.option_2)
        }
    }

    const answer_C_Blur = (e) => {
        if (answer_C == "") {
            editAnswer_C(q.option_3)
        }
    }

    const answer_D_Blur = (e) => {
        if (answer_D == "") {
            editAnswer_D(q.option_4)
        }
    }

    // button click handles updating the quiz in the custom quiz context as needed based on the edited data in each question
    const handleFinishClick = (e) => {
        toggleEditing(!editingQuestion)

        // checks to see if data has been changed 
        if (customQuizData.quiz.questions[num].question == question && customQuizData.quiz.questions[num].option_1 == answer_A && customQuizData.quiz.questions[num].option_2 == answer_B && customQuizData.quiz.questions[num].option_3 == answer_C && customQuizData.quiz.questions[num].option_4 == answer_D && customQuizData.quiz.questions[num].correct_answer == correctAnswer &&
        num.split(" ")[1] == questionNum) return 

        // update quiz data in custom quiz context
        // - first checks to see if the order of questions has changed
        if (num.split(" ")[1] != questionNum) {
            const newMap = {}
            // check if question is moved downward
            // - creates new map of questions with updated question data
            if (num.split(" ")[1] > questionNum) {
                var counter = 1
                while (counter != questionNum) {
                    newMap[`Question ${counter}`] = customQuizData.quiz.questions[`Question ${counter}`]
                    counter++
                }

                let obj_1 = customQuizData.quiz.questions[`Question ${questionNum}`]
                newMap[`Question ${counter}`] = customQuizData.quiz.questions[num]
                counter++
                let obj_2 = customQuizData.quiz.questions[`Question ${counter}`]

                while (counter <= num.split(" ")[1]) {
                    newMap[`Question ${counter}`] = obj_1
                    obj_1 = obj_2
                    counter++
                    obj_2 = customQuizData.quiz.questions[`Question ${counter}`]
                }

                while (customQuizData.quiz.questions[`Question ${counter}`]) {
                    newMap[`Question ${counter}`] = customQuizData.quiz.questions[`Question ${counter}`]
                    counter++
                }
            }
            else {
                // question was moved upwards
                var counter = 1
                while (counter < num.split(" ")[1]) {
                    newMap[`Question ${counter}`] = customQuizData.quiz.questions[`Question ${counter}`]
                    counter++
                }

                let hold = customQuizData.quiz.questions[`Question ${questionNum}`]
                newMap[`Question ${questionNum}`] = customQuizData.quiz.questions[num]

                while (counter != questionNum - 1) {
                    newMap[`Question ${counter}`] = customQuizData.quiz.questions[`Question ${counter + 1}`]
                    counter++
                }

                newMap[`Question ${counter}`] = hold
                counter += 2

                while (customQuizData.quiz.questions[`Question ${counter}`]) {
                    newMap[`Question ${counter}`] = customQuizData.quiz.questions[`Question ${counter}`]
                    counter++
                }
            }

            // checks for changed data and updates map
            if (customQuizData.quiz.questions[num].question != question) {
                newMap[`Question ${questionNum}`].question = question
            }
            if (customQuizData.quiz.questions[num].option_1 != answer_A) {
                newMap[`Question ${questionNum}`].option_1 = answer_A
            }
            if (customQuizData.quiz.questions[num].option_2 != answer_B) {
                newMap[`Question ${questionNum}`].option_2 = answer_B
            }
            if (customQuizData.quiz.questions[num].option_3 != answer_C) {
                newMap[`Question ${questionNum}`].option_3 = answer_C
            }
            if (customQuizData.quiz.questions[num].option_4 != answer_D) {
                newMap[`Question ${questionNum}`].option_4 = answer_D
            }
            if (customQuizData.quiz.questions[num].correct_answer != correctAnswer) {
                newMap[`Question ${questionNum}`].correct_answer = correctAnswer
            }

            // updates the custom quiz context state
            customQuizData.updateQuiz(prev => {
                return {
                  ...prev,
                  questions: newMap
                }
              })
        }
        else {
            // updates custom quiz context state when no question has changed the order
            const newMap = customQuizData.quiz.questions 

            if (customQuizData.quiz.questions[num].question != question) {
                newMap[num].question = question
            }
            if (customQuizData.quiz.questions[num].option_1 != answer_A) {
                newMap[num].option_1 = answer_A
            }
            if (customQuizData.quiz.questions[num].option_2 != answer_B) {
                newMap[num].option_2 = answer_B
            }
            if (customQuizData.quiz.questions[num].option_3 != answer_C) {
                newMap[num].option_3 = answer_C
            }
            if (customQuizData.quiz.questions[num].option_4 != answer_D) {
                newMap[num].option_4 = answer_D
            }
            if (customQuizData.quiz.questions[num].correct_answer != correctAnswer) {
                newMap[num].correct_answer = correctAnswer
            }

            // updates custom quiz context state
            customQuizData.updateQuiz(prev => {
                return {
                  ...prev,
                  questions: newMap
                }
              })
        }
    }

    // useEffect to provide listerner on when custom quiz state changes in context
    // - NECESSARY to update all the question components with the changed data
    useEffect(() => {
        // calls state change functions on all changabale data for the edited question
        editAnswer_A(q.option_1)
        editAnswer_B(q.option_2)
        editAnswer_C(q.option_3)
        editAnswer_D(q.option_4)
        editQuestion(q.question)
        changeCorrectAnswer(q.correct_answer)
        changeQuestionNum(num.split(" ")[1])
    }, [customQuizData.quiz])

    return (
        <div class="flex flex-col bg-gray-900 rounded-3xl shadow-lg -md:pl-2 -md:pr-2 -md:pb-2 m-5 p-4 items-center">
            {
                editingQuestion 
                ? 
                <form class="flex w-10/12">
                    <input type="number" min="1" max={customQuizData.quiz.numQuestions} onChange={questionNumChange} value={questionNum} class="bg-inherit text-black w-9 p-0 bg-slate-500 focus:bg-slate-300 mr-1 rounded" />
                    <textarea value={question} onChange={questionChange} onBlur={questionBlur} class="bg-slate-400 focus:bg-slate-300 text-black w-full p-2 rounded" />
                </form>
                :
                <div class="flex">
                    <h1>{num.split(" ")[1]}</h1>
                    <h1>. &nbsp;&nbsp;</h1>
                    <h1>{q.question}</h1>
                </div>
            }

            <div class="mt-3 p-2 flex flex-col items-start w-10/12">
                {
                    editingQuestion
                    ?
                    <form class="flex justify-center w-full mb-4">
                        <label class="mr-3" >A&nbsp;:</label>
                        <textarea value={answer_A} onChange={changeAnswer_A} onBlur={answer_A_Blur} class="bg-slate-400 focus:bg-slate-300 w-full rounded p-1 text-black" />
                    </form>
                    :
                    <div class="flex w-full mb-3">
                        <h2>A&nbsp;: &nbsp;</h2>
                        <h2 class="bg-slate-400 w-full flex items-start ml-2 pl-2 rounded">{q.option_1}</h2>
                    </div>
                }
                {
                    editingQuestion
                    ?
                    <form class="flex justify-center w-full mb-4">
                        <label class="mr-3" >B&nbsp;:</label>
                        <textarea value={answer_B} onChange={changeAnswer_B} onBlur={answer_B_Blur} class="bg-slate-400 focus:bg-slate-300 w-full rounded p-1 text-black" />
                    </form>
                    :
                    <div class="flex w-full mb-3">
                        <h2>B&nbsp;: &nbsp;</h2>
                        <h2 class="bg-slate-400 w-full flex items-start ml-2 pl-2 rounded">{q.option_2}</h2>
                    </div>
                }
                {
                    editingQuestion
                    ?
                    <form class="flex justify-center w-full mb-4">
                        <label class="mr-3" >C&nbsp;:</label>
                        <textarea value={answer_C} onChange={changeAnswer_C} onBlur={answer_C_Blur} class="bg-slate-400 focus:bg-slate-300 w-full rounded p-1 text-black" />
                    </form>
                    :
                    <div class="flex w-full mb-3">
                        <h2>C&nbsp;: &nbsp;</h2>
                        <h2 class="bg-slate-400 w-full flex items-start ml-2 pl-2 rounded">{q.option_3}</h2>
                    </div>
                }
                {
                    editingQuestion
                    ?
                    <form class="flex justify-center w-full mb-3">
                        <label class="mr-3" >D&nbsp;:</label>
                        <textarea value={answer_D} onChange={changeAnswer_D} onBlur={answer_D_Blur} class="bg-slate-400 focus:bg-slate-300 w-full rounded p-1 text-black" />
                    </form>
                    :
                    <div class="flex w-full mb-3">
                        <h2>D&nbsp;: &nbsp;</h2>
                        <h2 class="bg-slate-400 w-full flex items-start ml-2 pl-2 rounded">{q.option_4}</h2>
                    </div>
                }
                <span class="bg-slate-400 w-full h-0.5"></span>

                {
                    editingQuestion
                    ?
                    <form class="w-full mb-4 mt-1">
                        <label class="mr-2">Correct Answer:</label>
                        <select onChange={changeCorrect_AnswerHandler} class= "text-black" name="correct_answer">
                            <option value="">--Select the correct answer--</option>
                            <option value={answer_A}>{answer_A}</option>
                            <option value={answer_B}>{answer_B}</option>
                            <option value={answer_C}>{answer_C}</option>
                            <option value={answer_D}>{answer_D}</option>
                        </select>
                    </form>
                    :
                    <h1 class="mt-1 mb-2">Correct Answer: {q.correct_answer}</h1>
                }

                <div class="w-full">
                {
                    editingQuestion
                    ?
                    <>
                        <button onClick={handleFinishClick} class="border rounded p-2 mr-4">Finish</button>
                        <button class="border rounded p-2 bg-red-600">Delete Question</button>
                    </>
                    :
                    <>   
                        <button onClick={() => toggleEditing(!editingQuestion)} class="border rounded p-2">Edit Question</button>
                    </>
                }
                </div>
            </div>
        </div>
    )
}

export default EditQuestion