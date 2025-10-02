# Pages Directory

## Overview
This directory contains page-level components that serve as route destinations in the application. These components represent full pages rather than reusable UI elements.

## Current Pages

### 🚫 **NotFound.jsx**
- **Route**: `*` (catch-all route)
- **Purpose**: 404 error page for unrecognized routes

### 📝 **TypeOfQuiz.jsx**  
- **Route**: `/typeofquiz`
- **Purpose**: Quiz category selection page


## Route Definition
```jsx
// In App.jsx
import NotFound from './pages/NotFound';
import TypeOfQuiz from './pages/TypeOfQuiz';

// Route configuration
<Route path="/typeofquiz" element={<TypeOfQuiz />} />
<Route path="*" element={<NotFound />} />
```

## Navigation
```jsx
// Link to quiz type selection
<Link to="/typeofquiz">Choose Quiz Type</Link>

// Programmatic navigation
navigate('/typeofquiz');
```
