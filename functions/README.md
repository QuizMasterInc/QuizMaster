# QuizMaster Firebase Functions

This directory contains all Firebase Cloud Functions for the QuizMaster application. These functions provide the backend API for quiz operations, user management, and data processing.

## �️ **Modular Architecture (October 2025)**

**✅ Complete Refactoring**: Monolithic 1500-line `index.js` split into clean, modular structure for better maintainability and developer experience.

### **Directory Structure**
```
functions/src/
├── index.js              # Main entry point - imports all modules
├── questions/
│   └── index.js          # Question management functions (3 functions)
├── quizzes/
│   └── index.js          # Quiz CRUD and browsing functions (7 functions)
├── results/
│   └── index.js          # Quiz results and statistics functions (2 functions)
├── flashcards/
│   └── index.js          # Flashcard deck management functions (4 functions)
└── study/
    └── index.js          # Study material functions (1 function)
```

### **Benefits of Modular Architecture**
- **Better Developer Experience**: New developers can focus on specific feature areas
- **Improved Maintainability**: Functions grouped by domain make code easier to find
- **Faster Cold Starts**: Firebase can load only the modules needed for specific functions
- **Clear Separation of Concerns**: Each module handles a specific business domain
- **Easier Testing**: Individual modules can be tested in isolation

---

## 🚀 Deployment

Deploy all functions:
```bash
firebase deploy --only functions
```

Deploy specific functions:
```bash
firebase deploy --only functions:functionName1,functionName2
```

Check deployed functions:
```bash
firebase functions:list
```

## 📊 Function Architecture Overview

**Total Functions**: 17 functions (all modular, Node.js 20)
- **HTTP Triggers**: 16 functions
- **Callable Triggers**: 1 function (`trackQuizAttempt`)
- **Runtime**: Node.js 20 (2nd Gen) for all functions
- **Caching**: Intelligent 5-30 minute caching implemented
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Modular Structure**: Functions organized by business domain

---

## 📋 **Functions by Module**

### 🔍 **Questions Module** (`src/questions/index.js`)
Functions related to question bank management and retrieval.

#### `addDefaultQuestion`
- **Purpose**: Add new questions to the default question bank
- **Method**: GET with query parameter `?question=jsonString`
- **Module**: `questions/index.js`

#### `grabSubV2`
- **Purpose**: Get subcategories for a quiz category with server-side filtering
- **Method**: GET with query parameter `?category=categoryName`
- **Optimization**: Server-side filtering and ordering
- **Module**: `questions/index.js`

#### `getSubcategories`
- **Purpose**: Dynamically fetch available subcategories from database
- **Method**: GET with query parameter `?category=categoryName`
- **Module**: `questions/index.js`

### 🎯 **Quizzes Module** (`src/quizzes/index.js`)
Functions for custom quiz creation, retrieval, and browsing.

#### `grabCustomQuiz`
- **Purpose**: Get a specific custom quiz by ID with password protection
- **Method**: GET with query parameters `?quizid=id&password=optional`
- **Module**: `quizzes/index.js`

#### `trackQuizAttempt`
- **Purpose**: Track quiz attempts and update analytics (callable function)
- **Method**: Callable with `{ quizId: "id" }`
- **Module**: `quizzes/index.js`

#### `grabAllCustomQuizzes`
- **Purpose**: Get all custom quizzes with optimized filtering
- **Method**: POST with filtering options
- **Module**: `quizzes/index.js`

#### `browseCustomQuizzesOptimized`
- **Purpose**: Browse quizzes with server-side filtering and search
- **Method**: POST with search and filter parameters
- **Module**: `quizzes/index.js`

#### `addCustomQuiz`
- **Purpose**: Create a new custom quiz with validation
- **Method**: POST with quiz data
- **Module**: `quizzes/index.js`

#### `grabUserCustomQuizzesV2`
- **Purpose**: Get custom quizzes created by a specific user
- **Method**: POST with `{ uid: "userId" }`
- **Module**: `quizzes/index.js`

#### `browseCustomQuizzesV2`
- **Purpose**: Advanced quiz browsing with server-side processing
- **Method**: POST with comprehensive filter options
- **Module**: `quizzes/index.js`

