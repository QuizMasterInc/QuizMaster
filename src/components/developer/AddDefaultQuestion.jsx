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
      className={`${className} bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200`}
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
    <div className="min-h-screen bg-primary text-primary px-6 py-16">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-gradient-primary text-5xl font-bold tracking-wide">Add to Default Quizzes</h1>
          <p className="text-secondary text-lg">Fill in the details below to add a question to the database.</p>
        </div>

        {/* Question Input Card */}
        <div className="bg-card border border-primary rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-primary mb-6">Question</h2>
          {inputField({ key: 'question', placeholder: 'Enter your question', className: 'w-full' })}
        </div>

        {/* Quiz Attributes Card */}
        <div className="bg-card border border-primary rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-primary mb-6">Answer Options</h2>
          <div className="space-y-4">
            {quizAttributes.map((key, index) => (
              <div key={key} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <label className="text-secondary font-medium md:text-right">
                  {key}:
                </label>
                <div className="md:col-span-3">
                  {inputField({ key: key, placeholder: placeholders[index], className: 'w-full' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Correct Answer Card */}
        <div className="bg-card border border-primary rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-primary mb-6">Correct Answer</h2>
          <div className="space-y-6">

            {/* Text Input with Datalist */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              <label className="text-secondary font-medium md:text-right">
                Select correct option:
                <br />
                <span className="text-sm text-muted">(text input)</span>
              </label>
              <div className="md:col-span-3">
                <input
                  id="correct"
                  value={question['correct']}
                  onChange={(e) => updateQuestion('correct', e.target.value)}
                  className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                  list="option-list"
                />
                <datalist id="option-list">
                  <option value={question['a']}>{'a. ' + question['a']}</option>
                  <option value={question['b']}>{'b. ' + question['b']}</option>
                  <option value={question['c']}>{'c. ' + question['c']}</option>
                  <option value={question['d']}>{'d. ' + question['d']}</option>
                </datalist>
              </div>
            </div>

            {/* Dropdown */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              <label className="text-secondary font-medium md:text-right">
                Select correct option:
                <br />
                <span className="text-sm text-muted">(dropdown)</span>
              </label>
              <div className="md:col-span-3">
                <select
                  onChange={(e) => updateQuestion('correct', e.target.value)}
                  className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                >
                  <option value={question['a']}>{'a. ' + question['a']}</option>
                  <option value={question['b']}>{'b. ' + question['b']}</option>
                  <option value={question['c']}>{'c. ' + question['c']}</option>
                  <option value={question['d']}>{'d. ' + question['d']}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Difficulty Card */}
        <div className="bg-card border border-primary rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-primary mb-6">Difficulty Level</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="text-secondary font-medium md:text-right">
              Difficulty:
              <br />
              <span className="text-sm text-muted">(0 = easiest, 5 = hardest)</span>
            </label>
            <div className="md:col-span-3">
              <input
                id="difficulty"
                type="number"
                value={question['difficulty']}
                onChange={(e) => updateQuestion('difficulty', e.target.value)}
                className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                min={0}
                max={5}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6 mt-8 flex-wrap">
          <button
            onClick={addDefaultQuestion}
            className="bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
          >
            Add Question
          </button>
          <Link to="/quizzes">
            <button className="bg-secondary text-primary font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg border border-primary">
              Take a Premade Quiz
            </button>
          </Link>
        </div>

        {/* Success Message */}
        {isQuizAdded && (
          <div className="text-center mt-6">
            <p className="text-green-500 dark:text-green-400 text-lg font-semibold">✓ Question has been added successfully!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddDefaultQuestion;
