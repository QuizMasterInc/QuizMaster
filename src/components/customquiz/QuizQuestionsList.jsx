// This file handles the users custom quiz questions
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function QuizQuestionsList({ quizData, setQuizData, handleDeleteQuestion }) {
  const [editQuestionChoice, setEditQuestionChoice] = useState(false);
  const [doneEditingQuestion, setDoneEditingQuestion] = useState(true);
  const [editingQuestionindex, setEditingQuestionIndex] = useState(-1);
  const [expandedIndex, setExpandedIndex] = useState(null);

  // this function changes the state of editQuestionChoice to true if a user wants to edit a question
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
    // when editing, force that question to be expanded
    setExpandedIndex(index);
  }

  const doneEditing = () => {
    setEditQuestionChoice(false);
    setDoneEditingQuestion(true);
    setEditingQuestionIndex(-1);
  };

  // This function updates the information for each individual question
  const handleQuestionChange = (e, index, questionIndex) => {
    setQuizData((prevQuizData) => {
      const newQuizData = [...prevQuizData];
      newQuizData[index][questionIndex] = e.target.value;
      return newQuizData;
    });
  };

  const verifyQuestionChange = (quizData, index) => {
    for (let i = 0; i < 6; i++) {
      if (quizData[index][i] === '') {
        toast.warn('Please fill out all changes');
        return;
      }
    }
    doneEditing();
  };

  const toggleExpanded = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="w-full space-y-6" id="questionsList">
      {quizData.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 shadow-xl border border-accent text-center">
          <h3 className="text-xl text-secondary">No questions added yet</h3>
          <p className="text-secondary mt-2">
            Add your first question using the form above
          </p>
        </div>
      ) : (
        <>
          <div className="bg-card rounded-2xl p-6 shadow-xl border border-accent">
            <h2 className="text-2xl font-semibold text-center text-gradient-primary mb-1">
              Quiz Questions ({quizData.length})
            </h2>
            <p className="text-sm text-secondary text-center">
              Click a question to expand its options and correct answer.
            </p>
          </div>

          {quizData.map((quiz, index) => {
            const isEditing = editQuestionChoice && index === editingQuestionindex;
            const isExpanded = isEditing || expandedIndex === index;

            return (
              <div
                key={index}
                className="bg-card rounded-3xl p-6 shadow-xl border border-accent space-y-4"
              >
                {/* Compact header with caret */}
                <button
                  type="button"
                  onClick={() => !isEditing && toggleExpanded(index)}
                  className="w-full flex items-start justify-between gap-4 text-left"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-xl font-semibold text-gradient-primary mt-1">
                      {index + 1}.
                    </span>
                    <div className="space-y-1">
                      <h2 className="text-base md:text-lg text-primary line-clamp-2">
                        {quizData[index][0] || 'Untitled question'}
                      </h2>
                      {!isExpanded && (
                        <p className="text-xs md:text-sm text-secondary">
                          Tap to view options and correct answer.
                        </p>
                      )}
                    </div>
                  </div>
                  {!isEditing && (
                    <span className="text-secondary text-xl md:text-2xl mt-1">
                      {isExpanded ? '▾' : '▸'}
                    </span>
                  )}
                </button>

                {/* EDITING MODE */}
                {isEditing && (
                  <div className="space-y-6 pt-2 border-t border-accent">
                    {/* Question text input */}
                    <div className="flex items-start gap-4">
                      <span className="text-2xl font-semibold text-gradient-primary mt-2">
                        {index + 1}.
                      </span>
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
                          <label className="text-sm md:text-base font-medium text-secondary min-w-[2rem]">
                            {String.fromCharCode(65 + optionIndex)}:
                          </label>
                          <input
                            id={optionIndex + 1}
                            type="text"
                            placeholder={`Option ${String.fromCharCode(
                              65 + optionIndex
                            )}`}
                            value={quizData[index][optionIndex + 1]}
                            onChange={(e) =>
                              handleQuestionChange(e, index, optionIndex + 1)
                            }
                            className="flex-1 px-3 py-2 rounded-lg bg-input text-primary border border-accent focus:border-accent-hover"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Correct Answer Selection */}
                    <div className="pl-8 space-y-4">
                      <div className="bg-accent bg-opacity-10 rounded-lg p-4 border border-accent">
                        <h3 className="text-lg font-semibold text-white mb-4">
                          Select The Correct Answer
                        </h3>
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
                            <option
                              value={quizData[index][optionIndex]}
                              key={optionIndex}
                            >
                              {quizData[index][optionIndex]
                                ? quizData[index][optionIndex]
                                : `Please type an answer for Option ${String.fromCharCode(
                                    64 + optionIndex
                                  )}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => verifyQuestionChange(quizData, index)}
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
                )}

                {/* DISPLAY MODE (expanded) */}
                {!isEditing && isExpanded && (
                  <div className="space-y-5 pt-3 border-t border-accent">
                    {/* Answer Options Display */}
                    <div className="space-y-3 pl-8">
                      {[1, 2, 3, 4].map((optionIndex) => (
                        <div
                          key={optionIndex}
                          className="bg-input rounded-lg p-3 border border-accent"
                        >
                          <span className="font-medium text-secondary mr-2">
                            {String.fromCharCode(64 + optionIndex)}:
                          </span>
                          <span className="text-primary">
                            {quizData[index][optionIndex] || (
                              <span className="text-secondary italic">
                                No option provided
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Correct Answer Section */}
                    <div className="border-t border-accent pt-4">
                      <div className="bg-accent bg-opacity-50 rounded-lg p-4 border border-accent">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          Correct Answer:
                        </h3>
                        <p className="text-lg text-white">
                          {quizData[index][5] || 'Not set yet'}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
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
            );
          })}
        </>
      )}
    </div>
  );
}
