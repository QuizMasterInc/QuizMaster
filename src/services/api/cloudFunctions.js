const CLOUD_FUNCTIONS_BASE = 'https://us-central1-quizmaster-c66a2.cloudfunctions.net';

/**
 * Unified Cloud Functions API wrapper
 * Handles all Cloud Function calls with consistent error handling
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
      const result = await response.json();

      // Your Cloud Functions return different formats, normalize them
      if (result.status >= 400 || result.success === false || result.result === false) {
        throw new Error(result.message || result.error || 'Request failed');
      }

      return result;
    } catch (error) {
      console.error(`[CloudFunctionsAPI] Error calling ${functionName}:`, error);
      throw error;
    }
  }

  // ===== CUSTOM QUESTIONS =====
  async getCustomQuestions() {
    return this.call('getCustomQuestions');
  }

  async addCustomQuestion(question) {
    return this.call('addCustomQuestion', { question });
  }

  async updateCustomQuestion(questionId, question) {
    return this.call('updateCustomQuestion', { questionId, question });
  }

  async deleteCustomQuestion(questionId) {
    return this.call('deleteCustomQuestion', { questionId });
  }

  // ===== QUIZ RESULTS =====
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
  async updateCustomQuiz(quizId, quizData) {
    return this.call('updateCustomQuiz', { quizId, quizData });
  }

  async deleteCustomQuiz(quizId) {
    return this.call('deleteCustomQuiz', { quizId });
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
  async fetchSubcategories(category) {
    return this.call('getSubcategories', { category }, 'GET');
  }

  // ===== TEACHER QUIZZES =====
  async getTeacherQuizzes(options = {}) {
    return this.call('getTeacherQuizzes', options, 'POST');
  }
}

export default new CloudFunctionsAPI();