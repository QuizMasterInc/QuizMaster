/**
 * Custom hook for handling CSV file upload
 */

import { useState } from 'react';
import { validateCSVFile, parseCSVQuestions } from '../utils/csvParser';

export const useCSVUpload = (onQuestionsAdded) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadingCSV, setIsUploadingCSV] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setUploadError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validation = validateCSVFile(file);
    if (!validation.valid) {
      setUploadError(validation.error);
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleCSVUpload = async () => {
    if (!selectedFile) {
      alert('Please select a CSV file first');
      return;
    }

    setIsUploadingCSV(true);
    setUploadError(null);

    try {
      // Read file content
      const text = await selectedFile.text();
      
      // Parse CSV
      const { questions, errors, count } = parseCSVQuestions(text);

      if (errors.length > 0) {
        console.warn('CSV parsing warnings:', errors);
      }

      if (count === 0) {
        setUploadError('No valid questions found in CSV file');
        setIsUploadingCSV(false);
        return;
      }

      // Add questions via callback
      if (onQuestionsAdded) {
        onQuestionsAdded(questions);
      }

      alert(`Successfully added ${count} questions from CSV!`);

      // Clear file input
      clearFileInput();

    } catch (error) {
      console.error('Error uploading CSV:', error);
      setUploadError('Error processing CSV file. Please check the format.');
    } finally {
      setIsUploadingCSV(false);
    }
  };

  const clearFileInput = () => {
    setSelectedFile(null);
    setUploadError(null);
    const fileInput = document.getElementById('csv-file-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return {
    selectedFile,
    isUploadingCSV,
    uploadError,
    handleFileSelect,
    handleCSVUpload,
    clearFileInput
  };
};
