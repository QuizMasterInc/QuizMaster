import Papa from 'papaparse';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import app from '../config/firebase';

const db = getFirestore(app);

/**
 * Parses a CSV file and returns an array of question objects
 * Expected CSV format:
 * question,a,b,c,d,correct,category,sub-category,difficulty
 *
 * @param {File} file - The CSV file to parse
 * @returns {Promise<Array>} Array of question objects
 */
export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const questions = results.data.map((row, index) => {
            // Validate required fields
            if (!row.question || !row.a || !row.b || !row.c || !row.d || !row.correct || !row.category) {
              throw new Error(`Row ${index + 1}: Missing required fields`);
            }

            // Create question with BOTH field name formats for compatibility
            return {
              question: row.question.trim(),
              // New format (short names)
              a: row.a.trim(),
              b: row.b.trim(),
              c: row.c.trim(),
              d: row.d.trim(),
              correct: row.correct.trim(),
              // Old format (option_X and correct_answer) for backward compatibility
              option_1: row.a.trim(),
              option_2: row.b.trim(),
              option_3: row.c.trim(),
              option_4: row.d.trim(),
              correct_answer: row.correct.trim(),
              // Other fields
              category: row.category.trim().toLowerCase(), // Store as lowercase for consistency
              'sub-category': row['sub-category']?.trim() || '',
              difficulty: parseInt(row.difficulty) || 0,
              type: row.type?.trim() || 'Multiple' // Default to Multiple choice
            };
          });

          resolve({
            success: true,
            questions,
            count: questions.length
          });
        } catch (error) {
          reject({
            success: false,
            error: error.message
          });
        }
      },
      error: (error) => {
        reject({
          success: false,
          error: `CSV parsing error: ${error.message}`
        });
      }
    });
  });
};

/**
 * Fetches all questions from the database and organizes them by category for quick lookup
 * @returns {Promise<Map>} A map where each key is a category and the value is a set of questions in that category
 */
const fetchAllQuestions = async () => {
  try {
    const questionsRef = collection(db, 'default-questions');
    const querySnapshot = await getDocs(questionsRef);

    const questionMap = new Map();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const category = data.category?.toLowerCase() || '';
      const question = data.question || '';

      if (!questionMap.has(category)) {
        questionMap.set(category, new Set());
      }
      questionMap.get(category).add(question);
    });

    return questionMap;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

/**
 * Checks if a question is a duplicate by looking it up in the pre-fetched question map
 * @param {Object} question - Question object to check
 * @param {Map} questionMap - Map of existing questions organized by category
 * @returns {boolean} True if the question is a duplicate
 */
const isDuplicateQuestion = (question, questionMap) => {
  const category = question.category?.toLowerCase() || '';
  const questionText = question.question || '';

  const categoryQuestions = questionMap.get(category);
  return categoryQuestions ? categoryQuestions.has(questionText) : false;
};

/**
 * Uploads multiple questions to the database with duplicate checking
 * @param {Array} questions - Array of question objects
 * @returns {Promise<Object>} Upload results with success/failure/duplicate counts
 */
export const bulkUploadQuestions = async (questions) => {
  const results = {
    total: questions.length,
    successful: 0,
    failed: 0,
    duplicates: 0,
    errors: [],
    duplicateQuestions: []
  };

  try {
    const questionMap = await fetchAllQuestions();

    for (let i = 0; i < questions.length; i++) {
      try {
        if (isDuplicateQuestion(questions[i], questionMap)) {
          results.duplicates++;
          results.duplicateQuestions.push({
            index: i + 1,
            question: questions[i].question.substring(0, 50) + '...',
            category: questions[i].category,
            subCategory: questions[i]['sub-category']
          });
          continue;
        }

        const encodedQuestion = encodeURIComponent(JSON.stringify(questions[i]));
        const response = await fetch(
          `https://us-central1-quizmaster-c66a2.cloudfunctions.net/addDefaultQuestion?question=${encodedQuestion}`
        );

        if (response.ok) {
          results.successful++;
          const category = questions[i].category?.toLowerCase() || '';
          if (!questionMap.has(category)) {
            questionMap.set(category, new Set());
          }
          questionMap.get(category).add(questions[i].question);
        } else {
          results.failed++;
          results.errors.push(`Question ${i + 1}: HTTP ${response.status}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Question ${i + 1}: ${error.message}`);
      }
    }
  } catch (error) {
    results.errors.push(`Failed to fetch existing questions: ${error.message}`);
  }

  return results;
};

/**
 * Downloads a CSV template for questions
 */
export const downloadCSVTemplate = () => {
  const template = `question,a,b,c,d,correct,category,sub-category,difficulty
"What is the capital of France?",Paris,London,Berlin,Madrid,Paris,geography,europe,1
"What is 2+2?",3,4,5,6,4,math,arithmetic,0
"Who wrote Hamlet?","William Shakespeare","Charles Dickens","Jane Austen","Mark Twain","William Shakespeare",literature,shakespeare,2`;

  const blob = new Blob([template], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'question_template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
