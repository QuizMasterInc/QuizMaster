# Flashcards Component System

## Overview
The flashcards component system provides a complete deck-based flashcard creation and management experience, integrated with Firebase for data persistence and user tracking.

## Architecture

### Component Structure
```
flashcards/
├── MyFlashcards.jsx      # Main flashcard deck management interface
├── CardCreation.jsx      # Individual flashcard creation component  
├── DeckManager.jsx       # Deck creation and editing interface
└── Flashcards.css        # Shared flashcard styling
```

### Data Flow
1. **Deck Creation**: DeckManager.jsx → Firebase Functions → flashcard_decks collection
2. **Deck Viewing**: MyFlashcards.jsx → Firebase Functions → Display user's decks
3. **Card Management**: CardCreation.jsx → DeckManager.jsx → Firebase storage

## Components

### MyFlashcards.jsx
**Purpose**: Primary interface for viewing and managing user's flashcard decks

**Key Features**:
- Fetches user's flashcard decks from Firebase
- Displays deck metadata (title, card count, category, creation date)
- Provides deck deletion functionality
- Responsive grid layout with enhanced contrast
- Loading states and error handling

**Firebase Integration**:
- Uses `getUserFlashcardDecks` Firebase function
- Uses `deleteFlashcardDeck` Firebase function  
- Updates user stats in real-time

### CardCreation.jsx  
**Purpose**: Interface for creating individual flashcards within a deck

**Key Features**:
- Front/back card content editing
- Card type selection (currently supports "basic")
- Real-time validation and preview
- Integration with parent deck creation flow

**Data Structure**:
```javascript
{
  front: "Question or term",
  back: "Answer or definition", 
  type: "basic"
}
```

### DeckManager.jsx
**Purpose**: Complete deck creation interface with metadata and card management

**Key Features**:
- Deck metadata configuration (title, description, category, tags)
- Multiple card creation and editing
- Visibility settings (public/private)
- Firebase integration for deck submission
- Form validation and error handling

**Firebase Integration**:
- Uses `addCustomFlashcardDeck` Firebase function
- Updates user's `flashcardDecksCreated` stats
- Redirects to /myflashcards on successful creation

## Database Integration

### Collection: `flashcard_decks`
**Schema**: See DATABASE_SCHEMA.md for complete structure

**Key Fields**:
- `metadata`: Deck information (title, description, category, cardCount, isPublic)
- `creator`: User information (uid, displayName, username)
- `content.cards`: Flashcard data stored as key-value pairs
- `timestamps`: Creation and modification tracking
- `analytics`: Study performance and usage statistics

### User Stats Integration
**Updated Fields in `users` collection**:
- `stats.flashcardDecksCreated`: Incremented on deck creation
- `cache.recentFlashcardIds`: Updated with recent deck access

## Routes

### /myflashcards
- **Component**: MyFlashcards.jsx
- **Access**: Private route (requires authentication)
- **Purpose**: Display user's flashcard decks

### /flashcards  
- **Component**: DeckManager.jsx
- **Access**: Private route (requires authentication)
- **Purpose**: Create new flashcard decks

## Service Layer

### flashcardService.js
**Functions**:
- `createValidatedDeckObject(deckData)`: Validates and structures deck data
- `submitFlashcardDeck(deckData)`: Submits deck to Firebase
- `getUserFlashcardDecks(userId)`: Retrieves user's decks
- `deleteFlashcardDeck(deckId, userId)`: Soft deletes deck
- `normalizeDeckData(rawData)`: Normalizes Firebase response data

## Firebase Functions

### Backend Functions (functions/src/index.js)
- `addCustomFlashcardDeck`: Creates new flashcard deck with user stats update
- `getUserFlashcardDecks`: Retrieves user's flashcard decks with filtering
- `getFlashcardDeck`: Retrieves specific deck by ID
- `deleteFlashcardDeck`: Soft deletes deck and updates user stats

### CORS Configuration
All functions include proper CORS headers for cross-origin requests.

## Styling

### Flashcards.css
**Key Features**:
- Responsive grid layouts
- Enhanced contrast for accessibility
- Consistent spacing and typography
- Loading state animations
- Card hover effects

**Design Principles**:
- Mobile-first responsive design
- High contrast ratios for readability
- Consistent with overall QuizMaster design system

## Usage Examples

### Creating a New Deck
1. Navigate to `/flashcards`
2. Fill in deck metadata (title, description, category)
3. Add cards using CardCreation component
4. Set visibility (public/private)
5. Submit to Firebase

### Managing Existing Decks
1. Navigate to `/myflashcards`
2. View deck grid with metadata
3. Delete decks using trash icon
4. Access individual decks (future enhancement)

## Data Persistence

### localStorage (Legacy)
Previous implementation used localStorage for data persistence. This has been fully migrated to Firebase for:
- Cross-device synchronization
- User statistics tracking
- Public/private deck sharing
- Data persistence and backup

### Firebase Integration
- Real-time data synchronization
- Automatic user stats updates
- Proper error handling and validation
- CORS-enabled API endpoints

## Future Enhancements

### Study Mode
- Interactive flashcard review
- Spaced repetition algorithms
- Performance tracking per card
- Study session analytics

### Collaboration
- Deck sharing and copying
- Public deck browsing
- User ratings and reviews
- Collaborative deck editing

### Advanced Features
- Image and audio card support
- Import/export functionality
- Advanced study algorithms
- Mobile app integration

## Development Notes

### Component Evolution
The flashcard system evolved from a localStorage-based implementation to a full Firebase-backed system:

1. **Phase 1**: Basic localStorage storage with simple card creation
2. **Phase 2**: Firebase integration with user authentication
3. **Phase 3**: Complete deck management with user stats tracking
4. **Phase 4**: Enhanced UI with accessibility improvements

### Migration Considerations
- Existing localStorage data was not migrated (fresh start approach)
- User schema updated to include flashcard tracking fields
- New Firebase functions deployed alongside existing quiz functions
- Route structure maintained consistency with quiz system

### Performance Optimizations
- Lazy loading of deck content
- Optimized Firebase queries with proper indexing
- Client-side caching of user deck lists
- Efficient re-rendering with React state management