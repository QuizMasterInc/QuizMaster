//This file handles creating the users custom quiz and making it able to be accessed within the product and database
import React, {useState, useEffect} from 'react'
import {useAuth} from '../../contexts/AuthContext'
import { Link, Navigate } from 'react-router-dom'

export default function QuizCreation({
  setQuizData,
  sendQuiz,
  quizName,
  setQuizName,
  privateQuiz,
  setPrivateQuiz,
  privateQuizPassword,
  setPrivateQuizPassword,
  quizTags,
  setQuizTags,
  teacherQuiz,
  setTeacherQuiz,
  isCreatingQuiz,
}) {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(['', '', '', '', '', '', '', '', 3]); // difficulty at index 8 as number
  const [selectedCorrectAnswers, setSelectedCorrectAnswers] = useState([false, false, false, false]);
  const [droppedOption, setDroppedOption] = useState('');
  const [rawTagsInput, setRawTagsInput] = useState('');
  const [numAnswers, setNumAnswers] = useState(4); // New state for answer count (2-4)
  const [questionDifficulty, setQuestionDifficulty] = useState(3); // New state for difficulty (1-5) as number

  const handleLogout = async () => {
    try {
      await logout();
      setLoading(true);
      return <Navigate to="/signin" />;
    } catch {
      alert('Failed to logout');
    }
    setLoading(false);
  };

  const verifyQuestionInput = (question) => {
    const type = question[6];
    const optionsFilled = [1, 2, 3, 4].every((idx) => question[idx].trim() !== '');

    if (type === 'TrueFalse') {
      return question[0].trim() !== '' && question[5] !== '';
    } else if (type === 'FillInTheBlank') {
      return question[0].trim() !== '' && question[1].trim() !== '';
    } else if (type === 'MultipleAnswer') {
      return question[0].trim() !== '' && optionsFilled && selectedCorrectAnswers.some(Boolean);
    } else if (type === 'DragAndDrop') {
      return question[0].includes('[blank]') && optionsFilled && question[5].trim() !== '';
    } else if (type === 'Multiple') {
      return question[0].trim() !== '' && optionsFilled && question[5].trim() !== '';
    }
    return false;
  };

  const handleQuestionChange = (e, index) => {
    setCurrentQuestion((prevCurrentQuestion) => {
      const updatedQuestion = [...prevCurrentQuestion];
      updatedQuestion[index] = e.target.value;
      return updatedQuestion;
    })
  };

  //this function adds the question to the quizData array after user finished making the question 
  // ALSO CALLS THE FUNCTION THAT VERIFIES IF THE QUESTION INPUTS ARE ALL COMPLETED
  const addCurrentQuestion = () => {
    if (!verifyQuestionInput(currentQuestion)) {
      alert('Please fill out all inputs for the question.');
      return;
    }

    let question;
    const type = currentQuestion[6];

    if (type === 'TrueFalse') {
      question = [
        currentQuestion[0],  // index 0: question text
        'True',              // index 1: option_1
        'False',             // index 2: option_2
        '',                  // index 3: option_3
        '',                  // index 4: option_4
        currentQuestion[5],  // index 5: correct_answer
        'TrueFalse',         // index 6: type
        '',                  // index 7: explanation
        currentQuestion[8] || questionDifficulty || 3  // index 8: difficulty
      ];
    } else if (type === 'FillInTheBlank') {
      question = [
        currentQuestion[0],  // index 0: question text
        currentQuestion[1],  // index 1: correct answer (option_1)
        '',                  // index 2: option_2
        '',                  // index 3: option_3
        '',                  // index 4: option_4
        currentQuestion[1],  // index 5: correct_answer (same as option_1)
        'FillInTheBlank',    // index 6: type
        '',                  // index 7: explanation
        currentQuestion[8] || questionDifficulty || 3  // index 8: difficulty
      ];
    } else if (type === 'MultipleAnswer') {
      const options = currentQuestion.slice(1, 5);
      const correctAnswers = selectedCorrectAnswers
        .map((selected, idx) => (selected ? options[idx] : null))
        .filter(Boolean);
      question = [
        currentQuestion[0],                // index 0: question text
        ...options,                        // index 1-4: options
        correctAnswers.join('||'),         // index 5: correct_answer
        'MultipleAnswer',                  // index 6: type
        '',                                // index 7: explanation
        currentQuestion[8] || questionDifficulty || 3  // index 8: difficulty
      ];
      setSelectedCorrectAnswers([false, false, false, false]);
    } else if (type === 'DragAndDrop') {
      question = [
        currentQuestion[0],                // index 0: question text
        ...currentQuestion.slice(1, 5),    // index 1-4: options
        currentQuestion[5],                // index 5: correct_answer
        'DragAndDrop',                     // index 6: type
        '',                                // index 7: explanation
        currentQuestion[8] || questionDifficulty || 3  // index 8: difficulty
      ];
    } else {
      // Multiple choice - make sure all indices are properly included
      question = [
        currentQuestion[0],                // index 0: question text
        currentQuestion[1],                // index 1: option_1
        currentQuestion[2],                // index 2: option_2
        currentQuestion[3],                // index 3: option_3
        currentQuestion[4],                // index 4: option_4
        currentQuestion[5],                // index 5: correct_answer
        currentQuestion[6],                // index 6: type
        '',                                // index 7: explanation
        currentQuestion[8] || questionDifficulty || 3  // index 8: difficulty
      ];
    }

    setQuizData((prev) => [...prev, question]);
    setCurrentQuestion(['', '', '', '', '', '', '', '', 3]); // Reset with default difficulty as number
    setQuestionDifficulty(3); // Reset difficulty state
    setDroppedOption('');
  };

  useEffect(() => {
    // Reset password when switching from "Yes" to "No"
    if (!privateQuiz) {
      setPrivateQuizPassword("");
    }
  }, [privateQuiz]);

  // Initialize raw tags input from existing quizTags
  useEffect(() => {
    if (!teacherQuiz && quizTags.length > 0) {
      const nonTeacherTags = quizTags.filter(tag => tag !== 'teachermade (no other tags can be added)');
      setRawTagsInput(nonTeacherTags.join(', '));
    }
  }, []);  // Only run on component mount

  const handlePrivateQuizChange = (e) => {
    const value = e.target.value === 'yes';
    if (!teacherQuiz) setPrivateQuiz(value);
  };

  const handleTeacherQuizChange = (e) => {
    const value = e.target.value === 'yes';
    setTeacherQuiz(value);
    if (value) {
      setPrivateQuiz(true);
      if (!privateQuizPassword) setPrivateQuizPassword('teacherOnly');
      setQuizTags(['teachermade (no other tags can be added)']);
      setRawTagsInput(''); // Clear raw input when teacher mode is enabled
    } else {
      setPrivateQuiz(false);
      setPrivateQuizPassword('');
      setQuizTags((prevTags) => prevTags.filter(tag => tag !== 'teachermade (no other tags can be added)'));
      // Restore raw input from current tags (excluding teachermade)
      const nonTeacherTags = quizTags.filter(tag => tag !== 'teachermade (no other tags can be added)');
      setRawTagsInput(nonTeacherTags.join(', '));
    }
  };

  const handleQuizPasswordChange = (e) => setPrivateQuizPassword(e.target.value);
  const handleQuizNameChange = (e) => setQuizName(e.target.value);
  
  // Process tags from raw input string
  const processTagsFromInput = (inputValue) => {
    const inputTags = inputValue
      .split(',') // Split the input into tags based on commas (allows spaces in tag names)
      .map(tag => tag.trim()) // Trim each tag to remove extra spaces
      .filter(tag => tag !== ''); // Remove any empty entries
    
    // Remove "teachermade" from the list if it's in the input
    return inputTags.filter(tag => tag !== 'teachermade (no other tags can be added)');
  };

  const updateQuizTags = (e) => {
    const inputValue = e.target.value;
    setRawTagsInput(inputValue); // Always update the raw input for display
    
    if (teacherQuiz) {
      // Automatically set the tags to "teachermade" when teacherQuiz is enabled
      setQuizTags(['teachermade (no other tags can be added)']); // Only "teachermade" is allowed
    } else {
      // Process and store the tags - this allows free-form input with spaces and commas
      const processedTags = processTagsFromInput(inputValue);
      setQuizTags(processedTags);
    }
  };

  // Update number of answers in the current question
  const updateNumAnswers = (newCount) => {
    setNumAnswers(newCount);
    setCurrentQuestion((prev) => {
      const updated = [...prev];
      // Adjust the options and correct answer fields based on the new count
      if (newCount < 4) {
        updated.splice(4, 4 - newCount); // Remove excess options
        setSelectedCorrectAnswers((prevAnswers) => {
          const newAnswers = [...prevAnswers];
          newAnswers.splice(newCount); // Trim correct answers array
          return newAnswers;
        });
      } else if (newCount > 4) {
        for (let i = 4; i < newCount; i++) {
          updated[i] = ''; // Add new empty options
        }
      }
      return updated;
    });
  };

  // Update question difficulty
  const updateQuestionDifficulty = (e) => {
    const value = parseInt(e.target.value, 10);
    // Ensure value is a valid number between 1-5, default to empty string if NaN for better UX
    const validValue = !isNaN(value) && value >= 1 && value <= 5 ? value : 3;
    setQuestionDifficulty(validValue);
    setCurrentQuestion((prev) => {
      const updated = [...prev];
      updated[8] = validValue; // Update the difficulty index with valid number
      return updated;
    });
  };

  return (
    <div className="space-y-8">
      {/* Quiz Settings Section */}
      <div className="bg-card rounded-2xl p-6 shadow-xl border border-accent">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gradient-primary">
          Quiz Settings
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-lg mb-2 text-secondary">Private Quiz?</label>
            <select
              onChange={handlePrivateQuizChange}
              className="w-full px-3 py-2 rounded-lg bg-input text-primary border border-accent focus:border-accent-hover"
              value={privateQuiz ? 'yes' : 'no'}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>

          {privateQuiz && (
            <div>
              <label className="block text-lg mb-2 text-secondary">Quiz Password</label>
              <input
                type="text"
                value={privateQuizPassword}
                onChange={handleQuizPasswordChange}
                className="w-full px-3 py-2 rounded-lg bg-input text-primary border border-accent focus:border-accent-hover"
                placeholder="Enter password"
              />
            </div>
          )}

          <div>
            <label className="block text-lg mb-2 text-secondary">Teacher Quiz?</label>
            <select
              onChange={handleTeacherQuizChange}
              className="w-full px-3 py-2 rounded-lg bg-input text-primary border border-accent focus:border-accent-hover"
              value={teacherQuiz ? 'yes' : 'no'}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
            {teacherQuiz && (
              <p className="text-sm text-accent mt-1">
                All teacher quizzes are automatically set to private.
              </p>
            )}
          </div>

          <div>
            <label className="block text-lg mb-2 text-secondary">Quiz Name</label>
            <input
              type="text"
              value={quizName}
              onChange={handleQuizNameChange}
              className="w-full px-3 py-2 rounded-lg bg-input text-primary border border-accent focus:border-accent-hover"
              placeholder="Enter quiz name"
            />
          </div>
        </div>

        <div>
          <label className="block text-lg mb-2 text-secondary">Quiz Tags</label>
          <input
            type="text"
            value={teacherQuiz ? 'teachermade (no other tags can be added)' : rawTagsInput}
            onChange={updateQuizTags}
            className="w-full px-3 py-2 rounded-lg bg-input text-primary border border-accent focus:border-accent-hover"
            placeholder="Enter tags separated by commas (e.g. Computer Science, History, Sports)"
            disabled={teacherQuiz}
          />
        </div>
      </div>

      {/* Question Creation Section */}
      <div className="bg-card rounded-2xl p-6 shadow-xl border border-accent">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gradient-primary">
          Add a Question
        </h2>
        
        <div className="space-y-4">
          <input
            id="question"
            type="text"
            placeholder="Enter your question"
            value={currentQuestion[0]}
            onChange={(e) => handleQuestionChange(e, 0)}
            className="w-full px-3 py-2 rounded-lg bg-input text-primary border border-accent focus:border-accent-hover text-lg"
          />
          
          <select
            value={currentQuestion[6]}
            onChange={(e) => handleQuestionChange(e, 6)}
            className="w-full px-3 py-2 rounded-lg bg-input text-primary border border-accent focus:border-accent-hover text-lg"
          >
            <option value="">Select Question Type</option>
            <option value="Multiple">Multiple Choice</option>
            <option value="TrueFalse">True/False</option>
          </select>

          {(currentQuestion[6] === 'Multiple' || currentQuestion[6] === 'MultipleAnswer' || currentQuestion[6] === 'DragAndDrop') &&
            [1, 2, 3, 4].map((idx) => (
              <input
                key={idx}
                type="text"
                value={currentQuestion[idx]}
                onChange={(e) => handleQuestionChange(e, idx)}
                className="w-full px-3 py-2 rounded-lg bg-input text-primary border border-accent focus:border-accent-hover"
                placeholder={`Option ${idx}`}
              />
            ))}

          {currentQuestion[6] === 'Multiple' && (
            <select
              value={currentQuestion[5]}
              onChange={(e) => handleQuestionChange(e, 5)}
              className="w-full px-3 py-2 rounded-lg bg-input text-primary border border-accent focus:border-accent-hover"
            >
              <option value="">Select correct answer</option>
              {[1, 2, 3, 4].map((idx) => (
                <option key={idx} value={currentQuestion[idx]}>
                  {currentQuestion[idx] || `Option ${idx}`}
                </option>
              ))}
            </select>
          )}

          {currentQuestion[6] === 'MultipleAnswer' &&
            [1, 2, 3, 4].map((idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder={`Option ${idx}`}
                  value={currentQuestion[idx]}
                  onChange={(e) => handleQuestionChange(e, idx)}
                  className="flex-1 px-3 py-2 rounded-lg bg-input text-primary border border-accent focus:border-accent-hover"
                />
                <input
                  type="checkbox"
                  checked={selectedCorrectAnswers[idx - 1]}
                  onChange={() => {
                    const newSelected = [...selectedCorrectAnswers];
                    newSelected[idx - 1] = !newSelected[idx - 1];
                    setSelectedCorrectAnswers(newSelected);
                  }}
                  className="w-5 h-5 text-accent bg-input border-accent rounded focus:ring-accent"
                />
              </div>
            ))}

          {currentQuestion[6] === 'FillInTheBlank' && (
            <input
              type="text"
              value={currentQuestion[1]}
              onChange={(e) => handleQuestionChange(e, 1)}
              className="w-full px-3 py-2 rounded-lg bg-input text-primary border border-accent focus:border-accent-hover"
              placeholder="Enter the correct answer"
            />
          )}

          {currentQuestion[6] === 'TrueFalse' && (
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-secondary">
                <input 
                  type="radio" 
                  value="True" 
                  checked={currentQuestion[5] === 'True'} 
                  onChange={(e) => handleQuestionChange(e, 5)}
                  className="text-accent bg-input border-accent focus:ring-accent"
                /> 
                True
              </label>
              <label className="flex items-center gap-2 text-secondary">
                <input 
                  type="radio" 
                  value="False" 
                  checked={currentQuestion[5] === 'False'} 
                  onChange={(e) => handleQuestionChange(e, 5)}
                  className="text-accent bg-input border-accent focus:ring-accent"
                /> 
                False
              </label>
            </div>
          )}

          {currentQuestion[6] === 'DragAndDrop' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((idx) => (
                  <div 
                    key={idx} 
                    draggable 
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', currentQuestion[idx])}
                    className="p-3 bg-accent text-btn-primary rounded-lg cursor-move text-center border border-accent hover:bg-accent-hover transition-colors"
                  >
                    {currentQuestion[idx] || `Option ${idx}`}
                  </div>
                ))}
              </div>
              
              <div 
                className="w-full min-h-[4rem] flex items-center justify-center border-2 border-dashed border-accent rounded-lg bg-input text-center p-4"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const data = e.dataTransfer.getData('text/plain');
                  setDroppedOption(data);
                }}
              >
                <span className="text-secondary">
                  {currentQuestion[0].includes('[blank]')
                    ? currentQuestion[0].replace('[blank]', droppedOption || '________')
                    : 'Your sentence must include [blank]'}
                </span>
              </div>
              
              <input
                type="text"
                value={currentQuestion[5]}
                onChange={(e) => handleQuestionChange(e, 5)}
                className="w-full px-3 py-2 rounded-lg bg-input text-primary border border-accent focus:border-accent-hover"
                placeholder="Correct answer (must match one of the options)"
              />
            </div>
          )}

          {/* Difficulty and Answer Count Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-lg mb-2 text-secondary">Number of Answers</label>
              <select
                value={numAnswers}
                onChange={(e) => updateNumAnswers(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-lg bg-input text-primary border border-accent focus:border-accent-hover"
              >
                <option value={2}>2 Answers</option>
                <option value={3}>3 Answers</option>
                <option value={4}>4 Answers</option>
              </select>
            </div>

            <div>
              <label className="block text-lg mb-2 text-secondary">Question Difficulty</label>
              <input
                type="number"
                min="1"
                max="5"
                value={questionDifficulty}
                onChange={updateQuestionDifficulty}
                className="w-full px-3 py-2 rounded-lg bg-input text-primary border border-accent focus:border-accent-hover"
                placeholder="1-5"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={addCurrentQuestion}
            className="flex-1 px-6 py-3 bg-accent hover:bg-accent-hover text-btn-primary rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg border border-accent"
          >
            Add Question
          </button>
          <button
            onClick={sendQuiz}
            disabled={isCreatingQuiz}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg border flex items-center justify-center gap-2 ${
              isCreatingQuiz 
                ? 'bg-gray-400 border-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 text-white border-green-600'
            }`}
          >
            {isCreatingQuiz ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Quiz...
              </>
            ) : (
              'Finish Quiz'
            )}
          </button>
        </div>
      </div>
    </div>
  );
  
}