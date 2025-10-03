import Papa from 'papaparse';

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

            return {
              question: row.question.trim(),
              a: row.a.trim(),
              b: row.b.trim(),
              c: row.c.trim(),
              d: row.d.trim(),
              correct: row.correct.trim(),
              category: row.category.trim(),
              'sub-category': row['sub-category']?.trim() || '',
              difficulty: parseInt(row.difficulty) || 0
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
 * Uploads multiple questions to the database
 * @param {Array} questions - Array of question objects
 * @returns {Promise<Object>} Upload results with success/failure counts
 */
export const bulkUploadQuestions = async (questions) => {
  const results = {
    total: questions.length,
    successful: 0,
    failed: 0,
    errors: []
  };

  for (let i = 0; i < questions.length; i++) {
    try {
      const encodedQuestion = encodeURIComponent(JSON.stringify(questions[i]));
      const response = await fetch(
        `https://us-central1-quizmaster-c66a2.cloudfunctions.net/addDefaultQuestion?question=${encodedQuestion}`
      );

      if (response.ok) {
        results.successful++;
      } else {
        results.failed++;
        results.errors.push(`Question ${i + 1}: HTTP ${response.status}`);
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`Question ${i + 1}: ${error.message}`);
    }
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

