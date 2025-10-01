# QuizMaster Database Schema
## Senior Architecture Review & Enterprise-Grade Design

### Executive Summary
This document provides a comprehensive database architecture designed for a NoSQL Firebase environment, following enterprise-grade patterns for scalability, performance, and maintainability. The schema addresses current production issues while establishing a foundation for future growth.

### Architecture Principles Applied
- **Document-oriented design** with proper denormalization strategies
- **Query-first modeling** optimized for Firebase's limitations
- **Horizontal scaling** patterns for multi-tenant growth
- **Data consistency** through controlled redundancy
- **Performance optimization** via strategic indexing

## Current Production Issues (Critical Fix Required)

### 🔴 Critical Issues
1. **Missing `isPublic` field** - Frontend expects this but it's never set in database
2. **Inconsistent date formats** - Some use Firestore timestamps, others use strings
3. **Missing user display names** - Frontend tries to display creator names but data is inconsistent
4. **Field name mismatches** - `numQuestions` vs `questionCount` used interchangeably
5. **Missing composite indexes** - Causing 500 errors in queries

---

## Simplified Database Design (Matching Existing Collections)

### 1. `users` Collection 
**Pattern**: Enhanced user profiles with structured data
**Status**: ✅ Keep existing enhanced structure

```javascript
{
  // Document ID: Firebase Auth UID (immutable primary key)
  uid: "string", // Firebase Auth UID - kept for compound queries
  
  // Authentication & Identity
  email: "string", // Required, unique
  emailVerified: "boolean", // Track verification status
  authProvider: "google" | "email" | "apple" | "microsoft", // Auth method
  
  // Profile Information (following Firebase best practices)
  profile: {
    firstName: "string", // Required
    lastName: "string",  // Required  
    displayName: "string", // Computed: firstName + lastName
    title: "string", // e.g., "Computer Science Teacher"
    
    // Privacy controls
    isPublicProfile: "boolean", // Default: false
    showEmail: "boolean", // Default: false
  },
  
  // Authorization & Roles
  role: "user" | "developer" | "instructor", // Default: "user"
  permissions: {
    canCreateQuizzes: "boolean", // Default: true
    canCreatePublicQuizzes: "boolean", // Default: true based on role
    canModerateContent: "boolean", // Default: false
    maxQuizzesAllowed: "number", // Rate limiting (default: 50)
  },
  
  // Account Status
  status: {
    isActive: "boolean", // Default: true
    isVerified: "boolean", // Email verification
    isSuspended: "boolean", // Moderation flag
    suspensionReason: "string", // If suspended
    profileComplete: "boolean", // Onboarding completion
  },
  
  // Analytics & Tracking (for performance insights)
  stats: {
    quizzesCreated: "number", // Default: 0
    quizzesTaken: "number", // Default: 0
    totalScore: "number", // Cumulative score
    averageScore: "number", // Performance metric
    lastActivity: "timestamp", // For engagement tracking
    flashcardDecksCreated: "number", // Default: 0
  },
  
  // Preferences (embedded for single-read efficiency)
  preferences: {
    theme: "light" | "dark" | "auto", // Default: "auto"
  },
  
  // Timestamps (critical for audit trails)
  timestamps: {
    createdAt: "timestamp", // Account creation
    updatedAt: "timestamp", // Last profile update
    lastLoginAt: "timestamp", // Authentication tracking
    lastActiveAt: "timestamp", // Activity tracking
  },
  
  // Denormalized data for performance (trade storage for read speed)
  cache: {
    recentQuizIds: ["string"], // Last 10 quiz IDs for quick access
    recentFlashcardIds: ["string"], // Last 10 flashcard deck IDs for quick access
    favoriteCategories: ["string"], // Top 5 categories
    achievementBadges: ["string"], // Earned badges
  }
}
```

### 2. `custom_quizzes` Collection
**Pattern**: Enhanced quiz structure with better organization
**Status**: ✅ Keep existing enhanced structure

