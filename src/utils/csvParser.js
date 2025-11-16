/**
 * CSV parsing utilities for quiz questions
 */

import { validateCSVQuestion } from './questionValidator';

/**
 * Parse a single CSV line handling quoted values
 * @param {string} line - CSV line to parse
 * @returns {Array<string>} Array of values
 */
const parseCSVLine = (line) => {
  const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
  return values ? values.map(val => val.replace(/^"|"$/g, '').trim()) : [];
};

/**
 * Parse CSV file content into questions array
 * @param {string} csvContent - CSV file content
 * @returns {Object} { questions: Array, errors: Array, count: number }
 */
export const parseCSVQuestions = (csvContent) => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const questions = [];
  const errors = [];

  if (lines.length < 2) {
    return {
      questions: [],
      errors: ['CSV file appears to be empty or invalid'],
      count: 0
    };
  }

  // Skip header row, parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const values = parseCSVLine(line);

      if (!validateCSVQuestion(values)) {
        errors.push(`Row ${i + 1}: Invalid question format`);
        continue;
      }

      const question = [
        values[0] || '',           // question
        values[1] || '',           // option_1
        values[2] || '',           // option_2
        values[3] || '',           // option_3
        values[4] || '',           // option_4
        values[5] || '',           // correct_answer
        'Multiple',                // type (default to multiple choice)
        '',                        // explanation
        parseInt(values[6]) || 3   // difficulty (default to 3)
      ];

      questions.push(question);
    } catch (error) {
      errors.push(`Row ${i + 1}: ${error.message}`);
    }
  }

  return {
    questions,
    errors,
    count: questions.length
  };
};

/**
 * Validate CSV file
 * @param {File} file - File object to validate
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateCSVFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
    return { valid: false, error: 'Please select a valid CSV file' };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  return { valid: true, error: null };
};

/**
 * Read file as text
 * @param {File} file - File to read
 * @returns {Promise<string>} File content
 */
export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
