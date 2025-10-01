# QuizMaster Service Layer Documentation

## 🚀 **Current Architecture (October 2025)**

### **Performance Optimizations:**
- ✅ **Optimized Dashboard Performance**: 3-5 second loading times (6x improvement)
- ✅ **Server-Side Processing**: Filtering and sorting handled by Firebase Functions
- ✅ **Batch Operations**: Single API calls replace multiple requests (83% reduction)
- ✅ **Intelligent Caching**: Context-aware caching strategies (5-30 minutes)
- ✅ **Flashcard System Integration**: Complete CRUD operations with user stats tracking

### **Technical Infrastructure:**
- ✅ **Node.js 20**: All Firebase Functions running on latest supported runtime
- ✅ **2nd Gen Functions**: Enhanced performance and capabilities
- ✅ **Firebase Functions v6.4.0**: Latest SDK with full 2nd Gen support
- ✅ **Complete System Integration**: Quiz, flashcard, and user management unified

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

The QuizMaster service layer now includes 6 comprehensive services handling all aspects of the application:

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
- `register(userData)` - Create new user account with complete profile schema
- `signIn(email, password)` - Authenticate user with enhanced profile loading
- `signOut()` - Sign out current user
- `getUserProfile(uid)` - Get user profile from Firestore with complete schema
- `updateUserProfile(uid, updates)` - Update user profile maintaining schema integrity
- `sendPasswordResetEmail(email)` - Send password reset
- `changePassword(currentPassword, newPassword)` - Change password with re-authentication
- `hasRole(uid, roles)` - Check user permissions based on role system
- `onAuthStateChange(callback)` - Listen to auth state changes
- `createCompleteUserDocument(authUser, additionalData)` - Create full user document with schema compliance

**Enhanced User Schema Integration**:
The authService now creates comprehensive user documents following the complete DATABASE_SCHEMA.md structure:

```javascript
// Complete user document structure created during registration
{
  uid: "string",
  email: "string",
  emailVerified: "boolean",
  authProvider: "google" | "email" | "apple" | "microsoft",
  
  profile: {
    firstName: "string",
    lastName: "string", 
    displayName: "string",
    title: "string",
    isPublicProfile: "boolean",
    showEmail: "boolean"
  },
  
  role: "user" | "developer" | "instructor",
  permissions: { /* role-based permissions */ },
  status: { /* account status flags */ },
  
  stats: {
    quizzesCreated: 0,
    quizzesTaken: 0,
    totalScore: 0,
    averageScore: 0,
    lastActivity: "timestamp",
    flashcardDecksCreated: 0  // NEW: Flashcard tracking
  },
  
  cache: {
    recentQuizIds: [],
    recentFlashcardIds: [],  // NEW: Flashcard tracking
    favoriteCategories: [],
    achievementBadges: []
  }
}
```

**Usage Example**:
```javascript
import authService from '../services/authService';

// Register with complete schema
const userData = {
  email: "user@example.com",
  password: "securePassword",
  firstName: "John",
  lastName: "Doe",
  role: "user"
};

try {
  const { success, user, profile } = await authService.register(userData);
  console.log('User registered:', profile.profile.displayName);
  console.log('Flashcard decks created:', profile.stats.flashcardDecksCreated);
} catch (error) {
  console.error('Registration failed:', error.message);
}

// Enhanced sign in with profile loading
try {
  const { user, profile } = await authService.signIn(email, password);
  console.log('User stats:', profile.stats);
  console.log('Recent activities:', profile.cache);
} catch (error) {
  console.error('Sign in failed:', error.message);
}
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
- `createQuiz(quizData)` - Create new quiz with enhanced schema support
- `getQuizById(quizId)` - Get specific quiz with schema normalization
- `getQuizzes(options)` - Get quizzes with filtering/pagination
- `browseCustomQuizzes(filters)` - Server-side filtered quiz browsing with Firestore indexes
- `updateQuiz(quizId, updates)` - Update existing quiz
- `deleteQuiz(quizId)` - Soft delete quiz
- `submitQuizAttempt(quizId, attemptData)` - Submit quiz attempt via Cloud Functions
- `getUserAttempts(userId, quizId)` - Get user's quiz attempts
- `getQuizStatistics(quizId)` - Get quiz analytics via Cloud Functions
- `duplicateQuiz(quizId, overrides)` - Duplicate existing quiz with schema compatibility
- `createValidatedQuizObject(quizInput)` - Create comprehensive quiz with validation
- `submitCustomQuiz(quizObject)` - Submit quiz via optimized Cloud Function
- `getCustomQuizzesByUser(userId)` - Get user's custom quizzes with caching
- `normalizeQuizData(quiz)` - Normalize between old and new schema formats

### Advanced Filtering: `browseCustomQuizzes(options = {})`
**Server-side processing with Firestore indexes for optimal performance**  
**Parameters:**
- `searchTerm` (string): Search term for title/tags
- `sortBy` (string): Sort method ('newest', 'oldest', 'title', 'attempts', 'score')
- `privacy` (string): Privacy filter ('all', 'public', 'private')
- `limit` (number): Maximum results (default: 50)
- `currentUserId` (string): Current user ID for private quiz access
- `useIndexes` (boolean): Whether to use optimized indexed queries (default: true)
- `fields` (Array): Specific fields to return for efficient data transfer

**Database Schema Compatibility**:
The service handles both old flat schema and new nested schema formats:

```javascript
// Handles both schema formats automatically
const result = await quizService.browseCustomQuizzes({
  searchTerm: 'algebra',
  sortBy: 'newest',
  privacy: 'public',
  limit: 20,
  useIndexes: true  // Uses optimized Firestore composite indexes
});

