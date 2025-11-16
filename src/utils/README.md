# Utility Functions

This directory contains reusable utility functions used throughout the QuizMaster application.

## Core Utilities

### csvUploader.js
**Purpose:** Handle CSV file uploads for bulk question import.

**Functions:**
- `handleCSVUpload(file, setQuestions)` - Parse and validate CSV files, converting them into question objects
- CSV format validation and error handling
- Support for 5 question types: multiple choice, true/false, short answer, fill-in-the-blank, matching

---

### shuffle.js
**Purpose:** Randomize arrays for quiz presentation.

**Functions:**
- `shuffle(array)` - Returns a shuffled copy of an array using Fisher-Yates algorithm
- Used for randomizing question order and answer options

---

## Question Management Utilities (November 2025)

### questionTypes.js
**Purpose:** Constants and configurations for question types and difficulty levels.

**Exports:**
- `QUESTION_TYPES` - Object with constants for question type values (MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER, FILL_IN_BLANK, MATCHING)
- `DIFFICULTY_LEVELS` - Object with difficulty level constants (EASY, MEDIUM, HARD)
- `getDifficultyLabel(difficulty)` - Convert difficulty value to display label
- `validateDifficulty(difficulty)` - Check if difficulty value is valid
- `createEmptyQuestion(type)` - Create a blank question object with proper structure for given type

---

### questionValidator.js
**Purpose:** Question validation and building logic.

**Exports:**
- `verifyQuestionInput(currentQuestion)` - Validate question object has all required fields
- `buildQuestionArray(currentQuestion, selectedCorrectAnswers, questionDifficulty)` - Construct final question object with answers and metadata
- `validateCSVQuestion(question)` - Validate question from CSV import

**Used by:** QuizCreation.jsx for form validation before submission

---

### tagProcessor.js
**Purpose:** Tag processing and validation utilities.

**Exports:**
- `processTagsFromInput(input)` - Convert comma-separated string to tag array
- `tagsToString(tags)` - Convert tag array to comma-separated string
- `isValidTag(tag)` - Check if tag meets validation rules
- `sanitizeTag(tag)` - Clean and format tag string
- `getUniqueTags(tags)` - Remove duplicate tags from array

**Used by:** QuizCreation.jsx, Dashboard components for tag management

---

### csvParser.js
**Purpose:** CSV file parsing for bulk question upload.

**Exports:**
- `parseCSVQuestions(csvText)` - Parse CSV text into question objects
- `validateCSVFile(file)` - Validate CSV file format and size
- `readFileAsText(file)` - Read file contents as text with error handling

**Used by:** QuizCreation.jsx for CSV bulk import feature

---

## Architecture Notes

### Refactoring (November 2025)
The question management utilities (questionTypes, questionValidator, tagProcessor, csvParser) were extracted from QuizCreation.jsx to:
- Reduce component complexity (760 lines → 570 lines, 25% reduction)
- Improve testability and maintainability
- Enable reuse across components
- Separate business logic from UI logic

### Usage Pattern
```javascript
import { QUESTION_TYPES, createEmptyQuestion } from '../utils/questionTypes';
import { verifyQuestionInput, buildQuestionArray } from '../utils/questionValidator';
import { processTagsFromInput } from '../utils/tagProcessor';
import { parseCSVQuestions } from '../utils/csvParser';
```
