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
}) {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(['', '', '', '', '', '', '']);
  const [selectedCorrectAnswers, setSelectedCorrectAnswers] = useState([false, false, false, false]);
  const [droppedOption, setDroppedOption] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      setLoading(true);
      localStorage.setItem('isAuthenticated', 'false');
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
      question = [currentQuestion[0], 'True', 'False', '', '', currentQuestion[5], 'TrueFalse'];
    } else if (type === 'FillInTheBlank') {
      question = [currentQuestion[0], currentQuestion[1], '', '', '', '', 'FillInTheBlank'];
    } else if (type === 'MultipleAnswer') {
      const options = currentQuestion.slice(1, 5);
      const correctAnswers = selectedCorrectAnswers
        .map((selected, idx) => (selected ? options[idx] : null))
        .filter(Boolean);
      question = [currentQuestion[0], ...options, correctAnswers.join('||'), 'MultipleAnswer'];
      setSelectedCorrectAnswers([false, false, false, false]);
    } else if (type === 'DragAndDrop') {
      question = [currentQuestion[0], ...currentQuestion.slice(1, 5), currentQuestion[5], 'DragAndDrop'];
    } else {
      question = currentQuestion;
    }

    setQuizData((prev) => [...prev, question]);
    setCurrentQuestion(['', '', '', '', '', '', '']);
    setDroppedOption('');
  };

  useEffect(() => {
    // Reset password when switching from "Yes" to "No"
    if (!privateQuiz) {
      setPrivateQuizPassword("");
    }
  }, [privateQuiz]);

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
      setQuizTags((prevTags) => {
        const updatedTags = new Set(prevTags);
        updatedTags.add('teachermade (no other tags can be added)');
        return Array.from(updatedTags);
      });
    } else {
      setPrivateQuiz(false);
      setPrivateQuizPassword('');
      setQuizTags((prevTags) => prevTags.filter(tag => tag !== 'teachermade (no other tags can be added)'));
    }
  };

  const handleQuizPasswordChange = (e) => setPrivateQuizPassword(e.target.value);
  const handleQuizNameChange = (e) => setQuizName(e.target.value);
  const updateQuizTags = (e) => {
    if (teacherQuiz) {
      // Automatically set the tags to "teachermade" when teacherQuiz is enabled
      setQuizTags(['teachermade (no other tags can be added)']); // Only "teachermade" is allowed
    } else {
      // Otherwise, allow the user to input tags (without "teachermade")
      const inputTags = e.target.value
        .split(' ') // Split the input into tags based on spaces
        .map(tag => tag.trim()) // Trim each tag to remove extra spaces
        .filter(tag => tag !== ''); // Remove any empty entries
      
      // Remove "teachermade" from the list if it's in the input
      let filteredTags = inputTags.filter(tag => tag !== 'teachermade (no other tags can be added)');
      setQuizTags(filteredTags); // Update the tags list
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f051d] via-[#1b1444] to-[#0f051d] text-white py-16 px-6">
      <div className="max-w-4xl mx-auto bg-black bg-opacity-30 backdrop-blur-xl rounded-lg p-8 shadow-xl">
        <h1 className="text-4xl font-bold text-center mb-10 drop-shadow-lg">Create a Custom Quiz!</h1>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <label className="block text-xl mb-2">Private Quiz?</label>
            <select
              onChange={handlePrivateQuizChange}
              className="w-full p-2 rounded-md text-black"
              value={privateQuiz ? 'yes' : 'no'}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
            <button></button>
          </div>

          {privateQuiz && (
            <div>
              <label className="block text-xl mb-2">Quiz Password</label>
              <input
                type="text"
                value={privateQuizPassword}
                onChange={handleQuizPasswordChange}
                className="w-full p-2 rounded-md text-black"
              />
            </div>
          )}

          <div>
            <label className="block text-xl mb-2">Teacher Quiz?</label>
            <select
              onChange={handleTeacherQuizChange}
              className="w-full p-2 rounded-md text-black"
              value={teacherQuiz ? 'yes' : 'no'}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
            {teacherQuiz && (
              <p className="text-sm text-purple-300 mt-1">
                All teacher quizzes are automatically set to private.
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-xl mb-2">Quiz Name</label>
            <input
              type="text"
              value={quizName}
              onChange={handleQuizNameChange}
              className="w-full p-3 rounded-md text-black"
              placeholder="Enter quiz name"
            />
          </div>

        <h2 className="text-2xl font-semibold mb-4">Add a Question</h2>
        <div className="space-y-4">
          <input
            id="question"
            type="text"
            placeholder="Enter your question"
            value={currentQuestion[0]}
            onChange={(e) => handleQuestionChange(e, 0)}
            className='text-2xl bg-gray-300 mb-4 rounded-md w-full h-12 focus:scale-110 duration-300'
          />
          <select
            value={currentQuestion[6]}
            onChange={(e) => handleQuestionChange(e, 6)}
            className='text-2xl mb-4 bg-gray-300 rounded-md w-full h-12 focus:scale-110 duration-300'
            >
            <option value= "">Select Question Type</option>
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
                className="w-full p-2 text-black rounded-md"
                placeholder={`Option ${idx}`}
              />
            ))}

          {currentQuestion[6] === 'Multiple' && (
            <select
              value={currentQuestion[5]}
              onChange={(e) => handleQuestionChange(e, 5)}
              className="w-full p-2 text-black rounded-md"
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
                  id= {optionIndex + 1}
                  type="text"
                  placeholder={`Option ${optionIndex + 1}`}
                  value={currentQuestion[optionIndex + 1]}
                  onChange={(e) => handleQuestionChange(e, optionIndex + 1)}
                  className='text-2xl mb-4 bg-gray-300 rounded-md w-full h-10 focus:scale-110 duration-300'
                />
              </div>
            ))}

          {currentQuestion[6] === 'FillInTheBlank' && (
            <input
              type="text"
              value={currentQuestion[1]}
              onChange={(e) => handleQuestionChange(e, 1)}
              className="w-full p-2 text-black rounded-md"
              placeholder="Enter the correct answer"
            />
          )}

          {currentQuestion[6] === 'TrueFalse' && (
            <div className="space-x-4">
              <label><input type="radio" value="True" checked={currentQuestion[5] === 'True'} onChange={(e) => handleQuestionChange(e, 5)} /> True</label>
              <label><input type="radio" value="False" checked={currentQuestion[5] === 'False'} onChange={(e) => handleQuestionChange(e, 5)} /> False</label>
            </div>
          )}

          {currentQuestion[6] === 'DragAndDrop' && (
            <>
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', currentQuestion[idx])}
                  className="p-2 bg-purple-700 text-white rounded-md cursor-move">
                  {currentQuestion[idx]}
                </div>
              ))}
              <div className="w-full h-16 mt-4 flex items-center justify-center border-2 border-dashed border-purple-400 rounded-md"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const data = e.dataTransfer.getData('text/plain');
                  setDroppedOption(data);
                }}
              >
                {currentQuestion[0].includes('[blank]')
                  ? currentQuestion[0].replace('[blank]', droppedOption || '________')
                  : 'Your sentence must include [blank]'}
              </div>
              <input
                type="text"
                value={currentQuestion[5]}
                onChange={(e) => handleQuestionChange(e, 5)}
                className="w-full mt-2 p-2 text-black rounded-md"
                placeholder="Correct answer (must match one of the options)"
              />
            </>
          )}

          <input
            type="text"
            value={quizTags.join(' ')}
            onChange={updateQuizTags}
            className="w-full p-3 text-black rounded-md"
            placeholder="Enter tags (e.g. history sports)"
          />
        </div>
        </div>
      </div>



        <div className="grid grid-cols-2 gap-6 mt-10">
          <button
            onClick={addCurrentQuestion}
            className="bg-purple-600 hover:bg-purple-500 transition text-white py-3 rounded-md font-semibold"
          >
            Add Question
          </button>
          <button
            onClick={sendQuiz}
            className="bg-green-600 hover:bg-green-500 transition text-white py-3 rounded-md font-semibold"
          >
            Finish Quiz
          </button>
        </div>
    </div>
  );
}
