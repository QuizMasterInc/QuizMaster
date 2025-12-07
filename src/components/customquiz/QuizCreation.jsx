/**
 * Quiz Creation Component - Refactored with focused sub-components
 * This file orchestrates the quiz creation workflow
 */

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

// Custom Hooks
import { useQuestionForm } from '../../hooks/useQuestionForm';
import { useCSVUpload } from '../../hooks/useCSVUpload';

// Sub-components
import QuizMetadataForm from './forms/QuizMetadataForm';
import QuizSettingsForm from './forms/QuizSettingsForm';
import CSVUploadSection from './forms/CSVUploadSection';
import QuestionCreationForm from './forms/QuestionCreationForm';
import DifficultySelector from './forms/DifficultySelector';

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

  // Handle category/tag selection
  const [selectedCategories, setSelectedCategories] = useState([]);
  const updateQuizTags = (e) => {
    const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setSelectedCategories(options);
    setQuizTags(options);
  };

  // Helper for category selection validation
  const isCategorySelected = selectedCategories.length > 0;
  const [showCategoryError, setShowCategoryError] = useState(false);

  // Wrap sendQuiz to add validation
  const handleSendQuiz = () => {
    if (!isCategorySelected) {
      setShowCategoryError(true);
      return;
    }
    setShowCategoryError(false);
    sendQuiz();
  };

  return (
    <div className="space-y-8">
      {/* CSV Bulk Upload */}
      <CSVUploadSection
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        onUpload={performCSVUpload}
        isUploading={isUploadingCSV}
        uploadError={uploadError}
      />

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 border-t border-primary"></div>
        <span className="text-secondary font-medium text-sm md:text-base">OR Add Questions Manually</span>
        <div className="flex-1 border-t border-primary"></div>
      </div>

      {/* Quiz Metadata */}
      <QuizMetadataForm
        quizName={quizName}
        onQuizNameChange={handleQuizNameChange}
        selectedCategories={selectedCategories}
        onCategoryChange={updateQuizTags}
        showCategoryError={showCategoryError}
      />

      {/* Quiz Settings */}
      <QuizSettingsForm
        privateQuiz={privateQuiz}
        onPrivateQuizChange={handlePrivateQuizChange}
        privateQuizPassword={privateQuizPassword}
        onPasswordChange={handleQuizPasswordChange}
        teacherQuiz={teacherQuiz}
        onTeacherQuizChange={handleTeacherQuizChange}
      />

      {/* Question Creation */}
      <QuestionCreationForm
        currentQuestion={currentQuestion}
        onQuestionChange={handleQuestionChange}
        numAnswers={numAnswers}
        onNumAnswersChange={updateNumAnswers}
        selectedCorrectAnswers={selectedCorrectAnswers}
        onCorrectAnswersChange={setSelectedCorrectAnswers}
      />

      {/* Difficulty Selector */}
      <DifficultySelector
        difficulty={questionDifficulty}
        onDifficultyChange={updateQuestionDifficulty}
      />

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={addCurrentQuestion}
          className="flex-1 px-8 py-4 bg-accent hover:bg-accent-hover text-white rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] border-2 border-accent"
        >
          ➕ Add Question to Quiz
        </button>
        <button
          onClick={handleSendQuiz}
          disabled={isCreatingQuiz || !isCategorySelected}
          className={`flex-1 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] border-2 flex items-center justify-center gap-3 ${
            isCreatingQuiz || !isCategorySelected
              ? 'bg-gray-400 border-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white border-green-600'
          }`}
          title={!isCategorySelected ? 'Please select at least one category/tag for your quiz. If nothing matches, select "Other".' : ''}
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
        {showCategoryError && !isCategorySelected && (
          <div className="w-full text-center text-error text-sm mt-2">Please select at least one category/tag for your quiz.</div>
        )}
      </div>
    </div>
  );
}
