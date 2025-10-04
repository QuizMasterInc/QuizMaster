# Source Directory

## Overview
Contains the main React application code for QuizMaster. The architecture follows a service-first approach where business logic is handled by dedicated service files, and React components focus on rendering and user interaction.

## Directory Structure

### `components/`
React components organized by feature (quiz, dashboard, navigation, etc.). Each component focuses on UI rendering while delegating data operations to services. See [Components Architecture](./components/COMPONENTS_ARCHITECTURE.md) for details.

### `services/`
JavaScript modules that handle all Firebase operations and data management. These provide clean APIs for components to use without directly dealing with Firebase. See [Services Documentation](./services/services.md) for details.

### `contexts/`
React Context providers that manage global application state like user authentication, quiz results, and app-wide data. See [Contexts README](./contexts/README.md) for details.

### `routes/`
Route protection components that control access to different parts of the app based on user authentication and permissions. See [Routes README](./routes/README.md) for details.

### `pages/`
Top-level page components that combine multiple smaller components into complete pages. See [Pages Directory](./pages/PAGES_DIRECTORY.md) for details.

### `config/`
Firebase configuration and environment setup files.

## Key Files

### `App.jsx`
The main application component that sets up routing, context providers, and the overall app structure.

### `main.jsx`
Application entry point that renders the React app and connects it to the DOM.

## Architecture Pattern
The app uses a **service-first architecture** where:
- **Services** handle all data operations and Firebase communication
- **Contexts** manage shared state across components
- **Components** focus on UI rendering and user interactions
- **Routes** control page access and navigation