// Returns normalized data regardless of source schema
console.log(result.quizzes[0].title);  // Works for both old and new formats
console.log(result.quizzes[0].creator); // Normalized creator information
console.log(result.meta.indexesUsed);  // Performance metadata
```

**Usage Example**:
```javascript
import quizService from '../services/quizService';

// Create quiz with comprehensive validation
const quizInput = {
  quizName: "Advanced Mathematics Quiz",
  quizData: [
    ["What is 2+2?", "3", "4", "5", "6", "4", "Multiple", "Basic addition", "2"],
    ["Is Pi greater than 3?", "True", "False", "", "", "True", "TrueFalse", "Pi value", "1"]
  ],
  quizTags: "math, arithmetic, basic",
  privateQuiz: false,
  currentUserId: "user123",
  userQuizzes: []
};

const validation = quizService.createValidatedQuizObject(quizInput);
if (validation.success) {
  const result = await quizService.submitCustomQuiz(validation.quizObject);
  console.log('Quiz created:', result.uid);
}

// Get user's quizzes with schema normalization
const userQuizzes = await quizService.getCustomQuizzesByUser(userId);
userQuizzes.forEach(quiz => {
  // Normalized data works regardless of database schema version
  console.log(`${quiz.title} by ${quiz.creator} - ${quiz.numQuestions} questions`);
});

