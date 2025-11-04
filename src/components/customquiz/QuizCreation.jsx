//This file handles creating the users custom quiz and making it able to be accessed within the product and database
import {useState, useEffect} from 'react'
import {useAuth} from '../../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

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
  const [currentQuestion, setCurrentQuestion] = useState(['', '', '', '', '', '', 'Multiple', '', 3]); // difficulty at index 8 as number
  const [selectedCorrectAnswers, setSelectedCorrectAnswers] = useState([false, false, false, false]);
  const [droppedOption, setDroppedOption] = useState('');
  const [rawTagsInput, setRawTagsInput] = useState('');
  const [numAnswers, setNumAnswers] = useState(4); // New state for answer count (2-4)
  const [questionDifficulty, setQuestionDifficulty] = useState(3); // New state for difficulty (1-5) as number

  // CSV Upload States
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadingCSV, setIsUploadingCSV] = useState(false);

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
    const optionsFilled = [1, 2, 3, 4].slice(0, numAnswers).every((idx) => question[idx].trim() !== '');

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
    setCurrentQuestion(['', '', '', '', '', '', 'Multiple', '', 3]); // Reset with default difficulty as number
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
      // Clear options beyond the new count
      for (let i = newCount + 1; i <= 4; i++) {
        updated[i] = '';
      }
      return updated;
    });
  };

  // Update question difficulty
  const updateQuestionDifficulty = (value) => {
    const validValue = !isNaN(value) && value >= 1 && value <= 5 ? value : 3;
    setQuestionDifficulty(validValue);
    setCurrentQuestion((prev) => {
      const updated = [...prev];
      updated[8] = validValue; // Update the difficulty index with valid number
      return updated;
    });
  };

  const getDifficultyLabel = (level) => {
    const labels = {
      1: 'Very Easy',
      2: 'Easy',
      3: 'Medium',
      4: 'Hard',
      5: 'Very Hard'
    };
    return labels[level] || 'Medium';
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        alert('Please select a valid CSV file');
        event.target.value = '';
      }
    }
  };

  const handleCSVUpload = async () => {
    if (!selectedFile) {
      alert('Please select a CSV file first');
      return;
    }

    setIsUploadingCSV(true);

    try {
      // Parse CSV file
      const text = await selectedFile.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        alert('CSV file appears to be empty or invalid');
        setIsUploadingCSV(false);
        return;
      }

      // Parse questions from CSV
      const questions = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV parsing (handle quoted values)
        const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(val =>
          val.replace(/^"|"$/g, '').trim()
        ) || [];

        if (values.length >= 6) {
          const question = [
            values[0] || '',  // question
            values[1] || '',  // option_1
            values[2] || '',  // option_2
            values[3] || '',  // option_3
            values[4] || '',  // option_4
            values[5] || '',  // correct_answer
            'Multiple',       // type
            '',              // explanation
            parseInt(values[6]) || 3  // difficulty
          ];
          questions.push(question);
        }
      }

      if (questions.length === 0) {
        alert('No valid questions found in CSV file');
        setIsUploadingCSV(false);
        return;
      }

      // Add all questions to quiz
      setQuizData(prev => [...prev, ...questions]);
      alert(`Successfully added ${questions.length} questions from CSV!`);

      // Clear file input
      setSelectedFile(null);
      const fileInput = document.getElementById('csv-file-input');
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Error uploading CSV:', error);
      alert('Error processing CSV file. Please check the format.');
    } finally {
      setIsUploadingCSV(false);
    }
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

            {selectedFile && (
              <button
                onClick={handleCSVUpload}
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
                value={teacherQuiz ? 'teachermade (no other tags can be added)' : rawTagsInput}
                onChange={updateQuizTags}
                className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                placeholder="Enter tags separated by commas (e.g. Computer Science, History, Sports)"
                disabled={teacherQuiz}
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
                  disabled={teacherQuiz && privateQuizPassword === 'teacherOnly'}
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
                  ℹ️ Teacher quizzes are automatically set to private.
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
          onChange={(e) => handleQuestionChange(e, 0)}
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
              onChange={(e) => handleQuestionChange(e, 6)}
              className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
            >
              <option value="Multiple">Multiple Choice</option>
              <option value="TrueFalse">True/False</option>
              <option value="FillInTheBlank">Fill in the Blank</option>
              <option value="MultipleAnswer">Multiple Answer</option>
              <option value="DragAndDrop">Drag and Drop</option>
            </select>
          </div>
        </div>
      </div>

      {/* Answer Options Card */}
      {(currentQuestion[6] === 'Multiple' || currentQuestion[6] === 'MultipleAnswer' || currentQuestion[6] === 'DragAndDrop') && (
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
                    onChange={(e) => handleQuestionChange(e, idx)}
                    className="flex-1 bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                    placeholder={`Option ${idx}`}
                  />
                  {currentQuestion[6] === 'MultipleAnswer' && (
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

          {currentQuestion[6] === 'DragAndDrop' && (
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
      {currentQuestion[6] === 'FillInTheBlank' && (
        <div className="bg-card border border-primary rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-primary mb-6">✍️ Correct Answer</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="text-secondary font-medium md:text-right">Answer:</label>
            <div className="md:col-span-3">
              <input
                type="text"
                value={currentQuestion[1]}
                onChange={(e) => handleQuestionChange(e, 1)}
                className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                placeholder="Enter the correct answer"
              />
            </div>
          </div>
        </div>
      )}

      {/* True/False Selection */}
      {currentQuestion[6] === 'TrueFalse' && (
        <div className="bg-card border border-primary rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-primary mb-6">✅ Correct Answer</h2>
          <div className="flex gap-6 justify-center">
            <label className="flex items-center gap-3 text-secondary cursor-pointer">
              <input
                type="radio"
                value="True"
                checked={currentQuestion[5] === 'True'}
                onChange={(e) => handleQuestionChange(e, 5)}
                className="w-5 h-5 text-accent bg-card border-primary focus:ring-accent"
              />
              <span className="text-lg">True</span>
            </label>
            <label className="flex items-center gap-3 text-secondary cursor-pointer">
              <input
                type="radio"
                value="False"
                checked={currentQuestion[5] === 'False'}
                onChange={(e) => handleQuestionChange(e, 5)}
                className="w-5 h-5 text-accent bg-card border-primary focus:ring-accent"
              />
              <span className="text-lg">False</span>
            </label>
          </div>
        </div>
      )}

      {/* Correct Answer Selection (Multiple Choice) */}
      {currentQuestion[6] === 'Multiple' && (
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
                  onChange={(e) => handleQuestionChange(e, 5)}
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
      {currentQuestion[6] === 'DragAndDrop' && (
        <div className="bg-card border border-primary rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-primary mb-6">✅ Correct Answer</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="text-secondary font-medium md:text-right">Answer:</label>
            <div className="md:col-span-3">
              <input
                type="text"
                value={currentQuestion[5]}
                onChange={(e) => handleQuestionChange(e, 5)}
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