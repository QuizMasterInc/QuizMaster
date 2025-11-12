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

### 4. Flashcard Decks Collection - Cleaned Schema

```javascript
{
	// PRIMARY IDENTIFIERS
	id: "string", // Auto-generated document ID

	// BASIC METADATA (ALL USED)
	title: "string", // Used in UI display
	description: "string", // Used in UI display
	category: "string", // Used for categorization
	tags: "array", // Used for filtering (MIGRATED: converted from string to array)
	difficulty: "easy | medium | hard", // Used for display
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

	// STUDY ANALYTICS (PARTIALLY USED)
	analytics: {
		stats: {
			averageScore: "number", // Used in UI
			timesStudied: "number", // Used in UI
			lastStudied: "timestamp", // PLACEHOLDER: Always null
			totalReviews: "number" // PLACEHOLDER: Never incremented
		}
  	},

	// TIMESTAMPS (USED)
	createdAt: "timestamp", // Used for sorting (MIGRATED: ensured all decks have this field)
	updatedAt: "timestamp", // Used for sorting (MIGRATED: ensured all decks have this field)
	lastStudiedAt: "timestamp", // PLACEHOLDER: Always null

	// MODERATION (USED)
	isActive: "boolean" // Used for soft deletes
}
```

### 5. Quiz Results Collection

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