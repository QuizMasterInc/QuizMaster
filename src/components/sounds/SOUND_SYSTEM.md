# Consolidated Sound System

## Overview
Unified sound effects system providing consistent audio feedback throughout QuizMaster. This system replaced multiple duplicate sound components with a single, configurable library.

## Available Sound Types

### 🎵 **Quiz Feedback Sounds**
- `"correct"` - Success sound for correct answers
- `"incorrect"` - Feedback sound for wrong answers  
- `"completion"` - Quiz completion celebration sound

### 🔊 **System Sounds**
- `"notification"` - General notification alerts
- `"click"` - Button and interaction feedback
- `"transition"` - Page transition audio

## Usage

### Basic Implementation
```jsx
import { SoundEffect } from '../sounds/index.jsx';

// In quiz completion modal
<SoundEffect type="completion" />

// In answer feedback
<SoundEffect type={isCorrect ? "correct" : "incorrect"} />

// Custom sound file
<SoundEffect type="notification" />
```

### Integration with Volume Context
```jsx
import { SoundEffect } from '../sounds/index.jsx';
import { useVolumeSettings } from '../../contexts/VolumeContext';

function QuizComponent() {
  const { volume, soundEnabled } = useVolumeSettings();
  
  return (
    <div>
      {soundEnabled && <SoundEffect type="correct" />}
    </div>
  );
}
```

## Technical Implementation

### Dynamic Sound Loading
```jsx
const soundMap = {
  correct: '/sounds/correct.mp3',
  incorrect: '/sounds/incorrect.mp3', 
  completion: '/sounds/completion.mp3',
  notification: '/sounds/notification.mp3'
};
```

### Volume Control Integration
- **Respects user preferences** from VolumeContext
- **Conditional rendering** based on `soundEnabled` setting
- **Volume level** controlled by global volume state

### Performance Features
- **Lazy loading**: Sounds loaded only when needed
- **Preloading**: Critical sounds can be preloaded
- **Memory management**: Automatic cleanup of audio elements

## Component Props

### `SoundEffect` Component
```jsx
<SoundEffect 
  type="correct"           // Required: sound type to play
  autoPlay={true}          // Optional: auto-play on mount (default: true)
  volume={0.5}            // Optional: override global volume
  onEnded={() => {...}}   // Optional: callback when sound ends
/>
```

## Migration Benefits

### Before Consolidation
- **4 separate sound components** with duplicate logic
- **Inconsistent volume handling** across components
- **Repeated imports** in multiple files
- **Maintenance overhead** for similar functionality

### After Consolidation
- **Single sound system** with type-based selection
- **Unified volume control** integration
- **Consistent API** across all components
- **Backward compatibility** with existing sound exports

## Adding New Sounds

### 1. Add Sound File
Place audio file in `/public/sounds/` directory:
```
/public/sounds/
├── correct.mp3
├── incorrect.mp3
├── completion.mp3
└── new-sound.mp3
```

### 2. Update Sound Map
```jsx
// In sounds/index.jsx
const soundMap = {
  // existing sounds...
  'new-sound': '/sounds/new-sound.mp3'
};
```

### 3. Use in Components
```jsx
<SoundEffect type="new-sound" />
```

## Audio Guidelines

### File Specifications
- **Format**: MP3 or WAV for broad compatibility
- **Duration**: Keep under 3 seconds for UI feedback
- **Size**: Optimize for web (under 100KB recommended)
- **Quality**: 44.1kHz, 16-bit minimum

### User Experience
- **Non-intrusive**: Sounds should enhance, not distract
- **Contextual**: Match sound to user action
- **Respect preferences**: Always honor volume settings
- **Accessibility**: Provide visual alternatives for deaf users

## Backward Compatibility

### Legacy Component Support
The system maintains exports for older sound components:
```jsx
// These still work for backward compatibility
import CorrectSound from '../sounds/CorrectSound';
import WrongSound from '../sounds/WrongSound';
```

However, new development should use the unified `SoundEffect` component.

## Migration History
**September 2025**: Consolidated sound system implementation
- Combined 4 duplicate sound components into single system
- Integrated with VolumeContext for consistent user control
- Maintained backward compatibility for existing implementations
- Improved performance through dynamic loading
