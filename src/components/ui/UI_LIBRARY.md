# Shared UI Library

## Overview
Centralized component library providing consistent UI elements across the QuizMaster application. This library eliminates code duplication and ensures design system consistency.

## Available Components

### 🔘 **Button Components**
```jsx
import { Button, LinkButton, BackButton } from './index.jsx';

// Primary button
<Button onClick={handleClick}>Click Me</Button>

// Link-styled button  
<LinkButton to="/dashboard">Go to Dashboard</LinkButton>

// Back navigation button
<BackButton to="/previous-page" position="fixed-top-right" />
```

**Button Variants:**
- `variant="primary"` - Purple gradient button (default)
- `variant="secondary"` - Outlined button
- `variant="danger"` - Red destructive button

### 📦 **Layout Components**
```jsx
import { Card, Container } from './index.jsx';

// Content card with consistent styling
<Card className="custom-class">
  <h2>Card Title</h2>
  <p>Card content...</p>
</Card>

// Page container with proper spacing
<Container>
  <h1>Page Content</h1>
</Container>
```

### 🦶 **Footer Component**
```jsx
import { Footer } from './index.jsx';

// Consistent footer across all pages
<Footer />
```

## Design System

### 🎨 **Color Palette**
- **Primary**: Purple gradients (`from-purple-600 to-blue-600`)
- **Secondary**: Gray tones for subtle elements
- **Accent**: Blue highlights for interactive states
- **Danger**: Red variants for destructive actions

### 📱 **Responsive Design**
All components include responsive breakpoints:
- `sm:` - Small screens (640px+)
- `md:` - Medium screens (768px+)
- `lg:` - Large screens (1024px+)

### ✨ **Animation Standards**
- **Hover effects**: Subtle scale transforms (`hover:scale-105`)
- **Focus states**: Consistent ring styles
- **Transitions**: 200ms duration for smoothness

## Usage Guidelines

### ✅ **When to Use UI Library**
- Common interface elements (buttons, cards, containers)
- Consistent styling across multiple components
- Reusable layout patterns

### ❌ **When to Create Custom Components**
- Feature-specific complex interactions
- One-off specialized layouts
- Components tightly coupled to business logic

## Adding New Components

1. **Design**: Follow existing color and spacing patterns
2. **Props**: Use consistent prop naming conventions
3. **Documentation**: Add usage examples above
4. **Export**: Add to main index.jsx export

## Migration History
Created September 2025 during component consolidation effort. Consolidated Footer and multiple button variants into single library.
