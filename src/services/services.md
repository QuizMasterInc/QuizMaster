# Services Documentation

## Overview
The services directory contains JavaScript modules that handle all Firebase operations and data management for the QuizMaster application. Each service focuses on a specific area of functionality and provides clean APIs for React components to use. All data operations now route through Firebase Cloud Functions via the unified CloudFunctionsAPI for consistent security, error handling, and data access patterns.

## Service Files

### CloudFunctionsAPI.js
**NEW:** Unified wrapper for all Firebase Cloud Functions providing consistent error handling and data formatting.

**Functions:**
- `call(functionName, data, method)` - Generic method to call any Cloud Function
- `getCustomQuestions()` - Get all custom questions for current user
- `addCustomQuestion(question)` - Add a new custom question
- `updateCustomQuestion(questionId, question)` - Update existing custom question
- `deleteCustomQuestion(questionId)` - Delete a custom question
- `getQuizResults(options)` - Get quiz results with filtering
- `getQuizResultDetails(resultId)` - Get detailed quiz result
- `deleteQuizResult(resultId)` - Delete a quiz result
- `getAllResults(userId)` - Get all quiz results for a user by category
- `updateCustomQuiz(quizId, quizData)` - Update existing custom quiz
- `deleteCustomQuiz(quizId)` - Delete a custom quiz
- `getAllCustomQuizzes(options)` - Get all custom quizzes
- `browseCustomQuizzes(options)` - Browse custom quizzes with filtering
- `fetchSubcategories(category)` - Get subcategories for a category

---

### firebaseService.js
Initializes Firebase and provides shared utilities used by all other services.

**Functions:**
- `handleFirebaseError(error)` - Converts Firebase errors into user-friendly messages
- `withRetry(operation, maxRetries, delay)` - Retries failed Firebase operations automatically
- `timestamp.now()` - Creates current timestamp in Firestore format
- `timestamp.fromFirestore()` - Converts Firestore timestamps to JavaScript dates
- `timestamp.toFirestore()` - Converts JavaScript dates to Firestore timestamps

---

### authService.js
Manages user authentication, registration, and profile data.

**Functions:**
- `register(userData)` - Creates new user account and profile in Firestore
- `signIn(email, password)` - Signs in user and loads their profile data
- `signOut()` - Signs out the current user
- `getUserProfile(uid)` - Gets user profile data from Firestore
- `updateUserProfile(uid, updates)` - Updates user profile information
- `sendPasswordResetEmail(email)` - Sends password reset email to user
- `changePassword(currentPassword, newPassword)` - Changes user's password
- `hasRole(uid, roles)` - Checks if user has specific role permissions
- `onAuthStateChange(callback)` - Listens for authentication state changes
- `createCompleteUserDocument(authUser, additionalData)` - Creates full user document with all required fields

---

### quizCreationService.js
Handles quiz creation, validation, and normalization using Cloud Functions for data consistency.

**Functions:**
- `validateQuizName(quizName)` - Validates quiz name input
- `validateQuizPassword(password)` - Validates quiz password input
- `normalizeTags(tags)` - Normalizes tags to consistent format
- `validateQuizTags(tags)` - Validates quiz tags input
- `isTitleDuplicate(userQuizzes, newTitle)` - Checks if quiz title already exists for user
- `createQuizDataObject(quizDataArray)` - Creates unified question data object
- `createValidatedQuizObject(quizInput)` - Creates and validates complete quiz object
- `fetchUserQuizTitles(userId)` - Fetches user quiz titles using Cloud Function (calls CloudFunctionsAPI)
- `submitCustomQuiz(quizObject)` - Submits quiz using Cloud Function (calls CloudFunctionsAPI)

---

### quizRetrievalService.js
Handles quiz reading, browsing, and searching operations. Now includes update/delete operations using Cloud Functions.

**Functions:**
- `getQuizById(quizId)` - Gets a specific quiz by its ID (calls modular: `quizzes/grabCustomQuiz`)
- `getQuizzes(options)` - Gets quizzes with filtering and pagination (calls modular: `quizzes/browseCustomQuizzesOptimized`)
- `getCustomQuizzesByUser(userId)` - Gets all quizzes created by a specific user (calls CloudFunctionsAPI.getAllCustomQuizzes)
- `normalizeQuizData(quiz)` - Converts quiz data to a consistent format
- `ensureQuizzesSorted(quizzes)` - Sorts quizzes by creation date
- `browseCustomQuizzes(options)` - Searches and filters custom quizzes with server-side processing (calls CloudFunctionsAPI.browseCustomQuizzes)
- `updateCustomQuiz(quizId, quizData)` - Updates existing custom quiz (calls CloudFunctionsAPI.updateCustomQuiz)
- `deleteCustomQuiz(quizId)` - Deletes a custom quiz (calls CloudFunctionsAPI.deleteCustomQuiz)

---

### quizSubmissionService.js
Handles quiz submission and attempt tracking using Cloud Functions for consistency.

