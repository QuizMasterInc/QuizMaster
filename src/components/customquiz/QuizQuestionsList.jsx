import React, { useState } from 'react';

export default function QuizQuestionsList({ quizData, setQuizData, handleDeleteQuestion }) {
  const [editQuestionChoice, setEditQuestionChoice] = useState(false);
  const [doneEditingQuestion, setDoneEditingQuestion] = useState(true);
  const [editingQuestionindex, setEditingQuestionIndex] = useState(-1);

  function editQuestionSelection() {
    setEditQuestionChoice(true);
    setDoneEditingQuestion(false);
  }

  function editingQuestionIndex(index) {
    setEditingQuestionIndex(index);
  }

  function editQuestion(index) {
    editQuestionSelection();
    editingQuestionIndex(index);
  }

  const doneEditing = () => {
    setEditQuestionChoice(false);
    setDoneEditingQuestion(true);
    setEditingQuestionIndex(-1);
  };

  const handleQuestionChange = (e, qIndex, fieldIndex) => {
    setQuizData(prev => {
      const updated = [...prev];
      updated[qIndex][fieldIndex] = e.target.value;
      return updated;
    });
  };

  const verifyQuestionChange = (data, index) => {
    const question = data[index];
    const type = question[question.length - 1];

    if (type === "FillInTheBlank") {
      if (question[0].trim() === "" || question[1].trim() === "") {
        alert("Please fill out the question and answer");
        return false;
      }
    } else if (type === "MultipleAnswer") {
      for (let i = 0; i < 6; i++) {
        if (question[i].trim() === "") {
          alert("Please fill out all changes for the question.");
          return false;
        }
      }
    } else if (type === "DragAndDrop") {
      const hasBlank = question[0].includes('[blank]');
      const optionsFilled = [1, 2, 3, 4].some(i => question[i]?.trim() !== '');
      const hasCorrect = question[5]?.trim() !== '';
      if (!hasBlank || !optionsFilled || !hasCorrect) {
        alert("Drag-and-drop questions must include a [blank], options, and a correct answer.");
        return false;
      }
    } else {
      for (let i = 0; i < 6; i++) {
        if (question[i].trim() === "") {
          alert("Please fill out all changes for the question.");
          return false;
        }
      }
    }
    doneEditing();
    return true;
  };

  return (
    <div className="w-full" id="questionsList">
      {quizData.map((quiz, index) => {
        const type = quiz[quiz.length - 1];

        return (
          <div key={index} className="flex flex-col pb-4 mb-4 mt-10 bg-gray-900 rounded-lg shadow-lg p-2">
            {editQuestionChoice && index === editingQuestionindex ? (
              <div className="flex flex-col pt-4 pb-4 text-xl text-gray-300 space-y-4">
                <div className="flex flex-row items-center">
                  <p className="mr-2">{index + 1}.</p>
                  <input
                    type="text"
                    placeholder="Enter your question"
                    value={quiz[0]}
                    onChange={(e) => handleQuestionChange(e, index, 0)}
                    className="text-2xl p-2 text-black bg-gray-300 rounded-md w-full"
                  />
                </div>

                {type === "FillInTheBlank" && (
                  <input
                    type="text"
                    placeholder="Enter the correct answer"
                    value={quiz[1]}
                    onChange={(e) => handleQuestionChange(e, index, 1)}
                    className="text-2xl p-2 text-black bg-gray-300 rounded-md w-full"
                  />
                )}

                {(type === "MultipleAnswer" || type === "Multiple") && (
                  <>
                    {[1, 2, 3, 4].map(optionIndex => (
                      <input
                        key={optionIndex}
                        type="text"
                        placeholder={`Option ${optionIndex}`}
                        value={quiz[optionIndex]}
                        onChange={(e) => handleQuestionChange(e, index, optionIndex)}
                        className="text-2xl p-2 text-black bg-gray-300 rounded-md w-full"
                      />
                    ))}
                  </>
                )}

                {type === "DragAndDrop" && (
                  <>
                    {[1, 2, 3, 4].map(optionIndex => (
                      <input
                        key={optionIndex}
                        type="text"
                        placeholder={`Draggable Option ${optionIndex}`}
                        value={quiz[optionIndex]}
                        onChange={(e) => handleQuestionChange(e, index, optionIndex)}
                        className="text-2xl p-2 text-black bg-gray-300 rounded-md w-full"
                      />
                    ))}
                    <input
                      type="text"
                      placeholder="Correct answer"
                      value={quiz[5]}
                      onChange={(e) => handleQuestionChange(e, index, 5)}
                      className="text-2xl p-2 text-black bg-gray-300 rounded-md w-full"
                    />
                  </>
                )}

                {type === "TrueFalse" && (
                  <div className="flex space-x-4">
                    <label>
                      <input
                        type="radio"
                        value="True"
                        checked={quiz[5] === "True"}
                        onChange={(e) => handleQuestionChange(e, index, 5)}
                      /> True
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="False"
                        checked={quiz[5] === "False"}
                        onChange={(e) => handleQuestionChange(e, index, 5)}
                      /> False
                    </label>
                  </div>
                )}

                {type === "Multiple" && (
                  <select
                    onChange={(e) => handleQuestionChange(e, index, 5)}
                    value={quiz[5]}
                    className="w-full p-2 text-black bg-gray-300 rounded-md"
                  >
                    <option value="">Select correct answer</option>
                    {[1, 2, 3, 4].map(optionIndex => (
                      <option key={optionIndex} value={quiz[optionIndex]}>
                        {quiz[optionIndex] || `Option ${optionIndex}`}
                      </option>
                    ))}
                  </select>
                )}

                {type === "MultipleAnswer" && (
                  <input
                    type="text"
                    placeholder='Enter correct answers separated by "||"'
                    value={quiz[5]}
                    onChange={(e) => handleQuestionChange(e, index, 5)}
                    className="w-full p-2 text-black bg-gray-300 rounded-md"
                  />
                )}

                <div className="flex space-x-4">
                  <button onClick={() => verifyQuestionChange(quizData, index)} className="p-2 text-gray-300 bg-gray-800 rounded-md hover:bg-gray-600">
                    Done Editing
                  </button>
                  <button onClick={() => handleDeleteQuestion(index)} className="p-2 text-gray-300 bg-gray-800 rounded-md hover:bg-gray-600">
                    Delete Question
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col pt-4 pb-4 text-xl text-gray-300 space-y-3">
                <div className="flex flex-row items-center">
                  <p className="mr-2">{index + 1}.</p>
                  <p className="ml-2">{quiz[0]}</p>
                </div>

                {(type === "Multiple" || type === "MultipleAnswer" || type === "DragAndDrop") && (
                  <>
                    {[1, 2, 3, 4].map(optionIndex => (
                      quiz[optionIndex] && (
                        <div key={optionIndex} className="p-2 bg-gray-800 rounded-md">
                          <p>{quiz[optionIndex]}</p>
                        </div>
                      )
                    ))}
                  </>
                )}

                {type === "FillInTheBlank" && (
                  <div className="p-2 bg-gray-800 rounded-md">
                    <p><strong>Answer:</strong> {quiz[1]}</p>
                  </div>
                )}

                {type === "TrueFalse" && (
                  <>
                    <div className="p-2 bg-gray-800 rounded-md">{quiz[1]}</div>
                    <div className="p-2 bg-gray-800 rounded-md">{quiz[2]}</div>
                  </>
                )}

                <div className="mt-2">
                  <p className="text-2xl font-bold">Correct Answer{type === "MultipleAnswer" ? "s" : ""}</p>
                  <div className="p-2 bg-gray-800 rounded-md">
                    <p>{type === "MultipleAnswer" ? quiz[5]?.split("||").join(", ") : quiz[5]}</p>
                  </div>
                </div>

                <div className="flex space-x-4 mt-4">
                  <button onClick={() => editQuestion(index)} className="p-2 text-gray-300 bg-gray-800 rounded-md hover:bg-gray-600">
                    Edit Question
                  </button>
                  <button onClick={() => handleDeleteQuestion(index)} className="p-2 text-gray-300 bg-gray-800 rounded-md hover:bg-gray-600">
                    Delete Question
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}