# Services Documentation

## Overview
The services directory contains JavaScript modules that handle all Firebase operations and data management for the QuizMaster application. Each service focuses on a specific area of functionality and provides clean APIs for React components to use.

## Service Files

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
Handles quiz creation, validation, and normalization for custom quizzes.

**Functions:**
- `validateQuizName(quizName)` - Validates quiz name input
- `validateQuizPassword(password)` - Validates quiz password input
- `normalizeTags(tags)` - Normalizes tags to consistent format
- `validateQuizTags(tags)` - Validates quiz tags input
- `isTitleDuplicate(userQuizzes, newTitle)` - Checks if quiz title already exists for user
- `createQuizDataObject(quizDataArray)` - Creates unified question data object
- `createValidatedQuizObject(quizInput)` - Creates and validates complete quiz object
- `submitCustomQuiz(quizObject)` - Submits quiz to Firebase Cloud Function (modular: `quizzes/addCustomQuiz`)

---

### quizRetrievalService.js
Handles quiz reading, browsing, and searching operations.

**Functions:**
- `getQuizById(quizId)` - Gets a specific quiz by its ID (calls modular: `quizzes/grabCustomQuiz`)
- `getQuizzes(options)` - Gets quizzes with filtering and pagination (calls modular: `quizzes/browseCustomQuizzesOptimized`)
- `getCustomQuizzesByUser(userId)` - Gets all quizzes created by a specific user (calls modular: `quizzes/grabUserCustomQuizzesV2`)
- `normalizeQuizData(quiz)` - Converts quiz data to a consistent format
- `ensureQuizzesSorted(quizzes)` - Sorts quizzes by creation date
- `browseCustomQuizzes(options)` - Searches and filters custom quizzes with server-side processing (calls modular: `quizzes/browseCustomQuizzesV2`)

---

### quizSubmissionService.js
Handles quiz submission and attempt tracking.

**Functions:**
- `submitQuizResults(attemptData)` - Submits quiz results for default quizzes (calls modular: `results/submitQuizResults`)
- `submitQuizAttempt(quizId, attemptData)` - Submits quiz attempt (legacy compatibility, calls modular: `quizzes/trackQuizAttempt`)

---

### resultService.js
Handles basic quiz result retrieval operations.

**Functions:**
- `getAttemptById(attemptId)` - Gets a specific quiz attempt by its ID
- `getUserAttempts(userId, options)` - Gets all quiz attempts by a user with pagination
- `getQuizAttempts(quizId, options)` - Gets all attempts for a specific quiz
- `getAllResults(userId)` - Gets all quiz results for a user across all categories (cached)
- `getResultsByCategory(userId, category)` - Gets quiz results for a specific category
- `clearResultsCache()` - Clears the results cache

---

### analyticsService.js
Handles analytics, statistics, performance calculations, and exports.

**Functions:**
- `getQuizAnalytics(quizId)` - Gets detailed analytics and statistics for a quiz
- `getUserPerformanceSummary(userId)` - Gets comprehensive performance data for a user
- `exportQuizResults(quizId, options)` - Exports quiz results to CSV format
- `calculateGradeStatistics(attempts)` - Calculates grade distributions and performance metrics

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
Manages flashcard deck creation, retrieval, and management.

**Functions:**
- `createValidatedDeckObject(deckData)` - Validates and formats flashcard deck data before submission
- `submitFlashcardDeck(deckData)` - Creates a new flashcard deck in the database
- `getUserFlashcardDecks(userId)` - Gets all flashcard decks created by a specific user
- `getFlashcardDeck(deckId)` - Gets a specific flashcard deck by its ID
- `deleteFlashcardDeck(deckId, userId)` - Deletes a flashcard deck (with user permission verification)
- `normalizeDeckData(rawData)` - Converts flashcard deck data to a consistent format

## How Services Work Together
All services use the same patterns for error handling, data validation, and Firebase operations. Components import these services to perform database operations without handling Firebase directly. The services automatically handle things like user authentication, data formatting, and error messages.

## Service Organization Principles
- **Single Responsibility**: Each service handles one specific domain
- **Separation of Concerns**: Data access, business logic, and analytics are separated
- **Consistent Patterns**: All services follow the same error handling and data formatting patterns
- **Focused APIs**: Services provide clean, focused APIs that hide implementation details
