# Unified Quiz Structure Documentation

## Overview
This document describes the unified quiz structure that is now consistent across both **default quizzes** and **custom quizzes** in QuizMaster. While the databases remain separate, the question format is now standardized.

## Key Changes

### 1. **Difficulty Scale**
- **Type**: Number (not string)
- **Range**: 1-5
  - 1 = Very Easy
  - 2 = Easy
  - 3 = Medium (default)
  - 4 = Hard
  - 5 = Very Hard

### 2. **Answer Options**
- **Flexible Count**: Questions can have 2-4 answer options
- **Unified Format**: Uses `option_1`, `option_2`, `option_3`, `option_4` ONLY
- **No letter format**: The `a`, `b`, `c`, `d` format has been removed for consistency

### 3. **Question Types**
- `Multiple` - Multiple choice with one correct answer
- `TrueFalse` - True/False questions
- `FillInTheBlank` - Fill in the blank
- `MultipleAnswer` - Multiple correct answers
- `DragAndDrop` - Drag and drop interaction

---

## Database Structures

### Default Quiz Question Format (default-questions collection)

```json
{
  "question": "Who wrote \"The Great Gatsby\"?",
  "option_1": "Ernest Hemingway",
  "option_2": "F. Scott Fitzgerald",
  "option_3": "John Steinbeck",
  "option_4": "William Faulkner",
  "correct_answer": "F. Scott Fitzgerald",
  "category": "entertainment",
  "sub-category": "Books",
  "difficulty": 2,
  "type": "Multiple"
}
```

### Custom Quiz Question Format (quizzes collection)

```json
{
  "content": {
    "questions": {
      "Question 1": {
        "question": "When was the first QuizMaster quiz created?",
        "type": "Multiple",
        "option_1": "October 2, 2025",
        "option_2": "October 1, 2025",
        "option_3": "September 29, 2025",
        "option_4": "September 30, 2025",
        "correct_answer": "October 2, 2025",
        "difficulty": 3,
        "explanation": "",
        "points": 1
      }
    },
    "totalQuestions": 1
  },
  "creator": {
    "userId": "ZMrvZTKaGRa9tB1hA9XgI742i4p1",
    "username": "Anonymous User",
    "verified": false
  },
  "metadata": {
    "title": "First Ever QuizMaster Quiz!",
    "description": "",
    "category": "General",
    "difficulty": "3",
    "tags": ["Trivia"],
    "version": "1.0.0"
  },
  "timestamps": {
    "createdAt": "2025-10-02T20:05:07.331Z",
    "updatedAt": "2025-10-02T20:05:07.331Z"
  }
}
```

---

## Simplified Structure

### Why Only `option_1, option_2, option_3, option_4`?

The unified structure uses **numbered options only** for:

1. **Consistency**
   - Single format across all quizzes
   - Easier to maintain and debug
   - No confusion between formats

2. **Flexibility**
   - Easily supports 2-4 answer options
   - Simple array-based iteration
   - Clear numbering system

3. **Simplicity**
   - No duplicate data
   - Smaller database footprint
   - Cleaner code

---

## Question Creation Examples

### Example 1: Default Quiz Question (2 Answers)
```json
{
  "question": "Is the Earth round?",
  "option_1": "True",
  "option_2": "False",
  "option_3": "",
  "option_4": "",
  "correct_answer": "True",
  "category": "science",
  "sub-category": "Geography",
  "difficulty": 1,
  "type": "TrueFalse"
}
```

### Example 2: Custom Quiz Question (3 Answers)
```json
{
  "Question 1": {
    "question": "What is the capital of France?",
    "type": "Multiple",
    "option_1": "London",
    "option_2": "Paris",
    "option_3": "Berlin",
    "option_4": "",
    "correct_answer": "Paris",
    "difficulty": 2,
    "explanation": "Paris has been the capital of France since 987 AD",
    "points": 1
  }
}
```

### Example 3: Custom Quiz Question (4 Answers)
```json
{
  "Question 1": {
    "question": "Which programming language is used for web development?",
    "type": "Multiple",
    "option_1": "Python",
    "option_2": "JavaScript",
    "option_3": "Java",
    "option_4": "C++",
    "correct_answer": "JavaScript",
    "difficulty": 3,
    "explanation": "",
    "points": 1
  }
}
```

---

## Component Updates

