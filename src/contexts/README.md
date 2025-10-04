# Contexts Directory

## Purpose
Contains React Context providers that manage shared state across the application. These contexts provide data and functions to components without passing props down multiple levels.

## Context Files

### AuthContext.jsx
Manages user authentication state and profile data.
- **Provides**: Current user info, login/logout functions, user profile data
- **Used by**: All components that need to check if user is logged in or access user data

### AppContext.jsx
Manages global application settings and state.
- **Provides**: App-wide settings, loading states, theme preferences
- **Used by**: Components that need global app state or settings

### QuizContext.jsx
Manages active quiz session data during quiz-taking.
- **Provides**: Current quiz questions, user answers, timer state, submission functions
- **Used by**: Quiz components during active quiz sessions

### ResultsContext.jsx
Manages user quiz results and performance data.
- **Provides**: User's quiz history, performance statistics, dashboard data
- **Used by**: Dashboard and analytics components that display user performance

## How to Use Contexts
1. **Wrap your app**: Context providers are wrapped around the main App component
2. **Import the hook**: Use `useContext(ContextName)` in components that need the data
3. **Access the data**: Destructure the values you need from the context 
