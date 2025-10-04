# QuizMaster Database Schema

## Collections

### 1. `users`
```javascript
{
  uid: "string",
  email: "string",
  profile: {
    firstName: "string",
    lastName: "string",
    displayName: "string"
  },
  role: "user" | "developer" | "instructor",
  stats: {
    quizmasterQuizzesTaken: "number",
    quizmasterTotalScore: "number", 
    quizmasterAverageScore: "number",
    customQuizActivity: {
      totalTaken: "number",
      totalScore: "number",
      averageScore: "number",
      lastTaken: "timestamp"
    },
    categoryStats: {
      geography: { best: "number", avg: "number", attempts: "number", totalScore: "number" },
      science: { best: "number", avg: "number", attempts: "number", totalScore: "number" },
      sports: { best: "number", avg: "number", attempts: "number", totalScore: "number" },
      mathematics: { best: "number", avg: "number", attempts: "number", totalScore: "number" },
      history: { best: "number", avg: "number", attempts: "number", totalScore: "number" },
      entertainment: { best: "number", avg: "number", attempts: "number", totalScore: "number" }
    }
  },
  timestamps: {
    createdAt: "timestamp",
    updatedAt: "timestamp"
  }
}
```

### 2. `custom_quizzes`
```javascript
{
  metadata: {
    title: "string",
    description: "string",
    tags: "string",
    questionCount: "number",
    isPublic: "boolean",
    hasPassword: "boolean"
  },
  creator: {
    uid: "string",
    displayName: "string",
    username: "string"
  },
  content: {
    questions: {
      "Question 1": {
        question: "string",
        option_1: "string",
        option_2: "string", 
        option_3: "string",
        option_4: "string",
        correct_answer: "string",
        type: "string"
      }
    }
  },
  password: "string", // root level
  timestamps: {
    createdAt: "string",
    updatedAt: "string"
  }
}
```

### 3. `default-questions`
```javascript
{
  question: "string",
  option_1: "string",
  option_2: "string",
  option_3: "string", 
  option_4: "string",
  correct_answer: "string",
  category: "string",
  "sub-category": "string",
  difficulty: "string",
  type: "string"
}
```

### 4. `flashcard_decks`
```javascript
{
  metadata: {
    title: "string",
    description: "string",
    category: "string",
    tags: "string",
    cardCount: "number",
    isPublic: "boolean"
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
    }
  },
  timestamps: {
    createdAt: "string",
    updatedAt: "string"
  },
  moderation: {
    status: "string"
  }
}
```

### 5. `quiz_results`
```javascript
{
  userId: "string",
  category: "string",
  quizType: "string",
  score: "number",
  totalQuestions: "number", 
  percentage: "number",
  timeSpent: "number",
  submittedAt: "timestamp",
  sessionId: "string"
}
```

### 6. `studyMaterials`
```javascript
{
  title: "string",
  description: "string", 
  type: "string",
  content: "string",
  category: "string",
  isPublic: "boolean",
  createdAt: "timestamp"
}
```

## Indexes

### `default-questions`
- `category + sub-category`
- `category + question`

### `custom_quizzes`
- `creator.uid + timestamps.updatedAt`
- `metadata.isPublic + timestamps.updatedAt`
- `metadata.isPublic + metadata.title`

### `flashcard_decks`
- `creator.uid + moderation.status + timestamps.updatedAt`

```