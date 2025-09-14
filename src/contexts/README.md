# Contexts

## Purpose

Context providers for centralized state management and optimized data sharing across the QuizMaster application. These contexts implement intelligent caching, batch operations, and efficient data flow patterns.

## Architecture (September 2025)

### Performance Optimizations
- **Intelligent Caching**: Context-aware cache strategies (1-30 minutes based on data volatility)
- **Batch Operations**: Single API calls replace multiple component-level requests
- **Smart Invalidation**: Automatic cache refresh based on user actions and data importance

## Context Files

### `AuthContext.jsx`
**Purpose**: User authentication and session management  
**Key Features**:
- User login/logout state management
- Authentication persistence across sessions
- Role-based access control
- Profile data caching

### `CategoryContext.jsx` 
**Purpose**: Quiz category data management  
**Key Features**:
- Category data with 30-minute caching (static data)
- Shared across all quiz-related components
- Optimized category filtering and selection

### `CustomQuizContext.jsx`
**Purpose**: Custom quiz state management  
**Key Features**:
- Quiz data caching and state persistence
- CRUD operation coordination
- Real-time quiz updates
- Context-driven component synchronization

### `QuizContext.jsx`
**Purpose**: Active quiz session management  
**Key Features**:
- Quiz attempt state tracking
- Progress persistence
- Answer validation and submission
- Session timeout handling

### `AppContext.jsx`
**Purpose**: Global application state  
**Key Features**:
- Theme and settings management  
- Global loading states
- Error handling coordination
- Application-wide notifications

### `VolumeContext.jsx`
**Purpose**: Audio settings management  
**Key Features**:
- Sound effect preferences
- Volume level persistence
- Audio state across components

## Optimization Benefits

- **Reduced API Calls**: Contexts prevent redundant service requests
- **Intelligent Caching**: Data cached based on update frequency and importance
- **Efficient Re-renders**: Optimized context splitting prevents unnecessary component updates  
- **Centralized State**: Single source of truth eliminates data synchronization issues
- **Performance**: Smart batching and caching improve application responsiveness

## Usage Patterns

```javascript
// Wrap components to provide context access
<ResultsContext.Provider>
  <Dashboard />
</ResultsContext.Provider>

// Access context data in components
const { results, loading, error } = useContext(ResultsContext);
``` 