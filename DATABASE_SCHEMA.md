# QuizMaster Database Schema - Fully Compliant & Migrated

**Last Updated:** November 12, 2025
**Compliance:** 100% - All collections match this specification

## Design Philosophy
- Remove unused fields that create confusion
- Keep valuable optimizations
- Strategic placeholders for likely features
- Document what fields are actually used vs placeholders
- Balance: Don't pre-optimize everything, but don't leave future devs with migration hell

## Collections

### 1. Users Collection - Cleaned Schema

```javascript
{
  	// PRIMARY IDENTIFIERS
  	uid: "string", // Firebase Auth UID (primary key)
  	email: "string", // User's email address
  	emailVerified: "boolean", // Whether email is verified

  	// AUTHENTICATION
  	authProvider: "google | email | github", // How user signed up

	// PROFILE INFORMATION (ALL USED)
	profile: {
		displayName: "string", // Display name (used in 20+ places)
		firstName: "string", // First name for formal display
		lastName: "string" // Last name for formal display
	},

	// USER PREFERENCES (PARTIALLY IMPLEMENTED)
	preferences: {
		theme: "light | dark" // PLACEHOLDER: Settings page exists but theme switching not implemented yet
	},

	// ROLES & PERMISSIONS (ALL USED)
	role: "user | developer | teacher", // Default: "user"
	permissions: {
		canCreateQuizzes: "boolean", // Default: true
		canCreatePublicQuizzes: "boolean", // Default: true
		canModerateContent: "boolean", // Default: false
		maxQuizzesAllowed: "number" // Default: 50
	},

	// RECENT ACTIVITY TRACKING (USED - Performance optimization)
	recentActivity: {
		flashcardIds: "array", // Recently created flashcard deck IDs (used in Cloud Functions)
		quizIds: "array" // Recently created quiz IDs (used in Cloud Functions)
	},

	// DETAILED STATISTICS (HEAVILY USED - Core business value)
	stats: {
		// Category-specific performance tracking (used in 20+ places)
		categoryStats: {
			entertainment: { attempts: "number", bestScore: "number", avgScore: "number", totalScore: "number" },
			geography: { attempts: "number", bestScore: "number", avgScore: "number", totalScore: "number" },
			history: { attempts: "number", bestScore: "number", avgScore: "number", totalScore: "number" },
			mathematics: { attempts: "number", bestScore: "number", avgScore: "number", totalScore: "number" },
			science: { attempts: "number", bestScore: "number", avgScore: "number", totalScore: "number" },
			sports: { attempts: "number", bestScore: "number", avgScore: "number", totalScore: "number" }
		},

		// Custom quiz engagement (used for user analytics)
		customQuizActivity: {
			averageScore: "number",
			lastTakenAt: "timestamp",
			totalScore: "number",
			totalTaken: "number"
		},

		// Content creation metrics (used for user profiles)
		flashcardDecksCreated: "number", // Updated in Cloud Functions
		quizmasterAverageScore: "number", // Calculated in Cloud Functions
		quizmasterQuizzesTaken: "number" // Calculated in Cloud Functions
	},

	// TIMESTAMPS (ALL USED)
	timestamps: {
		createdAt: "timestamp", // When account was created
		updatedAt: "timestamp", // When profile was last updated
		lastLoginAt: "timestamp", // Last authentication
		lastActiveAt: "timestamp" // Last app activity (updated by Cloud Functions)
	},

	// STATUS (USED)
	status: {
		isActive: "boolean" // Default: true
	}

	// MIGRATION NOTES (S85):
	// - All timestamps now properly formatted as ISO strings
	// - Removed non-schema 'cache' fields
	// - All required fields populated with defaults
}
```

