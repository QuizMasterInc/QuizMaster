const admin = require('firebase-admin')

admin.initializeApp()

// Import modular functions
const questions = require('./questions')
const quizzes = require('./quizzes')
const results = require('./results')
const flashcards = require('./flashcards')
const study = require('./study')

// Export all functions from modules
// Questions module
exports.addDefaultQuestion = questions.addDefaultQuestion
exports.grabSubV2 = questions.grabSubV2
exports.getSubcategories = questions.getSubcategories

// Quizzes module
exports.grabCustomQuiz = quizzes.grabCustomQuiz
exports.trackQuizAttempt = quizzes.trackQuizAttempt
exports.grabAllCustomQuizzes = quizzes.grabAllCustomQuizzes
exports.browseCustomQuizzesOptimized = quizzes.browseCustomQuizzesOptimized
exports.addCustomQuiz = quizzes.addCustomQuiz
exports.grabUserCustomQuizzesV2 = quizzes.grabUserCustomQuizzesV2
exports.browseCustomQuizzesV2 = quizzes.browseCustomQuizzesV2

// Results module
exports.grabAllResultsV2 = results.grabAllResultsV2
exports.submitQuizResults = results.submitQuizResults

// Flashcards module
exports.addCustomFlashcardDeck = flashcards.addCustomFlashcardDeck
exports.getUserFlashcardDecks = flashcards.getUserFlashcardDecks
exports.getFlashcardDeck = flashcards.getFlashcardDeck
exports.deleteFlashcardDeck = flashcards.deleteFlashcardDeck

// Study module
exports.getStudyMaterial = study.getStudyMaterial