// Browse with advanced filtering using Firestore indexes
const browsedQuizzes = await quizService.browseCustomQuizzes({
  searchTerm: 'mathematics',
  sortBy: 'newest',
  privacy: 'public',
  useIndexes: true,
  limit: 25
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

**Current Database Integration**:
The questionService integrates with the existing `quizmaster-questions` collection and supports the current schema:

```javascript
// Current question schema format
{
  question: "string",           // Question text
  option_1: "string",          // First option
  option_2: "string",          // Second option  
  option_3: "string",          // Third option
  option_4: "string",          // Fourth option
  correct_answer: "string",    // Correct answer
  explanation: "string",       // Optional explanation
  category: "string",          // Subject category
  sub_category: "string",      // Subcategory
  tags: ["string"],           // Search tags
  difficulty: "1" | "2" | "3" | "4" | "5", // Difficulty level
  questionType: "multiple-choice" | "true-false",
  createdAt: "timestamp",
  updatedAt: "timestamp",
  createdBy: "string",        // Admin/developer UID
  isActive: "boolean"
}
```

**Usage Example**:
```javascript
import questionService from '../services/questionService';

// Create question following current schema
const question = await questionService.createQuestion({
  question: "What is the capital of France?",
  option_1: "London",
  option_2: "Berlin", 
  option_3: "Paris",
  option_4: "Madrid",
  correct_answer: "Paris",
  category: "Geography",
  sub_category: "European Capitals",
  difficulty: "2",
  questionType: "multiple-choice",
  createdBy: adminUserId
});

// Get questions by category (integrates with existing database)
const questions = await questionService.getQuestions({
  category: "Geography",
  difficulty: "2",
  isActive: true
});
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
- `getAllResults(userId)` - **OPTIMIZED V2**: Batch fetch all result types with intelligent caching (5min cache)
- `getAttemptById(attemptId)` - Get specific quiz attempt from `quizAttempts` collection
- `getUserAttempts(userId, options)` - Get user's attempts with pagination
- `getQuizAttempts(quizId, options)` - Get all attempts for a specific quiz
- `getQuizAnalytics(quizId)` - Get detailed quiz analytics via Cloud Functions
- `getUserPerformanceSummary(userId)` - Get comprehensive user performance data
- `exportQuizResults(quizId, options)` - Export results to CSV format
- `calculateGradeStatistics(attempts)` - Calculate grade distributions and metrics

**Performance Features**:
- **Intelligent Caching**: 5-minute cache for `getAllResults()` prevents redundant API calls
- **Batch Operations**: Single `getAllResults()` call replaces 6 separate category-specific calls
- **Dashboard Optimization**: Reduces dashboard loading from 30+ seconds to 3-5 seconds
- **Cache Management**: Automatic cache invalidation and timestamp-based expiry

**Analytics Features**:
- Average scores and completion rates
- Question-level performance analysis
- Time-based performance trends
- Grade distribution breakdowns
- Passing/failing rate calculations

**Usage Example**:
```javascript
import resultService from '../services/resultService';

// OPTIMIZED: Get all results in single call (6x performance improvement)
const allResults = await resultService.getAllResults(userId);
console.log('History results:', allResults.history);
console.log('Science results:', allResults.science);
console.log('Math results:', allResults.mathematics);
// All categories loaded in one optimized call

// Get specific quiz attempts with pagination
const { attempts, hasMore, lastDoc } = await resultService.getUserAttempts(userId, {
  limitCount: 20,
  orderByField: 'submittedAt',
  orderDirection: 'desc'
});

// Get analytics via Cloud Functions
const analytics = await resultService.getQuizAnalytics(quizId);
console.log(`Average score: ${analytics.averageScore}%`);
console.log(`Total attempts: ${analytics.totalAttempts}`);

// Access cached data (no additional API calls)
const cachedResults = await resultService.getAllResults(userId); // Uses cache if within 5 minutes
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
All services use consistent timestamp utilities with schema compatibility:
```javascript
import { timestamp } from '../services/firebaseService';

// Creating timestamps (Firestore format)
const now = timestamp.now();
const firestoreDate = timestamp.toFirestore(new Date());

// Reading timestamps (handles both formats)
const jsDate = timestamp.fromFirestore(firestoreTimestamp);

// Schema-aware timestamp handling
const quiz = await quizService.getQuizById(quizId);
// Handles both:
// Old: { createdAt: FirestoreTimestamp }
// New: { timestamps: { createdAt: "ISO string" } }
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

## 📊 **Database Schema Integration & Compatibility**

### **Current Collections & Schemas**

#### **Users Collection** 
- **Schema**: Complete nested structure following DATABASE_SCHEMA.md
- **Key Fields**: Enhanced with `stats.flashcardDecksCreated` and `cache.recentFlashcardIds`
- **Compatibility**: Full schema compliance with role-based permissions

#### **custom_quizzes Collection**
- **Schema Evolution**: Supports both legacy flat schema and new nested schema
- **Normalization**: `normalizeQuizData()` method handles format differences automatically
- **Key Features**: Metadata-driven structure with comprehensive analytics tracking

#### **flashcard_decks Collection** 
- **Schema**: New comprehensive deck-based structure
- **Integration**: Unified patterns with quiz system for consistency
- **Performance**: Optimized with proper Firestore composite indexes

#### **quizmaster-questions Collection**
- **Schema**: Existing flat structure maintained for compatibility
- **Fields**: `question`, `option_1-4`, `correct_answer`, `category`, `sub_category`
- **Usage**: Default question bank for system-generated quizzes

### **Schema Compatibility Patterns**

```javascript
// Service layer handles schema differences transparently
const quiz = await quizService.getQuizById(quizId);

// Works with both formats:
// Old: { title: "Quiz Title", creator: "userId", numQuestions: 10 }  
// New: { metadata: { title: "Quiz Title" }, creator: { uid: "userId" }, content: { totalQuestions: 10 } }

const normalizedQuiz = quizService.normalizeQuizData(quiz);
console.log(normalizedQuiz.title);        // Always works
console.log(normalizedQuiz.creator);      // Always works  
console.log(normalizedQuiz.numQuestions); // Always works
```

### **Data Migration & Versioning**
- **Gradual Migration**: New features use enhanced schema while maintaining backwards compatibility
- **Version Tracking**: Schema versioning in metadata for future migrations
- **Data Consistency**: Services ensure data integrity across schema versions

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

---

### 6. flashcardService.js
**Purpose**: Manages flashcard deck operations and data persistence

**Key Features**:
- Full CRUD operations for flashcard decks
- Server-side data validation and normalization
- User statistics tracking (deck creation count)
- Integration with Firebase Functions for optimal performance
- Real-time deck management with proper error handling
- Data structure validation for deck consistency

**Main Methods**:
- `createValidatedDeckObject(deckData)` - Validate and structure deck data
- `submitFlashcardDeck(deckData)` - Create new flashcard deck
- `getUserFlashcardDecks(userId)` - Get user's flashcard decks
- `getFlashcardDeck(deckId)` - Get specific deck by ID
- `deleteFlashcardDeck(deckId, userId)` - Soft delete deck with verification
- `normalizeDeckData(rawData)` - Normalize Firebase response data

**Data Validation Features**:
- Deck metadata validation (title, description, category)
- Card content validation (front/back text requirements)
- User permissions verification
- Schema compliance checking

**Firebase Integration**:
- Uses `addCustomFlashcardDeck` Cloud Function for deck creation
- Uses `getUserFlashcardDecks` Cloud Function for deck retrieval
- Uses `deleteFlashcardDeck` Cloud Function for safe deletion
- Automatic user stats updates on deck operations

**Usage Example**:
```javascript
import flashcardService from '../services/flashcardService';

// Create a new flashcard deck
const deckData = {
  title: "Spanish Vocabulary",
  description: "Basic Spanish words and phrases",
  category: "Languages",
  tags: "spanish, vocabulary, beginner",
  cards: {
    "Card 1": {
      front: "Hola",
      back: "Hello",
      type: "basic"
    },
    "Card 2": {
      front: "Gracias", 
      back: "Thank you",
      type: "basic"
    }
  },
  isPublic: false
};

try {
  const newDeck = await flashcardService.submitFlashcardDeck(deckData);
  console.log('Deck created successfully:', newDeck.id);
} catch (error) {
  console.error('Failed to create deck:', error.message);
}

// Get user's flashcard decks
const userDecks = await flashcardService.getUserFlashcardDecks(userId);
console.log(`User has ${userDecks.length} flashcard decks`);

// Delete a flashcard deck
await flashcardService.deleteFlashcardDeck(deckId, userId);
```

**Data Structure**:
```javascript
// Flashcard Deck Schema
{
  metadata: {
    title: "string",
    description: "string", 
    category: "string",
    tags: "string",
    cardCount: "number",
    isPublic: "boolean",
    difficulty: "string",
    version: "number"
  },
  creator: {
    uid: "string",
    displayName: "string",
    username: "string"
  },
  content: {
    cards: {
      "Card 1": {
        front: "string",
        back: "string",
        type: "string"
      }
      // ... additional cards
    }
  },
  timestamps: {
    createdAt: "string",
    updatedAt: "string"
  }
}
```

**Performance Optimizations**:
- Server-side deck filtering by user ownership
- Batch operations for deck retrieval
- Optimized queries with proper Firestore indexing
- User statistics updates in single atomic operations
- Real-time data synchronization across components

---

## 🔄 **Recent System Enhancements (October 2025)**

### **Flashcard System Integration**
- **Complete CRUD Service**: Full flashcard deck management through flashcardService.js
- **User Statistics**: Automatic tracking of deck creation and usage in user profiles
- **Firebase Functions**: 4 new optimized functions for flashcard operations
- **Data Consistency**: Unified schema patterns across quiz and flashcard systems

### **Database Schema Updates**
- **User Schema**: Added `flashcardDecksCreated` and `recentFlashcardIds` tracking
- **New Collection**: `flashcard_decks` with comprehensive metadata and analytics structure
- **Firestore Indexes**: Optimized composite indexes for flashcard queries
- **Data Migration**: Clean integration without disrupting existing quiz functionality

### **Performance Achievements**
- **Dashboard Optimization**: 6x performance improvement (30+ seconds → 3-5 seconds)
- **API Efficiency**: 83% reduction in HTTP requests through batch operations
- **Database Reads**: 95% reduction in database operations through server-side filtering
- **Real-Time Updates**: User statistics updated atomically with deck operations

### **Architecture Improvements**
- **Service Layer Expansion**: Added comprehensive flashcardService.js with validation
- **Context Integration**: Flashcard data flows through existing context patterns
- **Route Protection**: Flashcard routes properly integrated with authentication system
- **UI Consistency**: Flashcard components follow established design patterns

### **Development Standards**
- **Code Quality**: All new services follow established patterns and error handling
- **Documentation**: Comprehensive documentation for all flashcard functionality
- **Testing Ready**: Services designed for easy unit testing and mocking
- **Maintainability**: Consistent patterns across all service layer components

This service layer now provides a complete, scalable foundation for the QuizMaster application, supporting both traditional quiz functionality and the new flashcard system with optimal performance and user experience.