/**
 * Quiz Creation Component - Refactored with custom hooks and utilities
 * This file handles creating the user's custom quiz
 */

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

// Custom Hooks
import { useQuestionForm } from '../../hooks/useQuestionForm';
import { useCSVUpload } from '../../hooks/useCSVUpload';

// Utilities
import { QUESTION_TYPES, getDifficultyLabel } from '../../utils/questionTypes';
import { processTagsFromInput } from '../../utils/tagProcessor';

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

  // Question form hook
  const {
    currentQuestion,
    selectedCorrectAnswers,
    droppedOption,
    numAnswers,
    questionDifficulty,
    setSelectedCorrectAnswers,
    setDroppedOption,
    handleQuestionChange,
    updateNumAnswers,
    updateQuestionDifficulty,
    resetQuestionForm,
    validateCurrentQuestion,
    getCurrentQuestionData
  } = useQuestionForm();

  // CSV upload hook
  const {
    selectedFile,
    isUploadingCSV,
    uploadError,
    handleFileSelect,
    handleCSVUpload: performCSVUpload
  } = useCSVUpload((questions) => {
    setQuizData(prev => [...prev, ...questions]);
  });

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

  // Add question to quiz
  const addCurrentQuestion = () => {
    if (!validateCurrentQuestion()) {
      alert('Please fill out all inputs for the question.');
      return;
    }

    const question = getCurrentQuestionData();
    setQuizData((prev) => [...prev, question]);
    resetQuestionForm();
    
    // Reset multiple answer selections
    setSelectedCorrectAnswers([false, false, false, false]);
    setDroppedOption('');
  };

  // Handle quiz name change
  const handleQuizNameChange = (e) => setQuizName(e.target.value);

  // Handle quiz password change
  const handleQuizPasswordChange = (e) => setPrivateQuizPassword(e.target.value);

  // Handle private quiz toggle
  const handlePrivateQuizChange = (e) => {
    const value = e.target.value === 'yes';
    if (!teacherQuiz) setPrivateQuiz(value);
  };

  // Handle teacher quiz toggle
  const handleTeacherQuizChange = (e) => {
    const value = e.target.value === 'yes';
    setTeacherQuiz(value);
    if (value) {
      setPrivateQuiz(true);
      if (!privateQuizPassword || privateQuizPassword === 'teacherOnly') {
        setPrivateQuizPassword('');
      }
    } else {
      setPrivateQuiz(false);
      setPrivateQuizPassword('');
    }
  };

  // Handle tags input
  const [rawTagsInput, setRawTagsInputLocal] = useState('');
  const updateQuizTags = (e) => {
    const inputValue = e.target.value;
    setRawTagsInputLocal(inputValue);
    const processedTags = processTagsFromInput(inputValue);
    setQuizTags(processedTags);
  };

  return (
    <div className="space-y-8">
      {/* CSV Bulk Upload Card - Mobile Optimized */}
      <div className="bg-card border border-primary rounded-xl p-6 md:p-8 shadow-lg">
        <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4 md:mb-6">📤 Bulk Upload from CSV</h2>
        <p className="text-sm md:text-base text-secondary mb-4 md:mb-6">
          Upload a CSV file with multiple questions to add them all at once.
        </p>

        <div className="space-y-4">
          {/* Mobile-friendly file input */}
          <div className="space-y-3">
            <label
              htmlFor="csv-file-input"
              className="block w-full px-4 py-3 bg-accent hover:bg-accent-hover text-white text-center rounded-lg font-medium transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg"
            >
              {selectedFile ? `📄 ${selectedFile.name}` : '📁 Choose CSV File'}
            </label>
            <input
              id="csv-file-input"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileSelect}
              disabled={isUploadingCSV}
              className="hidden"
            />

            {uploadError && (
              <p className="text-sm text-error">{uploadError}</p>
            )}

            {selectedFile && (
              <button
                onClick={performCSVUpload}
                disabled={isUploadingCSV}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploadingCSV ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  '⬆️ Upload CSV'
                )}
              </button>
            )}
          </div>

          {/* CSV Format Info - Collapsible on mobile */}
          <details className="p-4 bg-secondary rounded-lg border border-primary">
            <summary className="font-semibold text-primary cursor-pointer text-sm md:text-base">
              📋 CSV Format Requirements
            </summary>
            <div className="mt-3 space-y-2 text-xs md:text-sm text-secondary">
              <p>Your CSV must have these columns in order:</p>
              <code className="block bg-primary text-secondary px-2 py-1 rounded overflow-x-auto text-xs">
                question,option_1,option_2,option_3,option_4,correct_answer,difficulty
              </code>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>difficulty</strong>: 1-5 (1 = easiest, 5 = hardest)</li>
                <li><strong>correct_answer</strong>: Must match one of the options exactly</li>
                <li>First row should be headers (will be skipped)</li>
              </ul>
            </div>
          </details>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 border-t border-primary"></div>
        <span className="text-secondary font-medium text-sm md:text-base">OR Add Questions Manually</span>
        <div className="flex-1 border-t border-primary"></div>
      </div>

      {/* Quiz Settings Card */}
      <div className="bg-card border border-primary rounded-xl p-6 md:p-8 shadow-lg">
        <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4 md:mb-6">⚙️ Quiz Settings</h2>

        <div className="space-y-6">
          {/* Quiz Name */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="text-secondary font-medium md:text-right">Quiz Name:</label>
            <div className="md:col-span-3">
              <input
                type="text"
                value={quizName}
                onChange={handleQuizNameChange}
                className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                placeholder="Enter your quiz name"
              />
            </div>
          </div>

          {/* Quiz Tags */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="text-secondary font-medium md:text-right">Quiz Tags:</label>
            <div className="md:col-span-3">
              <input
                type="text"
                value={rawTagsInput}
                onChange={updateQuizTags}
                className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                placeholder="Enter tags separated by commas (e.g. Computer Science, History, Sports)"
              />
            </div>
          </div>

          {/* Private Quiz */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="text-secondary font-medium md:text-right">Private Quiz?</label>
            <div className="md:col-span-3">
              <select
                onChange={handlePrivateQuizChange}
                className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                value={privateQuiz ? 'yes' : 'no'}
                disabled={teacherQuiz}
              >
                <option value="no">No - Anyone can access</option>
                <option value="yes">Yes - Requires password</option>
              </select>
            </div>
          </div>

          {/* Password Field (conditional) */}
          {privateQuiz && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <label className="text-secondary font-medium md:text-right">Password:</label>
              <div className="md:col-span-3">
                <input
                  type="text"
                  value={privateQuizPassword}
                  onChange={handleQuizPasswordChange}
                  className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                  placeholder="Enter password for quiz access"
                />
              </div>
            </div>
          )}

          {/* Teacher Quiz */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="text-secondary font-medium md:text-right">Teacher Quiz?</label>
            <div className="md:col-span-3">
              <select
                onChange={handleTeacherQuizChange}
                className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                value={teacherQuiz ? 'yes' : 'no'}
              >
                <option value="no">No</option>
                <option value="yes">Yes - Auto-private with teacher tag</option>
              </select>
              {teacherQuiz && (
                <p className="text-sm text-accent mt-2">
                  ℹ️ Teacher quizzes are automatically set to private. You can set your own password.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-card border border-primary rounded-xl p-8 shadow-lg">
        <h2 className="text-2xl font-semibold text-primary mb-6">❓ Question</h2>
        <input
          id="question"
          type="text"
          placeholder="Enter your question"
          value={currentQuestion[0]}
          onChange={(e) => handleQuestionChange(e.target.value, 0)}
          className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
        />
      </div>

      {/* Question Type Card */}
      <div className="bg-card border border-primary rounded-xl p-8 shadow-lg">
        <h2 className="text-2xl font-semibold text-primary mb-6">📝 Question Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <label className="text-secondary font-medium md:text-right">Type:</label>
          <div className="md:col-span-3">
            <select
              value={currentQuestion[6]}
              onChange={(e) => handleQuestionChange(e.target.value, 6)}
              className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
            >
              <option value={QUESTION_TYPES.MULTIPLE_CHOICE}>Multiple Choice</option>
              <option value={QUESTION_TYPES.TRUE_FALSE}>True/False</option>
              <option value={QUESTION_TYPES.FILL_IN_BLANK}>Fill in the Blank</option>
              <option value={QUESTION_TYPES.MULTIPLE_ANSWER}>Multiple Answer</option>
              <option value={QUESTION_TYPES.DRAG_AND_DROP}>Drag and Drop</option>
            </select>
          </div>
        </div>
      </div>

      {/* Answer Options Card */}
      {(currentQuestion[6] === QUESTION_TYPES.MULTIPLE_CHOICE || 
        currentQuestion[6] === QUESTION_TYPES.MULTIPLE_ANSWER || 
        currentQuestion[6] === QUESTION_TYPES.DRAG_AND_DROP) && (
        <div className="bg-card border border-primary rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-primary mb-6">📋 Answer Options</h2>

          {/* Number of Answers Selector */}
          <div className="mb-6">
            <label className="block text-secondary font-medium mb-2">Number of Answer Options</label>
            <select
              value={numAnswers}
              onChange={(e) => updateNumAnswers(parseInt(e.target.value, 10))}
              className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
            >
              <option value={2}>2 Answers</option>
              <option value={3}>3 Answers</option>
              <option value={4}>4 Answers</option>
            </select>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4].slice(0, numAnswers).map((idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <label className="text-secondary font-medium md:text-right">
                  Option {idx}:
                </label>
                <div className="md:col-span-3 flex gap-2">
                  <input
                    type="text"
                    value={currentQuestion[idx]}
                    onChange={(e) => handleQuestionChange(e.target.value, idx)}
                    className="flex-1 bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                    placeholder={`Option ${idx}`}
                  />
                  {currentQuestion[6] === QUESTION_TYPES.MULTIPLE_ANSWER && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCorrectAnswers[idx - 1]}
                        onChange={() => {
                          const newSelected = [...selectedCorrectAnswers];
                          newSelected[idx - 1] = !newSelected[idx - 1];
                          setSelectedCorrectAnswers(newSelected);
                        }}
                        className="w-5 h-5 text-accent bg-card border-primary rounded focus:ring-accent"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {currentQuestion[6] === QUESTION_TYPES.DRAG_AND_DROP && (
            <div className="mt-6 space-y-4">
              <p className="text-secondary text-sm">
                💡 Drag and drop requires [blank] in your question text. Users will drag the correct option.
              </p>
              <div
                className="w-full min-h-[4rem] flex items-center justify-center border-2 border-dashed border-accent rounded-lg bg-secondary text-center p-4"
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
                    : 'Your question must include [blank]'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fill in the Blank */}
      {currentQuestion[6] === QUESTION_TYPES.FILL_IN_BLANK && (
        <div className="bg-card border border-primary rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-primary mb-6">✍️ Correct Answer</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="text-secondary font-medium md:text-right">Answer:</label>
            <div className="md:col-span-3">
              <input
                type="text"
                value={currentQuestion[1]}
                onChange={(e) => handleQuestionChange(e.target.value, 1)}
                className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                placeholder="Enter the correct answer"
              />
            </div>
          </div>
        </div>
      )}

      {/* True/False Selection */}
      {currentQuestion[6] === QUESTION_TYPES.TRUE_FALSE && (
        <div className="bg-card border border-primary rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-primary mb-6">✅ Correct Answer</h2>
          <div className="flex gap-6 justify-center">
            <label className="flex items-center gap-3 text-secondary cursor-pointer">
              <input
                type="radio"
                value="True"
                checked={currentQuestion[5] === 'True'}
                onChange={(e) => handleQuestionChange(e.target.value, 5)}
                className="w-5 h-5 text-accent bg-card border-primary focus:ring-accent"
              />
              <span className="text-lg">True</span>
            </label>
            <label className="flex items-center gap-3 text-secondary cursor-pointer">
              <input
                type="radio"
                value="False"
                checked={currentQuestion[5] === 'False'}
                onChange={(e) => handleQuestionChange(e.target.value, 5)}
                className="w-5 h-5 text-accent bg-card border-primary focus:ring-accent"
              />
              <span className="text-lg">False</span>
            </label>
          </div>
        </div>
      )}

      {/* Correct Answer Selection (Multiple Choice) */}
      {currentQuestion[6] === QUESTION_TYPES.MULTIPLE_CHOICE && (
        <div className="bg-card border border-primary rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-primary mb-6">✅ Correct Answer</h2>
          <div className="space-y-6">
            {/* Dropdown */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <label className="text-secondary font-medium md:text-right">
                Select correct option:
              </label>
              <div className="md:col-span-3">
                <select
                  value={currentQuestion[5]}
                  onChange={(e) => handleQuestionChange(e.target.value, 5)}
                  className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                >
                  <option value="">Select correct answer</option>
                  {[1, 2, 3, 4].slice(0, numAnswers).map((idx) => (
                    <option key={idx} value={currentQuestion[idx]}>
                      {currentQuestion[idx] || `Option ${idx}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Correct Answer for Drag and Drop */}
      {currentQuestion[6] === QUESTION_TYPES.DRAG_AND_DROP && (
        <div className="bg-card border border-primary rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-primary mb-6">✅ Correct Answer</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="text-secondary font-medium md:text-right">Answer:</label>
            <div className="md:col-span-3">
              <input
                type="text"
                value={currentQuestion[5]}
                onChange={(e) => handleQuestionChange(e.target.value, 5)}
                className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                placeholder="Correct answer (must match one of the options)"
              />
            </div>
          </div>
        </div>
      )}

      {/* Difficulty Card */}
      <div className="bg-card border border-primary rounded-xl p-8 shadow-lg">
        <h2 className="text-2xl font-semibold text-primary mb-6">🎯 Difficulty Level</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <label className="text-secondary font-medium md:text-right">
            Difficulty:
            <br />
            <span className="text-sm text-muted">(1 = easiest, 5 = hardest)</span>
          </label>
          <div className="md:col-span-3 space-y-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => updateQuestionDifficulty(level)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 border-2 ${
                    questionDifficulty === level
                      ? 'bg-accent text-white border-accent shadow-lg scale-105'
                      : 'bg-card text-secondary border-primary hover:border-accent hover:bg-secondary'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="text-center">
              <span className="text-accent font-semibold text-lg">
                {getDifficultyLabel(questionDifficulty)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={addCurrentQuestion}
          className="flex-1 px-8 py-4 bg-accent hover:bg-accent-hover text-white rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] border-2 border-accent"
        >
          ➕ Add Question to Quiz
        </button>
        <button
          onClick={sendQuiz}
          disabled={isCreatingQuiz}
          className={`flex-1 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] border-2 flex items-center justify-center gap-3 ${
            isCreatingQuiz 
              ? 'bg-gray-400 border-gray-400 text-gray-200 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 text-white border-green-600'
          }`}
        >
          {isCreatingQuiz ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Quiz...
            </>
          ) : (
            '✅ Finish & Create Quiz'
          )}
        </button>
      </div>
    </div>
  );
}
