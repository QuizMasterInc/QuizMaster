# QuizMaster Service Layer Documentation

## 🚀 **Current Architecture (September 2025)**

### **Performance Optimizations:**
- ✅ **Optimized Dashboard Performance**: 3-5 second loading times
- ✅ **Server-Side Processing**: Filtering and sorting handled by Firebase Functions
- ✅ **Batch Operations**: Single API calls replace multiple requests
- ✅ **Intelligent Caching**: Context-aware caching strategies (5-30 minutes)

### **Technical Infrastructure:**
- ✅ **Node.js 20**: All Firebase Functions running on latest supported runtime
- ✅ **2nd Gen Functions**: Enhanced performance and capabilities
- ✅ **Firebase Functions v6.4.0**: Latest SDK with full 2nd Gen support

---

## Overview

The service layer is the backbone of our refactored QuizMaster application architecture. These services abstract all Firebase operations and provide clean, consistent APIs for our React components to interact with. This approach separates business logic from UI components, making the codebase more maintainable, testable, and scalable.

## Architecture Benefits

- **Separation of Concerns**: UI components focus solely on rendering, while services handle data operations
- **Consistent Error Handling**: All Firebase operations use standardized error handling and user-friendly messages
- **Code Reusability**: Services eliminate code duplication across components
- **Testability**: Components can be easily unit tested by mocking service calls
- **Maintainability**: Firebase logic is centralized, making updates and debugging easier
- **Performance**: Services implement retry mechanisms and optimized querying patterns
- **Batch Operations**: Context providers eliminate redundant API calls
- **Server-Side Processing**: Complex operations handled by Firebase Functions
- **Intelligent Caching**: Context-aware caching based on data update frequency

## Service Files Overview

### 1. firebaseService.js
**Purpose**: Core Firebase initialization and shared utilities

**Key Features**:
- Initializes all Firebase services (Auth, Firestore, Functions, Storage)
- Provides centralized error handling with user-friendly messages
- Implements retry mechanism for failed operations
- Includes timestamp utilities for consistent date handling
- Manages Firebase configuration from environment variables

**Main Exports**:
```javascript
// Firebase service instances
export const auth, db, functions, storage

// Utility functions
export const handleFirebaseError(error)
export const withRetry(operation, maxRetries, delay)
export const timestamp = { now(), fromFirestore(), toFirestore() }
```

**Usage Example**:
```javascript
import { handleFirebaseError, withRetry } from '../services/firebaseService';

try {
  const result = await withRetry(() => someFirebaseOperation());
} catch (error) {
  const friendlyError = handleFirebaseError(error);
  console.error(friendlyError.message);
}
```

---

### 2. authService.js
**Purpose**: Handles all user authentication and profile management

**Key Features**:
- User registration with profile creation in Firestore
- Email/password authentication
- Password reset functionality
- User profile management and updates
- Role-based access control
- Authentication state monitoring
- Automatic token management

**Main Methods**:
- `register(userData)` - Create new user account with profile
- `signIn(email, password)` - Authenticate user
- `signOut()` - Sign out current user
- `getUserProfile(uid)` - Get user profile from Firestore
- `updateUserProfile(uid, updates)` - Update user profile
- `sendPasswordResetEmail(email)` - Send password reset
- `changePassword(currentPassword, newPassword)` - Change password
- `hasRole(uid, roles)` - Check user permissions
- `onAuthStateChange(callback)` - Listen to auth state changes

**Usage Example**:
```javascript
import authService from '../services/authService';

// Sign in user
try {
  const { user, profile } = await authService.signIn(email, password);
  console.log('User signed in:', profile.displayName);
} catch (error) {
  console.error('Sign in failed:', error.message);
}

// Listen to auth state changes
const unsubscribe = authService.onAuthStateChange((user) => {
  if (user) {
    console.log('User is signed in');
  } else {
    console.log('User is signed out');
  }
});
```

---

### 3. quizService.js
**Purpose**: Manages all quiz-related operations and data

**Key Features**:
- CRUD operations for quizzes
- Advanced querying with filtering and pagination
- Quiz attempt submission via Cloud Functions
- Quiz statistics and analytics
- Quiz duplication functionality
- Soft delete implementation
- Integration with Firebase Functions for complex operations

**Main Methods**:
- `createQuiz(quizData)` - Create new quiz
- `getQuizById(quizId)` - Get specific quiz
- `getQuizzes(options)` - Get quizzes with filtering/pagination
- `browseCustomQuizzes(filters)` - Server-side filtered quiz browsing with optimization
- `updateQuiz(quizId, updates)` - Update existing quiz
- `deleteQuiz(quizId)` - Soft delete quiz
- `submitQuizAttempt(quizId, attemptData)` - Submit quiz attempt
- `getUserAttempts(userId, quizId)` - Get user's quiz attempts
- `getQuizStatistics(quizId)` - Get quiz analytics
- `duplicateQuiz(quizId, overrides)` - Duplicate existing quiz

### Advanced Filtering: `browseCustomQuizzes(filters = {})`
**Server-side processing for optimal performance**  
**Parameters:**
- `difficulty` (string): Filter by difficulty level ('easy', 'medium', 'hard')
- `category` (string): Filter by subject category
- `searchTerm` (string): Search in quiz titles and descriptions
- `sortBy` (string): Sort order ('newest', 'oldest', 'difficulty', 'popularity')
- `limit` (number): Maximum results (default: 50)

```javascript
// Server-side filtered quiz browsing
const filteredQuizzes = await quizService.browseCustomQuizzes({
  difficulty: 'medium',
  category: 'Mathematics', 
  searchTerm: 'algebra',
  sortBy: 'popularity',
  limit: 20
});
```

