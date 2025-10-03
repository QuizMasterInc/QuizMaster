import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { parseCSV, bulkUploadQuestions, downloadCSVTemplate } from '../../utils/csvUploader';

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

  // CSV Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

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
    // Create question with BOTH field name formats for compatibility
    const questionToUpload = {
      question: question.question,
      // New format (short names)
      a: question.a,
      b: question.b,
      c: question.c,
      d: question.d,
      correct: question.correct,
      // Old format (option_X and correct_answer) for backward compatibility
      option_1: question.a,
      option_2: question.b,
      option_3: question.c,
      option_4: question.d,
      correct_answer: question.correct,
      // Other fields
      category: question.category.toLowerCase(), // Store as lowercase for consistency
      'sub-category': question['sub-category'],
      difficulty: question.difficulty,
      type: 'Multiple' // Default type
    };

    const encodedQuestion = encodeURIComponent(JSON.stringify(questionToUpload));
    await fetch(`https://us-central1-quizmaster-c66a2.cloudfunctions.net/addDefaultQuestion?question=${encodedQuestion}`);
    console.log('Added Question!');
    setIsQuizAdded(true);
    setTimeout(() => setIsQuizAdded(false), 20000);
    resetQuestion();
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setUploadResults(null);
    } else {
      alert('Please select a valid CSV file');
      event.target.value = '';
    }
  };

  const handleCSVUpload = async () => {
    if (!selectedFile) {
      alert('Please select a CSV file first');
      return;
    }

    setIsUploading(true);
    setUploadResults(null);

    try {
      // Parse CSV
      const parseResult = await parseCSV(selectedFile);

      if (!parseResult.success) {
        alert(`Error parsing CSV: ${parseResult.error}`);
        setIsUploading(false);
        return;
      }

      console.log(`Parsed ${parseResult.count} questions from CSV`);

      // Upload questions
      const uploadResult = await bulkUploadQuestions(parseResult.questions);

      setUploadResults(uploadResult);
      setSelectedFile(null);

      // Clear file input
      const fileInput = document.getElementById('csv-file-input');
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Upload error:', error);
      alert(`Error: ${error.error || error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary text-primary px-6 py-16">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-gradient-primary text-5xl font-bold tracking-wide">Add to Default Quizzes</h1>
          <p className="text-secondary text-lg">Fill in the details below to add a question to the database.</p>
        </div>

        {/* CSV Bulk Upload Card */}
        <div className="bg-card border border-primary rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-primary mb-6">📤 Bulk Upload from CSV</h2>
          <p className="text-secondary mb-6">
            Upload a CSV file with multiple questions to add them all at once.
            <button
              onClick={downloadCSVTemplate}
              className="text-accent hover:text-accent-hover underline ml-2"
            >
              Download template
            </button>
          </p>

          <div className="space-y-4">
            {/* File Input */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <input
                id="csv-file-input"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="flex-1 bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-accent file:text-white file:cursor-pointer hover:file:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleCSVUpload}
                disabled={!selectedFile || isUploading}
                className="bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isUploading ? 'Uploading...' : 'Upload CSV'}
              </button>
            </div>

            {/* Selected File Display */}
            {selectedFile && (
              <div className="text-secondary text-sm">
                Selected file: <span className="font-semibold">{selectedFile.name}</span>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="flex items-center gap-3 text-accent">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent"></div>
                <span className="font-medium">Processing questions...</span>
              </div>
            )}

            {/* Upload Results */}
            {uploadResults && (
              <div className={`p-4 rounded-lg border ${
                uploadResults.failed === 0 && uploadResults.duplicates === 0
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400' 
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-700 dark:text-yellow-400'
              }`}>
                <h3 className="font-semibold mb-2">Upload Results:</h3>
                <ul className="space-y-1 text-sm">
                  <li>✓ Total questions: {uploadResults.total}</li>
                  <li>✓ Successfully added: {uploadResults.successful}</li>
                  {uploadResults.duplicates > 0 && (
                    <>
                      <li className="text-orange-600 dark:text-orange-400">⚠ Duplicates skipped: {uploadResults.duplicates}</li>
                      {uploadResults.duplicateQuestions.length > 0 && (
                        <li className="mt-2">
                          <details>
                            <summary className="cursor-pointer font-medium">View duplicate questions</summary>
                            <ul className="mt-2 pl-4 space-y-2 max-h-40 overflow-y-auto">
                              {uploadResults.duplicateQuestions.map((dup, index) => (
                                <li key={index} className="text-xs">
                                  • Row {dup.index}: "{dup.question}"
                                  <br />
                                  <span className="ml-2 text-secondary">Category: {dup.category} / {dup.subCategory}</span>
                                </li>
                              ))}
                            </ul>
                          </details>
                        </li>
                      )}
                    </>
                  )}
                  {uploadResults.failed > 0 && (
                    <>
                      <li>✗ Failed: {uploadResults.failed}</li>
                      {uploadResults.errors.length > 0 && (
                        <li className="mt-2">
                          <details>
                            <summary className="cursor-pointer">View errors</summary>
                            <ul className="mt-2 pl-4 space-y-1">
                              {uploadResults.errors.map((error, index) => (
                                <li key={index}>• {error}</li>
                              ))}
                            </ul>
                          </details>
                        </li>
                      )}
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* CSV Format Info */}
          <div className="mt-6 p-4 bg-secondary rounded-lg border border-primary">
            <h4 className="font-semibold text-primary mb-2">CSV Format Requirements:</h4>
            <p className="text-secondary text-sm mb-2">Your CSV must have these columns:</p>
            <code className="text-xs bg-primary text-secondary px-2 py-1 rounded block overflow-x-auto">
              question,a,b,c,d,correct,category,sub-category,difficulty
            </code>
            <ul className="text-secondary text-sm mt-2 space-y-1 list-disc list-inside">
              <li><strong>difficulty</strong>: 1-5 (1 = easiest, 5 = hardest)</li>
              <li><strong>correct</strong>: Must match one of the answers exactly.</li>
              <li><strong>sub-category</strong>: EXAMPLES: baseball or movies.</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 border-t border-primary"></div>
          <span className="text-secondary font-medium">OR</span>
          <div className="flex-1 border-t border-primary"></div>
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
