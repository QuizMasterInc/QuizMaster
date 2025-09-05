# Pages Directory

## Overview
This directory contains page-level components that serve as route destinations in the application. These components represent full pages rather than reusable UI elements.

## Current Pages

### 🚫 **NotFound.jsx**
- **Route**: `*` (catch-all route)
- **Purpose**: 404 error page for unrecognized routes
- **Features**: 
  - Animated error display with motion effects
  - Navigation back to home page
  - QuizMaster branding consistency
  - User authentication awareness

### 📝 **TypeOfQuiz.jsx**  
- **Route**: `/typeofquiz`
- **Purpose**: Quiz category selection page
- **Features**:
  - Interactive quiz type cards
  - Animated background effects
  - User authentication integration
  - Navigation to specific quiz categories

## Architecture Decision

### Why Pages Directory?
The pages directory was created during the September 2025 component consolidation to:

1. **Separate Concerns**: Distinguish between page-level routes and reusable components
2. **Improve Organization**: Group route components logically separate from UI components
3. **Clarify Navigation**: Make it obvious which components are page destinations
4. **Reduce Proliferation**: Consolidate route-level components in dedicated space

### Migration from Components
These pages were moved from `/src/components/` during consolidation:
- `NotFound.jsx` - Previously in `/src/components/404/`
- `TypeOfQuiz.jsx` - Previously in `/src/components/typeofquiz/`

## Usage Patterns

### Route Definition
```jsx
// In App.jsx
import NotFound from './pages/NotFound';
import TypeOfQuiz from './pages/TypeOfQuiz';

// Route configuration
<Route path="/typeofquiz" element={<TypeOfQuiz />} />
<Route path="*" element={<NotFound />} />
```

### Navigation
```jsx
// Link to quiz type selection
<Link to="/typeofquiz">Choose Quiz Type</Link>

// Programmatic navigation
navigate('/typeofquiz');
```

## Design Guidelines

### Page Component Standards
```jsx
// Standard page component structure
import React from 'react';
import { motion } from 'framer-motion';

const PageName = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900">
      {/* Animated background elements */}
      <motion.div {...animationProps}>
        {/* Page content */}
      </motion.div>
    </div>
  );
};

export default PageName;
```

### Consistent Features
All pages should include:
- **Full viewport height**: `min-h-screen`
- **Brand consistent backgrounds**: Purple/blue gradients
- **Motion animations**: Framer Motion for smooth transitions
- **Responsive design**: Mobile-first approach
- **Authentication awareness**: Conditional content based on user state

## Adding New Pages

### 1. Create Page Component
```jsx
// /src/pages/NewPage.jsx
import React from 'react';
import { motion } from 'framer-motion';

const NewPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900">
      {/* Page content */}
    </div>
  );
};

export default NewPage;
```

### 2. Add Route
```jsx
// In App.jsx
import NewPage from './pages/NewPage';

// Add to Routes
<Route path="/new-page" element={<NewPage />} />
```

### 3. Update Navigation
Add links in navbar, home page, or other navigation components.

## Import Path Updates

### After Pages Migration
Components now import from pages directory:
```jsx
// Updated import paths
import NotFound from './pages/NotFound';
import TypeOfQuiz from './pages/TypeOfQuiz';
```

### Icon and Context Imports
Pages access shared resources with updated paths:
```jsx
// From pages directory
import { Q, User } from '../components/icons/index.jsx';
import { useAuth } from '../contexts/AuthContext';
```

## Future Considerations

### Potential Page Additions
Consider moving these components to pages if they become route-level:
- About page (currently component-based)
- Contact page (currently component-based) 
- Developer tools page

### Page Organization
As the pages directory grows, consider sub-organization:
```
/src/pages/
├── auth/           # Authentication pages
├── quiz/           # Quiz-related pages  
├── admin/          # Administrative pages
└── public/         # Public informational pages
```

## Migration History
**September 2025**: Created pages directory during component consolidation
- Moved route-level components from scattered component directories
- Updated import paths throughout application
- Established clear separation between pages and reusable components
