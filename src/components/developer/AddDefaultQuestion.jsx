import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

// TODO: add two check marks to retain both category and subcategory on submit

const AddDefaultQuestion = () => {
  const { currentUser } = useAuth();
  const [question, setQuestion] = useState({
    a: '',
    b: '',
    c: '',
    d: '',
    correct: '',
    category: '',
    difficulty: 0,
    question: '',
    'sub-category': ''
  });

  const quizAttributes = ['a', 'b', 'c', 'd', 'category', 'sub-category'];
  const placeholders = ['a', 'b', 'c', 'd', 'Category: e.g. history', 'Sub-category: e.g. ancient'];
  const [isQuizAdded, setIsQuizAdded] = useState(false);

  const updateQuestion = (key, value) => {
    setQuestion((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const resetQuestion = () => {
    setQuestion({
      a: '',
      b: '',
      c: '',
      d: '',
      correct: '',
      category: '',
      difficulty: 0,
      question: '',
      'sub-category': ''
    });
  };

  const inputField = ({ key, placeholder, className }) => (
    <input
      id={key}
      type="text"
      placeholder={placeholder}
      value={question[key]}
      onChange={(e) => updateQuestion(key, e.target.value)}
      className={`${className} bg-[#0e0d22] text-white border border-gray-600 text-lg mb-4 rounded-md h-11 p-4 focus:scale-105 focus:ring-2 focus:ring-blue-500 transition duration-300`}
    />
  );

  async function addDefaultQuestion() {
    const encodedQuestion = encodeURIComponent(JSON.stringify(question));
    await fetch(`https://us-central1-quizmaster-c66a2.cloudfunctions.net/addDefaultQuestion?question=${encodedQuestion}`);
    console.log('Added Question!');
    setIsQuizAdded(true);
    setTimeout(() => setIsQuizAdded(false), 20000);
    resetQuestion();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#141432] via-[#0f0f1f] to-[#1f1f5c] px-6 py-12 flex justify-center items-center text-white">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Add to Default Quizzes!</h1>
          <p className="text-sm text-gray-400">Fill in the details below to add a question.</p>
        </div>

        {/* Question Input */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Type Your Question</h2>
          {inputField({ key: 'question', placeholder: 'Enter your question', className: 'w-full' })}
        </div>

        {/* Quiz Attributes */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Add Quiz Attributes</h2>
          <div className="space-y-4">
            {quizAttributes.map((key, index) => (
              <div key={key} className="grid grid-cols-3 gap-4 items-center">
                <label className="text-right text-sm text-gray-300">
                  {key} (value):
                </label>
                {inputField({ key: key, placeholder: placeholders[index], className: 'col-span-2' })}
              </div>
            ))}
          </div>
        </div>

        <hr className="border-gray-600 my-6" />

        {/* Correct Answer Input (Text + Datalist) */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 items-start">
            <label className="text-right text-sm text-gray-300">
              correct [option] val:
              <br />
              <span className="text-gray-400 text-xs">(will autopopulate with a-d)</span>
            </label>
            <input
              id="correct"
              value={question['correct']}
              onChange={(e) => updateQuestion('correct', e.target.value)}
              className="col-span-2 bg-[#0e0d22] text-white border border-gray-600 rounded-md p-3 focus:scale-105 focus:ring-2 focus:ring-blue-500 transition duration-300"
              list="option-list"
            />
            <datalist id="option-list">
              <option value={question['a']}>{'a. ' + question['a']}</option>
              <option value={question['b']}>{'b. ' + question['b']}</option>
              <option value={question['c']}>{'c. ' + question['c']}</option>
              <option value={question['d']}>{'d. ' + question['d']}</option>
            </datalist>
          </div>

          {/* Correct Dropdown */}
          <div className="grid grid-cols-3 gap-4 items-start">
            <label className="text-right text-sm text-gray-300">
              correct [dropdown] val:
              <br />
              <span className="text-gray-400 text-xs">(will autopopulate with a-d)</span>
            </label>
            <select
              onChange={(e) => updateQuestion('correct', e.target.value)}
              className="col-span-2 bg-[#0e0d22] text-white border border-gray-600 rounded-md p-3 focus:scale-105 focus:ring-2 focus:ring-blue-500 transition duration-300"
            >
              <option value={question['a']}>{'a. ' + question['a']}</option>
              <option value={question['b']}>{'b. ' + question['b']}</option>
              <option value={question['c']}>{'c. ' + question['c']}</option>
              <option value={question['d']}>{'d. ' + question['d']}</option>
            </select>
          </div>
        </div>

        <hr className="border-gray-600 my-6" />

        {/* Difficulty Input */}
        <div className="grid grid-cols-3 gap-4 items-start">
          <label className="text-right text-sm text-gray-300">
            difficulty value:
            <br />
            <span className="text-gray-400 text-xs">(0 is easiest, 5 is hardest)</span>
          </label>
          <input
            id="difficulty"
            type="number"
            value={question['difficulty']}
            onChange={(e) => updateQuestion('difficulty', e.target.value)}
            className="col-span-2 bg-[#0e0d22] text-white border border-gray-600 rounded-md p-3 focus:scale-105 focus:ring-2 focus:ring-blue-500 transition duration-300"
            min={0}
            max={5}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6 mt-8 flex-wrap">
          <button
            onClick={addDefaultQuestion}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-full shadow-md transition duration-200"
          >
            Add Question
          </button>
          <Link to="/quizzes">
            <div className="bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-full shadow-md transition duration-200">
              Take a premade quiz!
            </div>
          </Link>
        </div>

        {isQuizAdded && (
          <p className="text-center text-green-400 mt-4">Question has been added!</p>
        )}
      </div>
    </div>
  );
};

export default AddDefaultQuestion;