### Files Modified:
1. **`src/services/quizService.js`**
   - Updated `createQuizDataObject()` to generate only `option_1` through `option_4`
   - Removed `a`, `b`, `c`, `d` format entirely
   - Difficulty stored as number (1-5)

2. **`src/components/customquiz/QuizCreation.jsx`**
   - Added difficulty selector (1-5)
   - Added answer count selector (2-4 options)
   - Updated question array to include difficulty at index 8

3. **`src/components/developer/AddDefaultQuestion.jsx`**
   - Added difficulty selector with visual buttons
   - Added answer count selector (2-4 options)
   - Validates difficulty is numeric (1-5)
   - Creates questions in unified format with `option_1` through `option_4`

### Quiz Activity Components:
- **`QuizActivity.jsx`** - Uses `option_1`, `option_2`, etc. and `correct_answer`
- **`CustomQuizActivity.jsx`** - Uses `option_1`, `option_2`, etc. and `correct_answer`
- Both components standardized on numbered format

---

## Firebase Structure

### Default Questions Collection: `default-questions`
```
default-questions/
  └── {questionId}/
      ├── question: string
      ├── option_1: string
      ├── option_2: string
      ├── option_3: string
      ├── option_4: string
      ├── correct_answer: string
      ├── category: string
      ├── sub-category: string
      ├── difficulty: number (1-5)
      └── type: string
```

### Custom Quizzes Collection: `quizzes`
```
quizzes/
  └── {quizId}/
      ├── content/
      │   ├── questions/
      │   │   └── Question 1/
      │   │       ├── question: string
      │   │       ├── type: string
      │   │       ├── option_1: string
      │   │       ├── option_2: string
      │   │       ├── option_3: string
      │   │       ├── option_4: string
      │   │       ├── correct_answer: string
      │   │       ├── difficulty: number (1-5)
      │   │       ├── explanation: string
      │   │       └── points: number
      │   └── totalQuestions: number
      ├── metadata/
      ├── creator/
      ├── timestamps/
      └── analytics/
```

---

## Migration Guide

### For Existing Quizzes:
1. **Legacy quizzes** with `a`, `b`, `c`, `d` format should be migrated or handled with fallbacks
2. New quizzes will use only `option_1`, `option_2`, `option_3`, `option_4`
3. Components should check for `option_1` as the primary format

### For Developers:
When accessing quiz data in components:
```javascript
// ✅ RECOMMENDED: Use numbered options
const option1 = question.option_1;
const option2 = question.option_2;
const option3 = question.option_3;
const option4 = question.option_4;
const correct = question.correct_answer;

// ✅ RECOMMENDED: Parse difficulty as number
const difficulty = parseInt(question.difficulty) || 3;

// ✅ OPTIONAL: Fallback for legacy questions (if needed)
const option1 = question.option_1 || question.a || '';
const correct = question.correct_answer || question.correct || '';
```

---

## Best Practices

### Creating Questions:
1. Always set difficulty as a **number** between 1-5
2. Use only `option_1`, `option_2`, `option_3`, `option_4` format
3. For questions with fewer than 4 answers, leave unused options as empty strings
4. Ensure `correct_answer` matches exactly one of the options

### Validation:
```javascript
// Validate difficulty
const isValidDifficulty = (diff) => {
  const num = parseInt(diff);
  return !isNaN(num) && num >= 1 && num <= 5;
};

// Validate answer count
const isValidAnswerCount = (count) => {
  return count >= 2 && count <= 4;
};

// Validate correct answer exists in options
const isValidCorrectAnswer = (question) => {
  const options = [
    question.option_1,
    question.option_2,
    question.option_3,
    question.option_4
  ].filter(Boolean);
  
  return options.includes(question.correct_answer);
};
```

---

## Summary

✅ **Unified Structure**: Both default and custom quizzes use `option_1` through `option_4`
✅ **Separate Databases**: Collections remain separate (`default-questions` vs `quizzes`)
✅ **Simplified Format**: Single numbering system, no letter-based options
✅ **Flexible Options**: Support for 2-4 answer options
✅ **Numeric Difficulty**: 1-5 scale stored as numbers
✅ **Clean and Maintainable**: Easier to understand and modify

---

## Contact
For questions about this structure, contact the development team or refer to:
- `src/services/quizService.js` - Quiz creation logic
- `src/components/customquiz/QuizCreation.jsx` - Custom quiz UI
- `src/components/developer/AddDefaultQuestion.jsx` - Default quiz UI
