# Firebase Functions Documentation

## Overview
This directory contains 17 optimized Firebase Cloud Functions that power the QuizMaster backend, providing secure API endpoints for quiz management, flashcards, user tracking, and analytics. The functions utilize Firebase v2 runtime with CORS support and comprehensive error handling.

## 🏗️ Architecture

### Modular Structure
The Firebase Functions have been refactored from a monolithic 1500-line `index.js` file into a clean, modular architecture for better maintainability and developer experience.

```
src/
├── index.js              # Main entry point - imports and exports all functions
├── questions/
│   └── index.js          # Question management functions
├── quizzes/
│   └── index.js          # Quiz CRUD and browsing functions
├── results/
│   └── index.js          # Quiz results and statistics functions
├── flashcards/
│   └── index.js          # Flashcard deck management functions
└── study/
    └── index.js          # Study material functions
```

### Benefits of Modular Architecture
- **Better Developer Experience**: New developers can focus on specific feature areas without being overwhelmed
- **Improved Maintainability**: Functions grouped by domain make code easier to find and modify
- **Faster Cold Starts**: Firebase can load only the modules needed for specific functions
- **Clear Separation of Concerns**: Each module handles a specific business domain
- **Easier Testing**: Individual modules can be tested in isolation

## 📋 Functions by Module

### 🔍 Questions Module (`questions/index.js`)
Functions related to question bank management and retrieval.

#### addDefaultQuestion
Adds new questions to the default question bank collection for quiz generation. Used primarily by developers to populate the question database with properly formatted quiz questions.

#### grabSubV2
Retrieves subject-specific quiz data with performance optimizations and caching. Handles subject-based quiz filtering for category-specific quiz selection interfaces.

#### getSubcategories
Dynamically fetches available subcategories for a specific category from the database instead of using hardcoded values.

### 🎯 Quizzes Module (`quizzes/index.js`)
Functions for custom quiz creation, retrieval, and browsing.

#### grabCustomQuiz
Retrieves a specific custom quiz by ID with optional download functionality. Handles quiz data fetching and supports quiz export features for sharing and backup purposes.

#### trackQuizAttempt
Tracks user quiz attempts and updates user statistics using Firebase callable functions. Records quiz performance metrics and maintains user progress data for dashboard analytics.

#### grabAllCustomQuizzes
Fetches all custom quizzes from the database with basic filtering capabilities. Provides a comprehensive list of available quizzes for browse functionality and admin management.

#### browseCustomQuizzesOptimized
Server-side filtered quiz browsing with 70-90% data reduction compared to client-side filtering. Optimizes network usage by returning only relevant quiz metadata based on search criteria.

#### addCustomQuiz
Creates new custom quizzes with full question validation and user association. Handles quiz creation workflow including metadata processing, question validation, and database storage.

#### grabUserCustomQuizzesV2
Fetches user-specific custom quizzes with enhanced filtering and sorting capabilities. Optimized for user dashboard display with reduced data transfer and faster loading times.

#### browseCustomQuizzesV2
Enhanced version of quiz browsing with server-side processing and advanced filtering. Provides improved search functionality with pagination and relevance-based sorting.

### 📊 Results Module (`results/index.js`)
Functions for quiz result processing and user statistics.

#### grabAllResultsV2
Optimized batch retrieval of all user quiz results with 6x performance improvement over v1. Consolidates multiple database queries into efficient batch operations for dashboard loading.

#### submitQuizResults
Processes and stores quiz completion results with comprehensive analytics tracking. Handles result submission, score calculation, user statistics updates, and performance analytics storage.

### 🃏 Flashcards Module (`flashcards/index.js`)
Functions for flashcard deck management and study sessions.

#### addCustomFlashcardDeck
Creates new flashcard decks with user association and statistics tracking. Handles flashcard deck creation including validation, user permissions, and initial statistics setup.

#### getUserFlashcardDecks
Retrieves all flashcard decks belonging to a specific user with filtering options. Provides user-specific flashcard management for the dashboard and study interfaces.

#### getFlashcardDeck
Fetches individual flashcard deck data by ID for study sessions. Handles single deck retrieval with full card data for interactive flashcard study functionality.

#### deleteFlashcardDeck
Soft deletion of flashcard decks with user verification and cleanup. Manages flashcard deck removal while maintaining data integrity and user statistics accuracy.

### 📚 Study Module (`study/index.js`)
Functions for educational content and study materials.

#### getStudyMaterial
Retrieves study materials and educational content associated with quiz topics. Provides supplementary learning resources to enhance the quiz-taking experience.

## 🚀 Deployment

### Prerequisites
- Firebase CLI installed and configured
- Access to QuizMaster Firebase project
- Node.js 20+ runtime

### Deploy Commands
```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:functionName

# List all deployed functions
firebase functions:list
```

### Environment
- **Runtime**: Node.js 20 (2nd Gen)
- **Region**: us-central1
- **Memory**: 256 MB per function
- **Triggers**: HTTPS (except trackQuizAttempt which is callable)

## 🔧 Development

### Adding New Functions
1. Determine which module the function belongs to
2. Add the function to the appropriate module file (e.g., `questions/index.js`)
3. Export the function from the module
4. Import and re-export from `src/index.js`
5. Test locally before deploying

### Module Guidelines
- **Questions**: Question bank management and retrieval
- **Quizzes**: Custom quiz CRUD operations and browsing
- **Results**: Quiz result processing and user statistics
- **Flashcards**: Flashcard deck management
- **Study**: Educational content and study materials

### Best Practices
- All functions include CORS support
- Comprehensive error handling implemented
- Firebase Admin SDK for database operations
- Optimized queries with proper indexing
- Input validation and sanitization
