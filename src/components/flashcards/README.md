# Flashcards Components

## Purpose
Contains components for creating and managing flashcard decks for studying.

## Components

### MyFlashcards.jsx
Displays all flashcard decks that the user has created. Users can view their decks and delete ones they no longer need.

### DeckManager.jsx
The main interface for creating new flashcard decks. Users can add a title, description, category, and create individual flashcards within the deck.

### CardCreation.jsx
Component for creating individual flashcards with a front (question) and back (answer) side. Used within the DeckManager for adding cards to decks.

## How It Works
Users create flashcard decks through DeckManager, which saves them to Firebase. The MyFlashcards component displays all the user's saved decks. Each deck contains multiple flashcards with front and back content for studying.