**Usage Example**:
```javascript
import quizService from '../services/quizService';

// Get paginated quizzes for a teacher
const { quizzes, hasMore, lastDoc } = await quizService.getQuizzes({
  creatorId: teacherId,
  isActive: true,
  limitCount: 10,
  orderByField: 'createdAt'
});

// Submit a quiz attempt
const result = await quizService.submitQuizAttempt(quizId, {
  answers: userAnswers,
  timeSpent: 1800, // 30 minutes
  userId: currentUserId
});
```

---

### 4. questionService.js
**Purpose**: Handles question management and validation

**Key Features**:
- CRUD operations for individual questions
- Question type validation (multiple choice, true/false, short answer, essay)
- Advanced filtering by subject, difficulty, type
- Bulk question import functionality
- Question usage tracking
- Comprehensive validation system

**Main Methods**:
- `createQuestion(questionData)` - Create new question
- `getQuestionById(questionId)` - Get specific question
- `getQuestions(options)` - Get filtered questions
- `updateQuestion(questionId, updates)` - Update question
- `deleteQuestion(questionId)` - Soft delete question
- `validateQuestion(questionData)` - Validate question data
- `bulkImportQuestions(questionsData)` - Import multiple questions

**Question Types Supported**:
- **Multiple Choice**: Questions with 2+ options and one correct answer
- **True/False**: Simple boolean questions
- **Short Answer**: Text-based questions with sample answers
- **Essay**: Long-form questions with rubrics

**Usage Example**:
```javascript
import questionService from '../services/questionService';

// Create a multiple choice question
const question = await questionService.createQuestion({
  question: "What is the capital of France?",
  type: "multiple-choice",
  options: ["London", "Berlin", "Paris", "Madrid"],
  correctAnswer: 2,
  difficulty: "easy",
  subject: "Geography",
  creatorId: teacherId
});

// Validate question before creation
const validation = questionService.validateQuestion(questionData);
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}
```

---

### 5. resultService.js
**Purpose**: Manages quiz results, analytics, and performance data

**Key Features**:
- Quiz attempt retrieval and management
- Advanced analytics via Cloud Functions
- Performance summaries and statistics
- Grade distribution calculations
- Data export functionality (CSV)
- User performance tracking
- Batch operations with intelligent caching

**Main Methods**:
- `getAllResults()` - Batch fetch all result types with caching
- `getAttemptById(attemptId)` - Get specific quiz attempt
- `getUserAttempts(userId, options)` - Get user's attempts with pagination
- `getQuizAttempts(quizId, options)` - Get all attempts for a quiz
- `getQuizAnalytics(quizId)` - Get detailed quiz analytics
- `getUserPerformanceSummary(userId)` - Get user performance data
- `exportQuizResults(quizId, options)` - Export results to CSV
- `calculateGradeStatistics(attempts)` - Calculate grade distributions

**Analytics Features**:
- Average scores and completion rates
- Question-level performance analysis
- Time-based performance trends
- Grade distribution breakdowns
- Passing/failing rate calculations

**Usage Example**:
```javascript
import resultService from '../services/resultService';

// Get analytics for a quiz
const analytics = await resultService.getQuizAnalytics(quizId);
console.log(`Average score: ${analytics.averageScore}%`);
console.log(`Completion rate: ${analytics.completionRate}%`);

// Calculate grade statistics
const stats = resultService.calculateGradeStatistics(attempts);
console.log('Grade Distribution:', stats.gradeDistribution);
```

---

## Common Patterns and Best Practices

### Error Handling
All services use the centralized error handling system:
```javascript
try {
  const result = await someServiceMethod();
} catch (error) {
  // error.message contains user-friendly message
  // error.code contains the original error code
  // error.originalError contains the full Firebase error
}
```

### Timestamp Handling
All services use consistent timestamp utilities:
```javascript
import { timestamp } from '../services/firebaseService';

// Creating timestamps
const now = timestamp.now();
const firestoreDate = timestamp.toFirestore(new Date());

// Reading timestamps
const jsDate = timestamp.fromFirestore(firestoreTimestamp);
```

### Pagination Pattern
Services that return lists support consistent pagination:
```javascript
const { items, hasMore, lastDoc } = await service.getItems({
  limitCount: 20,
  startAfterDoc: lastDoc // from previous page
});
```

### Retry Mechanism
All Firebase operations automatically retry on failure:
```javascript
// Operations are wrapped with withRetry()
const result = await withRetry(() => 
  firestoreOperation(), 
  maxRetries = 3, 
  delay = 1000
);

```

---

## 🎯 **Current Architecture Patterns & Best Practices**

### **Server-Side Processing**
- **Principle**: Complex operations handled by Firebase Functions for optimal performance
- **Implementation**: `browseCustomQuizzes` handles filtering/sorting server-side
- **Benefits**: Reduced client-side processing and data transfer

### **Context-Based State Management**
- **ResultsContext**: Centralized results data with intelligent caching
- **Single Source of Truth**: Eliminates redundant API calls across components
- **Cache Strategy**: Smart refresh based on data volatility

### **Batch Operations**
- **API Consolidation**: Single calls replace multiple requests
- **Example**: `getAllResults` fetches multiple data types in one function call
- **Performance**: Significant reduction in API overhead

### **Caching Strategy**
- **Static Data** (30min): Categories, question banks, system settings
- **User Data** (5min): Quiz results, performance metrics, attempt history
- **Dynamic Data** (1min): Live quiz sessions, real-time updates
- **Cache Keys**: User ID and data type isolation

### **Error Handling Standards**
- **User-Friendly Messages**: Technical errors translated to actionable feedback
- **Retry Logic**: Automatic retry for transient failures
- **Graceful Degradation**: Fallback functionality when services unavailable
- **Comprehensive Logging**: Error tracking for debugging and monitoring