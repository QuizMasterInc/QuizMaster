import { useState, useRef } from 'react'

function EditQuestion({num, q}) {
    const [editingQuestion, toggleEditing] = useState(false)

    const displayQuestionNum = () => {
        let questionDisplayNum = num[9]
        
        let counter = 10
        while (true) {
            if (num[counter]) {
                questionDisplayNum += num[10]
                counter++
            }
            else {
                break
            }
        }

        return questionDisplayNum
    }

    return (
        <div class="flex flex-col bg-gray-900 rounded-lg shadow-lg -md:pl-2 -md:pr-2 -md:pb-2 m-5 p-4 items-center">
            {
                editingQuestion 
                ? 
                <form class="flex w-10/12">
                    <input type="number" value={displayQuestionNum()} class="bg-inherit text-black w-7 p-0 bg-slate-500 focus:bg-slate-300 mr-1 rounded" />
                    <textarea value={q.question} class="bg-slate-400 focus:bg-slate-300 text-black w-full p-2 rounded" />
                </form>
                :
                <div class="flex">
                    <h1>{displayQuestionNum()}</h1>
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
                        <textarea value={q.option_1} class="bg-slate-400 focus:bg-slate-300 w-full rounded p-1" />
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
                        <textarea value={q.option_2} class="bg-slate-400 focus:bg-slate-300 w-full rounded p-1" />
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
                        <textarea value={q.option_3} class="bg-slate-400 focus:bg-slate-300 w-full rounded p-1" />
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
                        <textarea value={q.option_4} class="bg-slate-400 focus:bg-slate-300 w-full rounded p-1" />
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