### 2. `custom_quizzes`
```javascript
{
	metadata: {
		title: "string",
		description: "string",
		tags: "string",
		category: "string",
		questionCount: "number",
		isPublic: "boolean",
		hasPassword: "boolean",
		password: "string",  // Actual password string (only present if hasPassword is true)
		difficulty: "string",
		version: "number",
		isTeacherMade: "boolean"  // Whether this is a teacher-created quiz (FULLY IMPLEMENTED)
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
				type: "string",
				difficulty: "number",
				explanation: "string",
				points: "number"
			}
		}
	},
	timestamps: {
		createdAt: "string",
		updatedAt: "string",
		lastAttemptAt: "string"
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
	category: "string", // Standardized: always lowercase (e.g., "science")
	sub-category: "string", // Standardized: Title Case (e.g., "Geography")
	difficulty: "number",
	type: "string"
}
```

### 4. Flashcard Decks Collection - S79 Enhanced Schema

```javascript
{
	// PRIMARY IDENTIFIERS
	id: "string", // Auto-generated document ID

	// BASIC METADATA (ALL USED)
	title: "string", // Used in UI display
	description: "string", // Used in UI display
	category: "string", // Used for categorization
	tags: "array", // Used for filtering (MIGRATED: converted from string to array)
	difficulty: "know | still learning", // Used for display
	isPublic: "boolean", // Used for visibility control
	allowCopying: "boolean", // Used in services

	// CREATOR INFORMATION (USED)
	creatorId: "string", // Reference to users.uid
	creatorName: "string", // Cached display name

	// DECK STRUCTURE (USED)
	cardCount: "number", // Used for display
	cards: [
		{
			id: "string", // Unique card identifier
			front: "string",
			back: "string",
			type: "basic | close | image"
		}
	],

	// STUDY ANALYTICS (S79 - USED FOR DECK-LEVEL STATS)
	analytics: {
		stats: {
			timesStudied: "number", // Total study sessions completed
			lastStudiedAt: "timestamp" // Last study session completion time
		}
  	},

	// TIMESTAMPS (USED)
	createdAt: "timestamp", // Used for sorting
	updatedAt: "timestamp", // Used for sorting

	// MODERATION (USED)
	isActive: "boolean" // Used for soft deletes
}
```

### 5. Study Sessions Collection - S79 New Collection

```javascript
{
	// PRIMARY IDENTIFIERS
	id: "string", // Auto-generated session ID
	
	// SESSION OWNERSHIP
	userId: "string", // Reference to users.uid
	deckId: "string", // Reference to flashcard_decks.id
	
	// SESSION TIMING
	startedAt: "timestamp", // When study session began
	lastActivityAt: "timestamp", // Last interaction (for resume detection)
	completedAt: "timestamp", // When session ended (null if in progress)
	
	// SESSION PROGRESS
	currentCardIndex: "number", // Index of current card (for resume)
	cardsStudied: "number", // Count of cards reviewed in this session
	
	// CARD RATINGS (S79 Acceptance Criteria: know or still learning tracking)
	cardRatings: [
		{
			cardId: "string", // Reference to card ID from deck
			rating: "know | still learning", // User's rating
			timestamp: "timestamp" // When rating was given
		}
	],
	
	// SESSION STATUS
	isCompleted: "boolean", // Whether session finished or abandoned
	
	// SESSION STATISTICS (S79 Acceptance Criteria)
	stats: {
		timeSpent: "number", // Total seconds spent in session
		knowCount: "number", // Number of "know" ratings
		stillLearningCount: "number", // Number of "still learning" ratings
		successRate: "number" // Percentage (easy+good)/total * 100
	}
}
```

### 6. Quiz Results Collection

```javascript
{
	userId: "string",
	category: "string",
	quizType: "string", // "default" | "custom"
	score: "number",
	totalQuestions: "number",
	amount: "number", // Number of questions requested/available
	percentage: "number",
	submittedAt: "timestamp",
	difficulty: "number", // Difficulty level as number
	sessionId: "string", // Unique session identifier
	quizId: "string", // Quiz identifier (generated for default, from DB for custom)
	questionIds: "array", // Array of question identifiers
	userAnswers: "object" // Object mapping question indices to user answers
}
```

**Last Schema Audit:** November 12, 2025
**Next Recommended Audit:** December 1, 2025
```