**Functions:**
- `submitQuizResults(attemptData)` - Submits quiz results for default quizzes (calls CloudFunctionsAPI)
- `submitQuizAttempt(quizId, attemptData)` - Submits quiz attempt (legacy compatibility, calls modular: `quizzes/trackQuizAttempt`)

---

### quizApiService.js
Handles quiz API operations including category and subcategory management using Cloud Functions for consistency.

**Functions:**
- `fetchCategories()` - Gets all available quiz categories (calls modular: `questions/fetchCategories`)
- `fetchSubcategories(category)` - Gets subcategories for a specific category (calls CloudFunctionsAPI.fetchSubcategories)
- `fetchQuestions(options)` - Gets questions for quiz generation (calls modular: `questions/fetchQuestions`)
- `fetchQuizById(quizId)` - Gets a specific quiz by ID (calls modular: `quizzes/grabCustomQuiz`)
- `fetchUserQuizzes(userId)` - Gets all quizzes created by a user (calls modular: `quizzes/grabUserCustomQuizzesV2`)

---

### resultService.js
Handles quiz result retrieval operations using Cloud Functions for data consistency.

**Functions:**
- `getAttemptById(attemptId)` - Gets a specific quiz attempt by its ID (calls CloudFunctionsAPI.getQuizResultDetails)
- `getUserAttempts(userId, options)` - Gets all quiz attempts by a user with pagination (calls CloudFunctionsAPI.getQuizResults)
- `getQuizAttempts(quizId, options)` - Gets all attempts for a specific quiz (calls CloudFunctionsAPI.getQuizResults)
- `getAllResults(userId)` - Gets all quiz results for a user across all categories (cached Cloud Function call)
- `getResultsByCategory(userId, category)` - Gets quiz results for a specific category
- `deleteQuizResult(resultId)` - Deletes a quiz result (calls CloudFunctionsAPI.deleteQuizResult)
- `clearResultsCache()` - Clears the results cache

---

### analyticsService.js
Handles analytics data collection and reporting using Cloud Functions for consistency.

**Functions:**
- `trackQuizStart(quizId, userId)` - Tracks quiz start events (calls CloudFunctionsAPI)
- `trackQuizComplete(quizId, userId, score)` - Tracks quiz completion events (calls CloudFunctionsAPI)
- `getAnalyticsData(userId)` - Retrieves user analytics data (calls CloudFunctionsAPI)

---

### customQuestionService.js
**NEW:** Handles custom question management operations using Cloud Functions.

**Functions:**
- `getCustomQuestions()` - Gets all custom questions for current user (calls CloudFunctionsAPI.getCustomQuestions)
- `addCustomQuestion(questionData)` - Adds a new custom question (calls CloudFunctionsAPI.addCustomQuestion)
- `updateCustomQuestion(questionId, questionData)` - Updates existing custom question (calls CloudFunctionsAPI.updateCustomQuestion)
- `deleteCustomQuestion(questionId)` - Deletes a custom question (calls CloudFunctionsAPI.deleteCustomQuestion)
- `validateCustomQuestion(questionData)` - Validates custom question data format

---

### questionService.js
Manages individual questions in the default question bank used for system-generated quizzes.

**Functions:**
- `createQuestion(questionData)` - Creates a new question in the question bank
- `getQuestionById(questionId)` - Gets a specific question by ID
- `getQuestions(options)` - Gets questions with filtering by category, difficulty, or type
- `updateQuestion(questionId, updates)` - Updates an existing question
- `deleteQuestion(questionId)` - Soft deletes a question (marks as inactive)
- `validateQuestion(questionData)` - Validates question format and required fields
- `bulkImportQuestions(questionsData)` - Imports multiple questions at once

---

### flashcardService.js
Manages flashcard deck creation, retrieval, and management using Cloud Functions for data consistency.

**Functions:**
- `createValidatedDeckObject(deckData)` - Validates and formats flashcard deck data before submission
- `submitFlashcardDeck(deckData)` - Creates a new flashcard deck in the database (calls CloudFunctionsAPI)
- `getUserFlashcardDecks(userId)` - Gets all flashcard decks created by a specific user (calls CloudFunctionsAPI)
- `getFlashcardDeck(deckId)` - Gets a specific flashcard deck by its ID (calls CloudFunctionsAPI)
- `deleteFlashcardDeck(deckId, userId)` - Deletes a flashcard deck (with user permission verification, calls CloudFunctionsAPI)
- `normalizeDeckData(rawData)` - Converts flashcard deck data to a consistent format

## How Services Work Together
All services use the same patterns for error handling, data validation, and Firebase operations. Components import these services to perform database operations without handling Firebase directly. The services automatically handle things like user authentication, data formatting, and error messages. All data operations now route through Firebase Cloud Functions via the unified CloudFunctionsAPI for consistent security and access control.

## Service Organization Principles
- **Single Responsibility**: Each service handles one specific domain
- **Separation of Concerns**: Data access, business logic, and analytics are separated
- **Consistent Patterns**: All services follow the same error handling and data formatting patterns
- **Focused APIs**: Services provide clean, focused APIs that hide implementation details
- **Cloud Functions First**: All data operations route through Firebase Cloud Functions for security and consistency
