const admin = require('firebase-admin')

admin.initializeApp()

// Import modular functions
const questions = require('./questions')
const quizzes = require('./quizzes')
const results = require('./results')
const flashcards = require('./flashcards')
const studySessions = require('./study_sessions')
const feedback = require('./feedback')

// Export all functions from modules

// Feedback
exports.submitFeedback = feedback.submitFeedback

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
exports.updateFlashcardDeck = flashcards.updateFlashcardDeck
exports.deleteFlashcardDeck = flashcards.deleteFlashcardDeck
exports.updateFlashcardDeckAnalytics = flashcards.updateFlashcardDeckAnalytics
exports.browsePublicFlashcards = flashcards.browsePublicFlashcards
exports.getFlashcardCategories = flashcards.getFlashcardCategories

// Study Sessions module
exports.createStudySession = studySessions.createStudySession
exports.getStudySession = studySessions.getStudySession
exports.getActiveSession = studySessions.getActiveSession
exports.getStudyHistory = studySessions.getStudyHistory
exports.updateStudySession = studySessions.updateStudySession
exports.completeStudySession = studySessions.completeStudySession
exports.deleteStudySession = studySessions.deleteStudySession