```javascript
{
  // Document ID: Auto-generated Firestore ID (guaranteed unique)
  
  // Core Quiz Information
  metadata: {
    title: "string", // Required, max 200 chars
    description: "string", // Optional, max 1000 chars
    tags: ["string"], // Search tags (array-contains queries)
    category: "string", // Ex- Geography, Math, Science, etc
    version: "number", // Schema versioning for migrations (default: 1)
    language: "string", // ISO code (default: "en")
  },
  
  // Creator Information (denormalized for query performance)
  creator: {
    uid: "string", // User UID who created the quiz (required)
    displayName: "string", // Cached from user profile
    role: "string", // Creator's role at time of creation
    isVerified: "boolean", // Creator verification status
  },
  
  // Quiz Content (embedded for atomic updates)
  content: {
    questions: [
      {
        id: "string", // Unique question ID within quiz
        type: "multiple-choice" | "true-false" | "fill-blank", // Future extensibility
        question: "string", // Question text
        options: ["string"], // Array of answer options
        correctAnswer: "string", // Correct answer
        explanation: "string", // Optional explanation
        points: "number", // Points for this question (default: 1)
        category: "string", // Question-level category
        difficulty: "1" | "2" | "3" | "4" | "5", // These will correspond to stars. 5 stars being difficult
      }
    ],
    
    // Computed fields for performance
    questionCount: "number", // questions.length (indexed)
  },
  
  // Access Control & Privacy
  access: {
    isPublic: "boolean", // Public visibility (default: true)
    accessLevel: "public" | "teacher" | "private" | "organization", // Granular control
    password: "string", // Hashed password for private quizzes (optional)
    allowedUsers: ["string"], // Specific user UIDs (for private quizzes)
    organizationId: "string", // For organization-scoped quizzes
  },
  
  // Content Moderation & Quality
  moderation: {
    status: "active" | "pending" | "suspended" | "flagged", // Content status
    reportCount: "number", // User reports (default: 0)
    lastReviewed: "timestamp", // Last moderation review
  },
  
  // Performance Analytics (for insights and recommendations)
  analytics: {
    stats: {
      attempts: "number", // Total quiz attempts (default: 0)
      completions: "number", // Successful completions
      averageScore: "number", // Mean score percentage (0-100)
      averageTime: "number", // Mean completion time in seconds
      passRate: "number", // Percentage who scored >= 70%
      rating: "number", // Average user rating (1-5)
      ratingCount: "number", // Number of ratings
    },
  },
  
  // Temporal Data (critical for sorting and audit)
  timestamps: {
    createdAt: "timestamp", // Required (Firestore server timestamp)
    updatedAt: "timestamp", // Last content modification
    publishedAt: "timestamp", // When made public (if applicable)
    lastAttemptAt: "timestamp", // Most recent quiz attempt
  },
  
  // Configuration & Behavior
  settings: {
    shuffleQuestions: "boolean", // Randomize question order (default: false)
    shuffleAnswers: "boolean", // Randomize answer options (default: false)
    passingScore: "number", // Minimum score to pass (percentage)
  }
}
```

### 3. `quizmaster-questions` Collection (Matching Existing Name)
**Pattern**: Simplified default question bank
**Status**: 🔄 Simplified from existing structure

```javascript
{
  // Document ID: Auto-generated by Firestore
  
  // Question Content
  question: "string", // The question text (required)
  option_1: "string", // Answer choice 1
  option_2: "string", // Answer choice 2
  option_3: "string", // Answer choice 3
  option_4: "string", // Answer choice 4
  correct_answer: "string", // Correct answer
  explanation: "string", // Optional explanation
  
  // Categorization
  category: "string", // e.g., "history", "science", "mathematics"
  sub_category: "string", // e.g., "world-war-2", "chemistry", "algebra"
  tags: ["string"], // Search tags
  
  // Metadata
  difficulty: "1" | "2" | "3" | "4" | "5", // These will correspond to stars. 5 stars being difficult
  questionType: "multiple-choice" | "true-false", // Type of question
  
  // Administrative
  createdAt: "timestamp",
  updatedAt: "timestamp",
  createdBy: "string", // Admin/developer UID
  isActive: "boolean", // Available for use (default: true)
}
```

### 4. `flashcard_decks` Collection
**Pattern**: Deck-based flashcard system (similar to custom_quizzes structure)
**Status**: 🆕 New collection - matches component expectations

```javascript
{
  // Document ID: Auto-generated by Firestore
  
  // Deck metadata
  metadata: {
    title: "string", // Deck name (e.g., "Spanish Vocabulary")
    description: "string", // Optional deck description
    category: "string", // Subject category (e.g., "Languages", "Science")
    tags: "string", // Comma-separated tags for searching
    cardCount: "number", // Total number of cards in deck
    isPublic: "boolean", // Public visibility (false = private deck)
    difficulty: "string", // "1" (easy), "2" (medium), "3" (hard)
    version: "number" // Schema version
  },
  
  // Creator information
  creator: {
    uid: "string", // User UID who created the deck
    displayName: "string", // Creator's display name
    username: "string" // Creator's username
  },
  
  // Flashcard content - stored in simple key-value format for easy access
  content: {
    cards: {
      "Card 1": {
        front: "string", // Question, term, or prompt
        back: "string", // Answer, definition, or response
        type: "string" // Default: "basic" (future: "image", "audio", etc.)
      },
      "Card 2": {
        front: "string",
        back: "string", 
        type: "string"
      }
      // ... more cards as needed
    }
  },
  
  // Study analytics and performance tracking
  analytics: {
    stats: {
      timesStudied: "number", // How many study sessions
      averageScore: "number", // Average performance (0-100)
      lastStudied: "timestamp", // Most recent study session
      totalReviews: "number" // Total card reviews across all sessions
    },
    performance: {
      cardStats: {
        // Per-card performance tracking
        "Card 1": {
          correctCount: "number",
          incorrectCount: "number",
          lastReviewed: "timestamp"
        }
      }
    }
  },
  
  // Access and sharing settings
  access: {
    visibility: "string", // "public" | "private"
    allowCopying: "boolean", // Allow others to duplicate this deck
    studyMode: "string" // "flashcards" | "quiz" | "both"
  },
  
  // Timestamps
  timestamps: {
    createdAt: "string", // ISO timestamp
    updatedAt: "string", // ISO timestamp
    lastStudiedAt: "string" // ISO timestamp of last study session
  },
  
  // Moderation (consistent with other collections)
  moderation: {
    status: "string", // "active" | "flagged" | "disabled"
    reports: "array", // User reports
    flags: "array" // Automated flags
  }
}
```

