const admin = require('firebase-admin')

admin.initializeApp()

// Import modular functions
const questions = require('./questions')
const quizzes = require('./quizzes')
const results = require('./results')
const flashcards = require('./flashcards')

// Export all functions from modules
// Questions module
exports.addDefaultQuestion = questions.addDefaultQuestion
exports.grabSubV2 = questions.grabSubV2
exports.getSubcategories = questions.getSubcategories
exports.getCustomQuestions = questions.getCustomQuestions
exports.addCustomQuestion = questions.addCustomQuestion
exports.updateCustomQuestion = questions.updateCustomQuestion
exports.deleteCustomQuestion = questions.deleteCustomQuestion

// Quizzes module
exports.grabCustomQuiz = quizzes.grabCustomQuiz
exports.trackQuizAttempt = quizzes.trackQuizAttempt
exports.grabAllCustomQuizzes = quizzes.grabAllCustomQuizzes
exports.browseCustomQuizzesOptimized = quizzes.browseCustomQuizzesOptimized
exports.addCustomQuiz = quizzes.addCustomQuiz
exports.grabUserCustomQuizzesV2 = quizzes.grabUserCustomQuizzesV2
exports.browseCustomQuizzesV2 = quizzes.browseCustomQuizzesV2
exports.updateCustomQuiz = quizzes.updateCustomQuiz
exports.deleteCustomQuiz = quizzes.deleteCustomQuiz
exports.getTeacherQuizzes = quizzes.getTeacherQuizzes

// Results module
exports.grabAllResultsV2 = results.grabAllResultsV2
exports.submitQuizResults = results.submitQuizResults
exports.getQuizResults = results.getQuizResults
exports.getQuizResultDetails = results.getQuizResultDetails
exports.deleteQuizResult = results.deleteQuizResult

// Flashcards module
exports.addCustomFlashcardDeck = flashcards.addCustomFlashcardDeck
exports.getUserFlashcardDecks = flashcards.getUserFlashcardDecks
exports.getFlashcardDeck = flashcards.getFlashcardDeck
exports.deleteFlashcardDeck = flashcards.deleteFlashcardDeck