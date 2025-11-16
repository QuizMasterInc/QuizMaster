# Custom React Hooks

This directory contains custom React hooks used throughout the QuizMaster application for state management and side effects.

## Quiz Creation Hooks (November 2025)

These hooks were extracted from QuizCreation.jsx to improve maintainability and reduce component complexity.

### useQuizForm.js
**Purpose:** Manage quiz metadata state (name, privacy, tags, teacher mode).

**Returns:**
```javascript
{
  quizName: string,
  setQuizName: function,
  privateQuiz: boolean,
  setPrivateQuiz: function,
  privateQuizPassword: string,
  setPrivateQuizPassword: function,
  quizTags: array,
  setQuizTags: function,
  teacherQuiz: boolean,
  setTeacherQuiz: function,
  resetForm: function
}
```

**Usage:**
```javascript
import { useQuizForm } from '../../hooks/useQuizForm';

const {
  quizName,
  setQuizName,
  privateQuiz,
  setPrivateQuiz,
  // ... other values
} = useQuizForm();
```

---

### useQuestionForm.js
**Purpose:** Manage question form state (current question, answers, difficulty).

**Returns:**
```javascript
{
  currentQuestion: object,
  setCurrentQuestion: function,
  selectedCorrectAnswers: array,
  setSelectedCorrectAnswers: function,
  numAnswers: number,
  setNumAnswers: function,
  questionDifficulty: string,
  setQuestionDifficulty: function,
  resetQuestionForm: function
}
```

**Usage:**
```javascript
import { useQuestionForm } from '../../hooks/useQuestionForm';

const {
  currentQuestion,
  setCurrentQuestion,
  selectedCorrectAnswers,
  // ... other values
} = useQuestionForm();
```

---

### useCSVUpload.js
**Purpose:** Manage CSV file upload state and logic.

**Returns:**
```javascript
{
  selectedFile: File|null,
  isUploadingCSV: boolean,
  uploadError: string|null,
  handleFileSelect: function,
  handleCSVUpload: function,
  resetUpload: function
}
```

**Parameters:**
- `onQuestionsLoaded(questions)` - Callback function called when CSV is successfully parsed

**Usage:**
```javascript
import { useCSVUpload } from '../../hooks/useCSVUpload';

const {
  selectedFile,
  isUploadingCSV,
  uploadError,
  handleFileSelect,
  handleCSVUpload
} = useCSVUpload((questions) => {
  // Handle loaded questions
  setQuestions(questions);
});
```

---

## Architecture Notes

### Refactoring (November 2025)
These hooks were extracted from QuizCreation.jsx (~760 lines) to:
- Reduce component complexity by 25%
- Separate state management from UI logic
- Improve testability and reusability
- Follow React best practices for custom hooks

### Hook Patterns
- All hooks follow `use[Feature]` naming convention
- Each hook manages a specific domain of state
- Hooks return both state and state setters
- Hooks include reset functions for form clearing
- No side effects without explicit user action

### State Management Strategy
- `useQuizForm` - Quiz-level metadata (affects entire quiz)
- `useQuestionForm` - Question-level data (affects single question)
- `useCSVUpload` - File upload process (temporary UI state)

This separation ensures clear boundaries and prevents state coupling.
