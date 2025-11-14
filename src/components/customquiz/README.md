# CustomQuiz Components

## Purpose
Comprehensive quiz creation and management system with optimized data handling and server-side processing.

## Architecture (September 2025)

### Performance Features
- **Server-Side Operations**: Quiz browsing and filtering handled by Firebase Functions
- **Intelligent Caching**: Context-based data management reduces redundant API calls
- **Batch Processing**: Efficient CRUD operations for quiz and question management

## Components

### `CustomQuiz.jsx`
Main container for custom quiz management and browsing.

**Key Features:**
- Integration with `browseCustomQuizzes()` for optimized quiz retrieval
- Server-side filtering by difficulty, category, and search terms
- Efficient rendering of large quiz collections
- Context-driven state management

### `QuizCreation.jsx` 
Handles quiz metadata creation (title, description, settings) and question building.

**Functionality:**
- Quiz configuration and settings management
- Tag and category assignment
- Privacy and access controls
- Multiple question type support (Multiple Choice, True/False, Fill in Blank, Multiple Answer, Drag & Drop)
- CSV bulk upload for questions
- Difficulty level selection (1-5 scale)
- Integration with quizService for efficient creation

**Recent Refactoring (November 2025):**
- Extracted business logic to utility files (csvParser.js, questionValidator.js, tagProcessor.js, questionTypes.js)
- Custom hooks for state management (useQuizForm, useQuestionForm, useCSVUpload)
- Reduced component size by 25% while maintaining all functionality

### `QuizQuestionsList.jsx`
Manages individual quiz questions and answers.

**Key Features:**
- Question CRUD operations
- Bulk question import/export
- Real-time validation and formatting
- Optimized rendering for question lists

### `EditCustomQuiz.jsx`
Enables editing of existing quizzes with full functionality.

**Architecture:**
- Uses CustomQuizContext for centralized quiz state
- Efficient data loading and caching
- Real-time updates with optimistic UI patterns

### `EditQuestion.jsx`
Individual question editing interface.

**Features:**
- Rich text editing for questions and answers
- Media attachment support
- Question type management
- Auto-save functionality

## Service Integration
- **quizService.js**: Handles all quiz-related API operations
- **browseCustomQuizzes()**: Server-side filtering and search
- **CustomQuizContext**: Centralized state management and caching
- **Batch Operations**: Optimized database interactions

## Performance Benefits
- **Reduced Load Times**: Server-side processing eliminates client-side data manipulation
- **Efficient Browsing**: Advanced filtering without performance penalties
- **Smart Caching**: Context providers prevent redundant API calls
- **Responsive UI**: Optimistic updates and efficient rendering patterns