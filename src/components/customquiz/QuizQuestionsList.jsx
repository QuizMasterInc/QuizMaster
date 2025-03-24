//This file handles the users custom quiz questions
import { React, useState} from 'react'


export default function QuizQuestionsList ({quizData, setQuizData, handleDeleteQuestion}) {

	const [editQuestionChoice, setEditQuestionChoice] = useState(false);
	const [doneEditingQuestion, setDoneEditingQuestion] = useState(true);
	const [editingQuestionindex, setEditingQuestionIndex] = useState(-1);


	// 	this function changes the state of editQuestionChoice to true if a user wants to edit a question
	function editQuestionSelection() {
		setEditQuestionChoice((prevEditChoice) => {
			let newEditChoice = prevEditChoice
			newEditChoice = true
			return newEditChoice
		})
		setDoneEditingQuestion((prevDoneEditingChoice) => {
			let newDoneEditingChoice = prevDoneEditingChoice
			newDoneEditingChoice = false
			return newDoneEditingChoice
		})
		console.log("editing question: " + editingQuestionindex)
		console.log("edit question:" + editQuestionChoice)
		console.log("done editing question:" + doneEditingQuestion)
	}

  function editingQuestionIndex(index) {
    setEditingQuestionIndex((prevIndex) => {
			let newIndex = prevIndex
			newIndex = index
			return newIndex
		});
  }

  function editQuestion(index) {
    editQuestionSelection()
    editingQuestionIndex(index)
  }



	  const doneEditing = () => {
		setEditQuestionChoice((prevEditChoice) => {
			let newEditChoice = prevEditChoice
			newEditChoice = false
			return newEditChoice
		})
		setDoneEditingQuestion((prevDoneEditingChoice) => {
			let newDoneEditingChoice = prevDoneEditingChoice
			newDoneEditingChoice = true
			return newDoneEditingChoice
		})
		setEditingQuestionIndex((prevIndex) => {
			let newIndex = prevIndex
			newIndex = -1
			return newIndex
		});
		console.log("editQuestionChoice: " + editQuestionChoice)
		console.log("doneEditingQuestion: " + doneEditingQuestion)
	  }


	  //This function updates the information for each individual question
	  const handleQuestionChange = (e, index, questionIndex) => {
		setQuizData((prevQuizData) => {
			let newQuizData = [... prevQuizData]
			newQuizData[index][questionIndex] = e.target.value
			return newQuizData
		});
	};
    
    const verifyQuestionChange = (quizData, index)  => {
      for (let i = 0; i < 6 ; i++) {
        if (quizData[index][i] === "") {
          alert("Please fill out all changes")
        } else {
          doneEditing()
        }
      }
    }
		
return(
  <div className='w-full' id="questionsList">
    {quizData.map((quiz, index) => (
      <div key={index} className='flex flex-col pb-4 mb-4 mt-10 bg-gray-900 rounded-lg shadow-lg -md:pl-2 -md:pr-2 -md:pb-2'>
        {editQuestionChoice && index === editingQuestionindex ?  ( 
          <div className='flex flex-col pt-4 pb-4 pl-2 pr-6 text-xl text-gray-300 align-middle space-x-3 -md:text-sm -md:space-x-2S'>
            <div className='flex flex-row mb-6'>
              <p className='ml-2'>{index + 1 + "."}</p>
              <input
                id="question"
                type="text"
                placeholder="Enter your question"
                value={quizData[index][0]}
                onChange={(e) => handleQuestionChange(e, index, 0)}
                className='text-2xl mb-4 ml-4 text-black bg-gray-300 rounded-md w-full h-12 focus:scale-105 duration-300'
              />
            </div>
        
            {[0, 1, 2, 3].map((optionIndex) => (
            <div key={optionIndex}>
              <input
                id= {optionIndex + 1}
                type="text"
                placeholder={`Option ${optionIndex + 1}`}
                value={quizData[index][optionIndex + 1]}
                onChange={(e) => handleQuestionChange(e, index, optionIndex + 1)}
                className='text-2xl text-black mb-4 bg-gray-300 rounded-md w-full h-10 focus:scale-110 duration-300'
              />
            </div>
            ))}
            <div name="correctChoiceSection" className='w-full'>
              <h1 className='font-bold text-gray-300 text-2xl mb-8'>Select The Correct Answer!</h1>
              <select 
                name="correctChoice"
                id="correct-choice"
                placeholder='Select the correct answer'
                className='w-full text-black bg-gray-300 h-10 mb-10 focus:scale-110 duration-300'
                onChange={(e) => handleQuestionChange(e, index, 5)}
                value={quizData[index][5]}
              >
                <option value="">
                  Select the correct answer
                </option>
              {[1, 2, 3, 4].map((optionIndex) => (
                <option value={quizData[index][optionIndex]} key={optionIndex}>
                {quizData[index][optionIndex + 1] ? quizData[index][optionIndex] : "Please type an answer for this option"}
                </option>
              ))}
              </select>
            </div>
            <button onClick={doneEditing} className='p-2 mb-3 ml-2 mr-2 text-gray-300 bg-gray-800 rounded-md shadow-md -md:text-sm hover:bg-gray-600'>Done Editing</button>
            <button onClick={() => handleDeleteQuestion(index)} className='p-2 mb-3 ml-2 mr-2 text-gray-300 bg-gray-800 rounded-md shadow-md -md:text-sm hover:bg-gray-600'>Delete Question</button>
          </div>
        ) : (
          <div className='flex flex-col pt-4 pb-4 pl-2 pr-6 text-xl text-gray-300 align-middle space-x-3 -md:text-sm -md:space-x-2S'>
            <div className='flex flex-row mb-6'>
              <p className='ml-2'>{index + 1 + "."}</p>
              <p className='ml-4'>{quizData[index]}</p>
            </div>
            
            <div className='p-2 mb-3 ml-2 mr-2 text-gray-300 bg-gray-800 rounded-md shadow-md -md:text-sm hover:bg-gray-600'>{quizData[index][1]}</div>
            <div className='p-2 mb-3 ml-2 mr-2 text-gray-300 bg-gray-800 rounded-md shadow-md -md:text-sm hover:bg-gray-600'>{quizData[index][2]}</div>
            <div className='p-2 mb-3 ml-2 mr-2 text-gray-300 bg-gray-800 rounded-md shadow-md -md:text-sm hover:bg-gray-600'>{quizData[index][3]}</div>
            <div className='p-2 mb-3 ml-2 mr-2 text-gray-300 bg-gray-800 rounded-md shadow-md -md:text-sm hover:bg-gray-600'>{quizData[index][4]}</div>
            <p className='text-2xl mb-4 text-gray-300 align-middle -md:text-sm'>Correct Answer</p>
            <div className='p-2 mb-10 ml-2 mr-2 text-gray-300 bg-gray-800 rounded-md shadow-md -md:text-sm hover:bg-gray-600'>{quizData[index][5]}</div>
            <button onClick={() => editQuestion(index)} className='p-2 mb-3 ml-2 mr-2 text-gray-300 bg-gray-800 rounded-md shadow-md -md:text-sm hover:bg-gray-600'>Edit Question</button>
            <button onClick={() => handleDeleteQuestion(index)} className='p-2 mb-3 ml-2 mr-2 text-gray-300 bg-gray-800 rounded-md shadow-md -md:text-sm hover:bg-gray-600'>Delete Question</button>
          </div>
        )}
      </div>
    ))}
  </div>
  )
}