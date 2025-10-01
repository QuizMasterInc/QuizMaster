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
  <div className="w-full space-y-6" id="questionsList">
    {quizData.length === 0 ? (
      <div className="bg-card rounded-2xl p-8 shadow-xl border border-accent text-center">
        <h3 className="text-xl text-secondary">No questions added yet</h3>
        <p className="text-secondary mt-2">Add your first question using the form above</p>
      </div>
    ) : (
      <>
        <div className="bg-card rounded-2xl p-6 shadow-xl border border-accent">
          <h2 className="text-2xl font-semibold text-center text-gradient-primary mb-4">
            Quiz Questions ({quizData.length})
          </h2>
        </div>
        
        {quizData.map((quiz, index) => (
          <div key={index} className="bg-card rounded-3xl p-8 shadow-xl border border-accent">
            {editQuestionChoice && index === editingQuestionindex ? ( 
              <div className="space-y-6">
                {/* Editing Mode */}
                <div className="flex items-start gap-4">
                  <span className="text-2xl font-semibold text-gradient-primary mt-2">{index + 1}.</span>
                  <input
                    id="question"
                    type="text"
                    placeholder="Enter your question"
                    value={quizData[index][0]}
                    onChange={(e) => handleQuestionChange(e, index, 0)}
                    className="flex-1 px-3 py-2 rounded-lg bg-input text-primary border border-accent focus:border-accent-hover text-lg"
                  />
                </div>
            
                {/* Answer Options */}
                <div className="space-y-4 pl-8">
                  {[0, 1, 2, 3].map((optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-4">
                      <label className="text-base font-medium text-secondary min-w-[2rem]">
                        {String.fromCharCode(65 + optionIndex)}:
                      </label>
                      <input
                        id={optionIndex + 1}
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                        value={quizData[index][optionIndex + 1]}
                        onChange={(e) => handleQuestionChange(e, index, optionIndex + 1)}
                        className="flex-1 px-3 py-2 rounded-lg bg-input text-primary border border-accent focus:border-accent-hover"
                      />
                    </div>
                  ))}
                </div>

                {/* Correct Answer Selection */}
                <div className="pl-8 space-y-4">
                  <div className="bg-accent bg-opacity-10 rounded-lg p-4 border border-accent">
                    <h3 className="text-lg font-semibold text-white mb-4">Select The Correct Answer</h3>
                    <select 
                      name="correctChoice"
                      id="correct-choice"
                      placeholder="Select the correct answer"
                      className="w-full px-3 py-2 rounded-lg bg-input text-primary border border-accent focus:border-accent-hover"
                      onChange={(e) => handleQuestionChange(e, index, 5)}
                      value={quizData[index][5]}
                    >
                      <option value="">Select the correct answer</option>
                      {[1, 2, 3, 4].map((optionIndex) => (
                        <option value={quizData[index][optionIndex]} key={optionIndex}>
                        {quizData[index][optionIndex] ? quizData[index][optionIndex] : `Please type an answer for Option ${String.fromCharCode(64 + optionIndex)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button 
                    onClick={doneEditing} 
                    className="px-6 py-2 bg-accent hover:bg-accent-hover text-btn-primary rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg border border-accent"
                  >
                    Done Editing
                  </button>
                  <button 
                    onClick={() => handleDeleteQuestion(index)} 
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg border border-red-600"
                  >
                    Delete Question
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Display Mode */}
                <div className="flex items-start gap-4">
                  <h2 className="text-2xl font-semibold text-gradient-primary">{index + 1}.</h2>
                  <h2 className="text-xl text-primary flex-1">{quizData[index][0]}</h2>
                </div>
                
                {/* Answer Options Display */}
                <div className="space-y-3 pl-8">
                  {[1, 2, 3, 4].map((optionIndex) => (
                    <div key={optionIndex} className="bg-input rounded-lg p-3 border border-accent">
                      <span className="font-medium text-secondary mr-2">
                        {String.fromCharCode(64 + optionIndex)}:
                      </span>
                      <span className="text-primary">{quizData[index][optionIndex]}</span>
                    </div>
                  ))}
                </div>

                {/* Correct Answer Section */}
                <div className="border-t border-accent pt-4">
                  <div className="bg-accent bg-opacity-50 rounded-lg p-4 border border-accent">
                    <h3 className="text-lg font-semibold text-white mb-2">Correct Answer:</h3>
                    <p className="text-lg text-white">{quizData[index][5]}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button 
                    onClick={() => editQuestion(index)} 
                    className="px-6 py-2 bg-accent hover:bg-accent-hover text-btn-primary rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg border border-accent"
                  >
                    Edit Question
                  </button>
                  <button 
                    onClick={() => handleDeleteQuestion(index)} 
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg border border-red-600"
                  >
                    Delete Question
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </>
    )}
  </div>
  )

}