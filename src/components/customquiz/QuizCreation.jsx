//This file handles creating the users custom quiz and making it able to be accessed within the product and database
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

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
}) {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(['', '', '', '', '', '', '']);

  async function handleLogout() {
    setError('');
    let isAuth = false;
    try {
      await logout();
      setLoading(true);
      isAuth = true;
    } catch {
      setError('Failed to logout');
    }
    setLoading(false);
    localStorage.setItem('isAuthenticated', 'false');
    if (isAuth) return <Navigate to="/signin" />;
  }

  const verifyQuestionInput = (question) => {
    if (question[6] === 'TrueFalse') {
      return question[0].trim() !== '' && question[5] !== '';
    }
    return question.every((input) => input.trim() !== '');
  };

  const handleQuestionChange = (e, index) => {
    const updated = [...currentQuestion];
    updated[index] = e.target.value;
    setCurrentQuestion(updated);
  };

  const addCurrentQuestion = () => {
    if (!verifyQuestionInput(currentQuestion)) {
      alert('Please fill out all inputs for the question.');
      return;
    }
    const question = currentQuestion[6] === 'TrueFalse'
      ? [currentQuestion[0], 'True', 'False', '', '', currentQuestion[5], 'TrueFalse']
      : currentQuestion;
    setQuizData((prev) => [...prev, question]);
    setCurrentQuestion(['', '', '', '', '', '', '']);
  };

  const handleQuizNameChange = (e) => setQuizName(e.target.value);

  useEffect(() => {
    if (!privateQuiz) setPrivateQuizPassword('');
  }, [privateQuiz]);

  const handlePrivateQuizChange = (e) => {
    const value = e.target.value;
    setPrivateQuiz(value === 'yes');
  };

  const handleQuizPasswordChange = (e) => setPrivateQuizPassword(e.target.value);

  const updateQuizTags = (e) => setQuizTags(e.target.value.split(' '));

  return (
    <div className="min-h-screen py-16 px-4 md:px-20 bg-black text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">Create a Custom Quiz!</h1>

        {/* Quiz Settings */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <label className="block text-xl mb-2">Private Quiz?</label>
            <select
              onChange={handlePrivateQuizChange}
              className="w-full text-black p-2 rounded-md"
              value={privateQuiz ? 'yes' : 'no'}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>

          {privateQuiz && (
            <div>
              <label className="block text-xl mb-2">Quiz Password</label>
              <input
                type="text"
                value={privateQuizPassword}
                onChange={handleQuizPasswordChange}
                className="w-full p-2 text-black rounded-md"
              />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-xl mb-2">Quiz Name</label>
            <input
              type="text"
              value={quizName}
              onChange={handleQuizNameChange}
              className="w-full p-3 text-black rounded-md"
              placeholder="Enter quiz name"
            />
          </div>
        </div>

        {/* Question Builder */}
        <h2 className="text-3xl font-semibold mb-4">Add a Question</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={currentQuestion[0]}
            onChange={(e) => handleQuestionChange(e, 0)}
            className="w-full p-3 text-black rounded-md"
            placeholder="Enter your question"
          />

          <select
            value={currentQuestion[6]}
            onChange={(e) => handleQuestionChange(e, 6)}
            className="w-full p-3 text-black rounded-md"
          >
            <option value="">Select Question Type</option>
            <option value="Multiple">Multiple Choice</option>
            <option value="TrueFalse">True/False</option>
          </select>

          {currentQuestion[6] === 'Multiple' &&
            [1, 2, 3, 4, 5].map((idx) => (
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
              {[1, 2, 3, 4, 5].map((idx) => (
                <option key={idx} value={currentQuestion[idx]}>
                  {currentQuestion[idx] || `Option ${idx}`}
                </option>
              ))}
            </select>
          )}

          {currentQuestion[6] === 'TrueFalse' && (
            <div className="space-x-4">
              <label>
                <input
                  type="radio"
                  value="True"
                  checked={currentQuestion[5] === 'True'}
                  onChange={(e) => handleQuestionChange(e, 5)}
                />{' '}
                True
              </label>
              <label>
                <input
                  type="radio"
                  value="False"
                  checked={currentQuestion[5] === 'False'}
                  onChange={(e) => handleQuestionChange(e, 5)}
                />{' '}
                False
              </label>
            </div>
          )}

          <input
            type="text"
            value={quizTags.join(' ')}
            onChange={updateQuizTags}
            className="w-full p-3 text-black rounded-md"
            placeholder="Enter tags (e.g. history sports)"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-6 mt-10">
          <button
            onClick={addCurrentQuestion}
            className="bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-md font-semibold"
          >
            Add Question
          </button>
          <button
            onClick={sendQuiz}
            className="bg-green-600 hover:bg-green-500 text-white py-3 rounded-md font-semibold"
          >
            Finish Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
