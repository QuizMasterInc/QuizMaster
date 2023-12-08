import { useState, useRef } from 'react'
import { useCustomQuizContext } from '../../contexts/CustomQuizContext'

function EditQuestion({num, q}) {
    const [editingQuestion, toggleEditing] = useState(false)
    const [question, editQuestion] = useState(q.question)
    const [questionNum, changeQuestionNum] = useState(num.split(" ")[1])
    const [answer_A, editAnswer_A] = useState(q.option_1) 
    const [answer_B, editAnswer_B] = useState(q.option_2)
    const [answer_C, editAnswer_C] = useState(q.option_3)
    const [answer_D, editAnswer_D] = useState(q.option_4)

    const customQuizData = useCustomQuizContext()

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

    return (
        <div class="flex flex-col bg-gray-900 rounded-3xl shadow-lg -md:pl-2 -md:pr-2 -md:pb-2 m-5 p-4 items-center">
            {
                editingQuestion 
                ? 
                <form class="flex w-10/12">
                    <input type="number" min="1" max={customQuizData.quiz.numQuestions} onChange={questionNumChange} value={questionNum} class="bg-inherit text-black w-7 p-0 bg-slate-500 focus:bg-slate-300 mr-1 rounded" />
                    <textarea value={question} onChange={questionChange} class="bg-slate-400 focus:bg-slate-300 text-black w-full p-2 rounded" />
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
                        <textarea value={answer_A} onChange={changeAnswer_A} class="bg-slate-400 focus:bg-slate-300 w-full rounded p-1" />
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
                        <textarea value={answer_B} onChange={changeAnswer_B} class="bg-slate-400 focus:bg-slate-300 w-full rounded p-1" />
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
                        <textarea value={answer_C} onChange={changeAnswer_C} class="bg-slate-400 focus:bg-slate-300 w-full rounded p-1" />
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
                        <textarea value={answer_D} onChange={changeAnswer_D} class="bg-slate-400 focus:bg-slate-300 w-full rounded p-1" />
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
                        <label>Correct Answer</label>
                    </form>
                    :
                    <h1 class="mt-1 mb-2">Correct Answer: {q.correct_answer}</h1>
                }

                <div class="w-full">
                {
                    editingQuestion
                    ?
                    <>
                        <button onClick={() => toggleEditing(!editingQuestion)} class="border rounded p-2 mr-4">Finish</button>
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