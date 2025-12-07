/**
 * Custom hook for handling CSV file upload
 */

import { useState } from "react";
import { validateCSVFile, parseCSVQuestions } from "../utils/csvParser";

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
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleCSVUpload = async () => {
    if (!selectedFile) {
      alert("Please select a CSV file first");
      return;
    }

    setIsUploadingCSV(true);
    setUploadError(null);

    try {
      const text = await selectedFile.text();
      const { questions, errors, count } = parseCSVQuestions(text);

      if (errors.length > 0) console.warn("CSV warnings:", errors);

      if (count === 0) {
        setUploadError("No valid questions found in CSV file");
        setIsUploadingCSV(false);
        return;
      }

      // 🔥 Normalize keys to avoid undefined
      const normalized = questions.map((q) => {
        const cleaned = {};
        Object.keys(q).forEach((key) => {
          cleaned[key.trim().toLowerCase()] = q[key];
        });
        return cleaned;
      });

      onQuestionsAdded(normalized);
      alert(`Successfully added ${count} questions from CSV!`);

      clearFileInput();
    } catch (error) {
      console.error("CSV Upload Error:", error);
      setUploadError("Error processing CSV file. Please check the format.");
    } finally {
      setIsUploadingCSV(false);
    }
  };

  const clearFileInput = () => {
    setSelectedFile(null);
    setUploadError(null);

    const fileInput = document.getElementById("csv-file-input");
    if (fileInput) fileInput.value = "";
  };

  return {
    selectedFile,
    isUploadingCSV,
    uploadError,
    handleFileSelect,
    handleCSVUpload,
    clearFileInput,
  };
};
