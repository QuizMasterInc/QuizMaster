# Unified Icon System

## Overview
Consolidated icon library containing all SVG icons used throughout QuizMaster. This system replaced 22+ individual icon files with a single, maintainable library.

## Available Icons

## **Academic Icons**
- `Book` - Reading and study materials
- `Calculator` - Math and calculations
- `Scroll` - Certificates and documents
- `Q` - QuizMaster brand logo

### **Category Icons**
- `Basketball` - Sports category
- `Football` - Sports category
- `Soccer` - Sports category

### **User Interface Icons**
- `User` - User profiles and accounts
- `Home` - Home navigation
- `Settings` - User settings
- `Dashboard` - Dashboard navigation

### **Media Icons**
- `Music` - Audio and sound
- `VideoCamera` - Video content
- `Microphone` - Audio recording

### **System Icons**
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