# NavBar Components

## Purpose
The navbar components provide consistent navigation throughout the QuizMaster application, with dynamic content based on user authentication status and role permissions. The navigation system includes both main navigation and user-specific controls.

## Architecture

### Component Structure
```
navbar/
├── NavBar.jsx           # Main navigation component
├── NavBarUser.jsx       # User-specific navigation controls
└── README.md           # This documentation
```

### Key Features
- **Dynamic Navigation**: Content adapts based on authentication state and user role
- **Role-Based Access**: Different navigation options for users, instructors, and developers
- **Responsive Design**: Mobile-friendly navigation with collapsible menu
- **Icon Integration**: Uses unified icon system for consistent visual experience
- **Route Integration**: Seamless integration with React Router for navigation

## Navigation Structure

### Main Navigation (NavBar.jsx)
**Authenticated Users:**
- **Dashboard**: User analytics and quiz management
- **Quiz Selection**: Browse and take quizzes
- **My Flashcards**: Access user's flashcard decks
- **Create Quiz**: Custom quiz creation interface
- **Create Flashcards**: Flashcard deck creation

**Guest Users:**
- **Home**: Landing page and feature overview
- **Login/Register**: Authentication interfaces

**Role-Specific Routes:**
- **Developer Tools**: Question management (developer/admin only)
- **Admin Panel**: System management (admin only)

### User Navigation (NavBarUser.jsx)
**Located in top-right corner:**
- **User Profile**: Display user email and profile information
- **Account Settings**: Profile management and preferences
- **Logout**: Secure session termination

## Technical Implementation

### State Management
- **AuthContext Integration**: Real-time authentication state monitoring
- **Route Protection**: Automatic hiding of unauthorized navigation options
- **Active State**: Visual indication of current page/route
- **Loading States**: Graceful handling during authentication state changes

### Recent Updates (October 2025)
- **Flashcard Routes**: Added `/myflashcards` and `/flashcards` navigation
- **Icon Updates**: Integrated Scroll and Q icons for flashcard functionality
- **Enhanced Accessibility**: Improved keyboard navigation and screen reader support
- **Mobile Optimization**: Better touch targets and responsive behavior

## Integration Points
- **AuthContext**: Authentication state and user role information
- **React Router**: Navigation and route protection
- **Icon System**: Unified icon library for consistent design
- **Theme System**: Responsive to application theme settings