**Key Design Decisions:**
- **Deck-based approach**: Matches component expectations where users create "decks" containing multiple cards
- **Similar to custom_quizzes**: Reuses proven schema patterns for consistency
- **Simple card storage**: Cards stored as `"Card 1": { front, back }` for easy iteration
- **Analytics ready**: Built-in study tracking and performance metrics
- **Extensible**: Type field allows future card types (image, audio, etc.)
- **Privacy controls**: Public/private decks with sharing permissions

### 6. `quizzes` Collection (From Screenshot)
**Pattern**: Built-in/system quizzes (different from custom_quizzes)
**Status**: 🆕 New collection (matches screenshot)

```javascript
{
  // Document ID: Auto-generated by Firestore
  
  // Quiz Information
  title: "string", // Quiz title
  description: "string", // Quiz description
  category: "string", // Subject category
  
  // Quiz Content
  questions: [
    {
      question: "string",
      options: ["string"], // Answer choices
      correctAnswer: "string",
      explanation: "string", // Optional
    }
  ],
  questionCount: "number", // Number of questions
  
  // System quiz settings
  isSystemQuiz: "boolean", // True for built-in quizzes
  difficulty: "easy" | "medium" | "hard",
  estimatedTime: "number", // Minutes to complete
  
  // Access & Availability
  isActive: "boolean", // Available for taking
  isPremium: "boolean", // Requires subscription
  
  // Statistics
  totalAttempts: "number", // Total times taken
  averageScore: "number", // Average score
  
  // Administrative
  createdAt: "timestamp",
  createdBy: "string", // System/admin UID
  updatedAt: "timestamp",
}
```

### 7. `results` Collection (From Screenshot)
**Pattern**: Simple quiz results tracking
**Status**: 🆕 Simplified results collection

```javascript
{
  // Document ID: Auto-generated by Firestore
  
  // Identifiers
  userId: "string", // User who took the quiz
  quizId: "string", // Quiz taken (could be custom_quiz or system quiz)
  quizType: "custom" | "quizmaster" | "flashcard", // Type of quiz
  
  // Result Data
  score: "number", // Points scored
  totalPoints: "number", // Max possible points
  percentage: "number", // Score percentage (0-100)
  
  // Question Details
  totalQuestions: "number",
  correctAnswers: "number",
  incorrectAnswers: "number",
  
  // Time Tracking
  startTime: "timestamp",
  endTime: "timestamp", 
  timeSpent: "number", // Seconds taken
  
  // Context
  quizTitle: "string", // Denormalized quiz title
  category: "string", // Quiz category
  
  // Timestamps
  createdAt: "timestamp", // When result was recorded
}
```

### 8. `studyMaterials` Collection (From Screenshot)
**Pattern**: Educational resources and materials
**Status**: 🆕 New collection for study resources

```javascript
{
  // Document ID: Auto-generated by Firestore
  
  // Material Information
  title: "string", // Material title
  description: "string", // Description
  type: "pdf" | "video" | "article" | "link" | "image", // Material type
  
  // Content
  content: "string", // Text content or URL
  fileUrl: "string", // File download URL (for PDFs, images)
  
  // Categorization
  category: "string", // Subject category
  tags: ["string"], // Search tags
  difficulty: "beginner" | "intermediate" | "advanced",
  
  // Creator & Access
  createdBy: "string", // Creator UID
  creatorName: "string", // Display name
  isPublic: "boolean", // Public visibility
  
  // Usage Stats
  viewCount: "number", // Times accessed
  downloadCount: "number", // Downloads (for files)
  
  // Timestamps
  createdAt: "timestamp",
  updatedAt: "timestamp",
}
```