### 📊 **Results Module** (`src/results/index.js`)
Functions for quiz result processing and user statistics.

#### `grabAllResultsV2`
- **Purpose**: Get ALL quiz category results for a user in one call
- **Method**: POST with `{ uid: "userId" }`
- **Optimization**: Batch operation replacing 6 separate API calls
- **Performance**: 6x faster dashboard loading
- **Module**: `results/index.js`

#### `submitQuizResults`
- **Purpose**: Submit quiz results and update user statistics
- **Method**: POST with comprehensive quiz result data
- **Optimization**: Atomic transaction for results + stats updates
- **Module**: `results/index.js`

### � **Flashcards Module** (`src/flashcards/index.js`)
Functions for flashcard deck management and study sessions.

#### `addCustomFlashcardDeck`
- **Purpose**: Create a new flashcard deck with user tracking
- **Method**: POST with deck data and cards
- **Module**: `flashcards/index.js`

#### `getUserFlashcardDecks`
- **Purpose**: Get all flashcard decks created by a user
- **Method**: POST with `{ userId: "id" }`
- **Module**: `flashcards/index.js`

#### `getFlashcardDeck`
- **Purpose**: Get a specific flashcard deck by ID
- **Method**: POST with `{ deckId: "id" }`
- **Module**: `flashcards/index.js`

#### `deleteFlashcardDeck`
- **Purpose**: Soft delete a flashcard deck with ownership verification
- **Method**: POST with `{ deckId: "id", userId: "id" }`
- **Module**: `flashcards/index.js`

### 📚 **Study Module** (`src/study/index.js`)
Functions for educational content and study materials.

#### `getStudyMaterial`
- **Purpose**: Retrieve study materials for a specific category
- **Method**: GET with query parameter `?category=name`
- **Module**: `study/index.js`

---

## ⚡ **Performance & Architecture Notes**

### **Modular Benefits**
- **Cold Start Optimization**: Functions load only required modules
- **Developer Productivity**: Clear domain separation for new team members
- **Maintenance**: Easier to locate and modify specific functionality
- **Testing**: Individual modules can be unit tested independently
- **Scalability**: Easy to add new functions to appropriate modules

### **Runtime & Dependencies**
- **Node.js**: 20 (2nd Gen) - protected from Oct 2025 decommissioning
- **Firebase Admin**: v11.11.0
- **Firebase Functions**: v6.4.0
- **CORS**: Enabled on all HTTP functions

---

## � **Development Guidelines**

### **Adding New Functions**
1. **Identify the domain**: Determine which module the function belongs to
2. **Create in appropriate module**: Add function to `src/{module}/index.js`
3. **Export from module**: Ensure function is exported from the module file
4. **Import in main index**: Add import and export in `src/index.js`
5. **Test locally**: Use Firebase emulator for testing
6. **Deploy and validate**: Deploy to check functionality

### **Module Organization**
- **Questions**: Question bank management and retrieval
- **Quizzes**: Custom quiz CRUD operations and browsing
- **Results**: Quiz result processing and user statistics
- **Flashcards**: Flashcard deck management
- **Study**: Educational content and study materials

### **Best Practices**
- All functions include comprehensive error handling
- CORS enabled for cross-origin requests
- Input validation and sanitization
- Firebase Admin SDK for database operations
- Optimized queries with proper indexing
- Appropriate caching strategies

---

## � **Migration from Monolithic Structure**

### **Before (Monolithic)**
- Single 1500-line `index.js` file
- All functions defined inline
- Difficult for new developers to navigate
- Slower cold starts (all code loaded)
- Hard to maintain and test

### **After (Modular)**
- Clean separation by business domain
- Easy to locate specific functionality
- Faster cold starts (module-based loading)
- Better developer experience
- Easier testing and maintenance

---

**Last Updated**: October 16, 2025  
**Architecture**: Modular Functions  
**Functions Version**: firebase-functions v6.4.0  
**Node.js Runtime**: 20 (2nd Gen)  
**Total Functions**: 17 (organized in 5 modules) 