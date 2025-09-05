# Unified Icon System

## Overview
Consolidated icon library containing all SVG icons used throughout QuizMaster. This system replaced 22+ individual icon files with a single, maintainable library.

## Available Icons

### 📚 **Academic Icons**
- `Book` - Reading and study materials
- `Calculator` - Math and calculations
- `Scroll` - Certificates and documents
- `Q` - QuizMaster brand logo

### 🏀 **Category Icons**
- `Basketball` - Sports category
- `Football` - Sports category
- `Soccer` - Sports category

### 👤 **User Interface Icons**
- `User` - User profiles and accounts
- `Home` - Home navigation
- `Settings` - User settings
- `Dashboard` - Dashboard navigation

### 🎵 **Media Icons**
- `Music` - Audio and sound
- `VideoCamera` - Video content
- `Microphone` - Audio recording

### ⚙️ **System Icons**
- `Gear` - Settings and configuration
- `Bell` - Notifications
- `Search` - Search functionality

## Usage

### Basic Import
```jsx
import { BookIcon, UserIcon, HomeIcon } from '../icons/index.jsx';

// Use in JSX
<BookIcon className="w-6 h-6 text-purple-500" />
<UserIcon className="w-8 h-8 fill-white" />
```

### Styling Guidelines
```jsx
// Size classes (Tailwind)
className="w-4 h-4"    // Small (16px)
className="w-6 h-6"    // Medium (24px) - Default
className="w-8 h-8"    // Large (32px)
className="w-12 h-12"  // Extra Large (48px)

// Color classes
className="text-purple-500"  // Stroke color
className="fill-white"       // Fill color
className="text-gray-400"    // Muted state
```

### Common Patterns
```jsx
// Navigation icons
<HomeIcon className="w-6 h-6 text-white hover:text-blue-400" />

// Button icons
<button className="flex items-center gap-2">
  <BookIcon className="w-5 h-5" />
  Study Materials
</button>

// Category displays
<div className="flex flex-col items-center">
  <BasketballIcon className="w-12 h-12 text-purple-500" />
  <span>Sports</span>
</div>
```

## Technical Implementation

### SVG Standards
- **ViewBox**: `0 0 24 24` (standard 24x24 grid)
- **Stroke Width**: `1.5` for outline icons
- **Fill**: `currentColor` for solid icons
- **Props**: All icons accept `className` prop

### Performance Benefits
- **Bundle Size**: Reduced from 22 files to 1 consolidated library
- **Tree Shaking**: Only imported icons included in bundle
- **Consistency**: Uniform sizing and styling across application
- **Maintainability**: Single source of truth for all icons

## Adding New Icons

### 1. Source Guidelines
- **Preferred**: Heroicons, Lucide, or FontAwesome
- **Format**: SVG with 24x24 viewBox
- **Style**: Match existing stroke width and fill patterns

### 2. Implementation Steps
```jsx
// Add to icons/index.jsx
export const NewIcon = ({ className = "" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    <path d="..." />
  </svg>
);
```

### 3. Naming Convention
- **PascalCase**: `BookIcon`, `UserIcon`
- **Descriptive**: Avoid generic names like `Icon1`
- **Consistent**: Follow existing naming patterns

## Migration History
**September 2025**: Consolidated 22+ individual icon files into unified system
- Eliminated `/components/icons/[IconName].jsx` pattern
- Created single exportable library
- Updated all component imports
- Standardized sizing and styling props

## FontAwesome Integration (Legacy)
For complex icons still requiring FontAwesome:
1. Create free account at fontawesome.com
2. Select icon and choose "SVG" format
3. Copy `d="..."` path data
4. Integrate following library patterns above
