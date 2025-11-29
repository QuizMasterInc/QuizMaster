const CLOUD_FUNCTIONS_BASE = 'https://us-central1-quizmaster-c66a2.cloudfunctions.net';

/**
 * Unified API wrapper around Firebase Cloud Functions for QuizMaster.
 * This module provides a consistent interface for calling both HTTP-triggered Cloud Functions
 * (via fetch/REST) and callable functions (via Firebase's httpsCallable).
 * Use this to interact with backend logic such as custom questions, quizzes, and results.
 */

class CloudFunctionsAPI {
  async call(functionName, data = {}, method = 'POST') {
    try {
      let url = `${CLOUD_FUNCTIONS_BASE}/${functionName}`;

      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      if (method === 'POST') {
        options.body = JSON.stringify(data);
      } else if (method === 'GET' && Object.keys(data).length > 0) {
        // Add query params for GET requests
        const params = new URLSearchParams(data);
        url = `${url}?${params}`;
      }

      const response = await fetch(url, options);

      let result;
      try {
        // Attempt to parse JSON response; some errors may return non-JSON payloads.
        result = await response.json();
      } catch (parseError) {
        console.error(`[CloudFunctionsAPI] Failed to parse JSON from ${functionName}:`, parseError);
        throw new Error('Invalid response from server');
      }

      // Normalize error handling across different Cloud Function response shapes.
      if (!response.ok || result.status >= 400 || result.success === false || result.result === false) {
        throw new Error(result.message || result.error || 'Request failed');
      }

      return result;
    } catch (error) {
      console.error(`[CloudFunctionsAPI] Error calling ${functionName}:`, error);
      throw error;
    }
  }

// ===== CUSTOM QUESTIONS =====
// These functions manage CRUD for user-authored custom questions via HTTP Cloud Functions.
  async getCustomQuestions() {
    return this.call('getCustomQuestions');
  }

  async addCustomQuestion(question) {
    return this.call('addCustomQuestion', { question });
  }

  async updateCustomQuestion(questionId, question) {
    return this.call('updateCustomQuestion', { questionId, question });
  }

  /**
     * Deletes a custom quiz using a Firebase callable function.
     * This uses a callable instead of the generic call() method because it relies on request.auth on the backend to enforce ownership.
   */
  async deleteCustomQuestion(questionId) {
    return this.call('deleteCustomQuestion', { questionId });
  }

// ===== QUIZ RESULTS =====
// These functions fetch and manage stored quiz attempt results.
  async getQuizResults(options = {}) {
    return this.call('getQuizResults', options);
  }

  async getQuizResultDetails(resultId) {
    return this.call('getQuizResultDetails', { resultId });
  }

  async deleteQuizResult(resultId) {
    return this.call('deleteQuizResult', { resultId });
  }

  async getAllResults(userId) {
    return this.call('grabAllResultsV2', { uid: userId });
  }

// ===== CUSTOM QUIZZES =====
// Functions for managing user-created custom quizzes (metadata, fetching, deleting, browsing).
  async updateCustomQuiz(quizId, quizData) {
    return this.call('updateCustomQuiz', { quizId, quizData });
  }

async deleteCustomQuiz(quizId) {
  try {
    const { getFunctions, httpsCallable } = await import("firebase/functions");
    const { getApp } = await import("firebase/app");
    const { getAuth } = await import("firebase/auth");

    const app = getApp();
    const auth = getAuth(app);

    const functions = getFunctions(app);
    const deleteFn = httpsCallable(functions, "deleteCustomQuiz");

    const result = await deleteFn({ quizId });

    return result.data || result;
  } catch (error) {
    console.error("[CloudFunctionsAPI] Error calling deleteCustomQuiz:", error);
    throw error;
  }
}

  async getAllCustomQuizzes(options = {}) {
    return this.call('grabAllCustomQuizzes', options);
  }

  async browseCustomQuizzes(options = {}) {
    return this.call('browseCustomQuizzesOptimized', options);
  }

  async getCustomQuiz(quizId) {
    return this.call('grabCustomQuiz', { quizId });
  }

// ===== EXISTING FUNCTIONS =====
// Miscellaneous Cloud Functions for category/subcategory lookup and more.
  async fetchSubcategories(category) {
    return this.call('getSubcategories', { category }, 'GET');
  }

// ===== TEACHER QUIZZES =====
// Functions for fetching and managing quizzes authored by teachers.
  async getTeacherQuizzes(options = {}) {
    return this.call('getTeacherQuizzes', options, 'POST');
  }
}

export default new CloudFunctionsAPI();