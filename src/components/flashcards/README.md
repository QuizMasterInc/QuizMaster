# Flashcards Components

## Purpose
Contains components for creating, managing, browsing, and studying flashcard decks.

## Components

### MyFlashcards.jsx
Displays all flashcard decks that the user has created. Users can view their decks, study them, and delete ones they no longer need.

### BrowsePublicFlashcards.jsx
Browse and discover public flashcard decks created by other users. Includes filtering by category and difficulty, with the ability to study any public deck.

### DeckManager.jsx
The main interface for creating new flashcard decks. Users can add a title, description, category, and create individual flashcards within the deck.

### CardCreation.jsx
Component for creating individual flashcards with a front (question) and back (answer) side. Used within the DeckManager for adding cards to decks.

### study/ (S79 - Study Mode)
Complete study mode implementation with 6 components:
- **StudyMode.jsx** - Main study interface, session management, and card navigation
- **StudyCard.jsx** - Individual card display with flip animation
- **RatingButtons.jsx** - "Still learning" or "Know" buttons
- **StudyProgressBar.jsx** - Visual progress indicator
- **StudyStats.jsx** - Real-time session statistics
- **StudyResults.jsx** - Session completion summary and analytics

## How It Works
Users create flashcard decks through DeckManager, which saves them to Firebase. The MyFlashcards component displays all the user's saved decks, and BrowsePublicFlashcards shows public decks from other users. Study mode tracks progress, ratings, and statistics in the study_sessions collection with session resume functionality.