# QuizMaster Source Directory

## Purpose
Core application architecture implementing optimized React components, intelligent state management, and efficient service layer integration.

## Architecture Overview (September 2025)

### Structure
- **`components/`** - Optimized React components with server-side processing integration
- **`contexts/`** - Context providers with intelligent caching and batch operations  
- **`services/`** - Service layer abstracting Firebase operations with performance optimizations
- **`routes/`** - Route protection and navigation management
- **`config/`** - Firebase configuration and environment setup

### Key Files

#### `App.jsx`
Main application container with:
- Context provider orchestration (Auth, Results, Categories)
- Global routing and navigation
- Error boundary implementation
- Performance monitoring integration

#### `main.jsx`  
Application entry point with:
- React 18 concurrent features
- Performance profiling setup
- Development tools integration

## Performance Features

### Service Layer Integration
- **Batch Operations**: Single API calls replace multiple requests
- **Intelligent Caching**: Context-aware caching strategies (1-30 minutes)
- **Server-Side Processing**: Complex operations handled by Firebase Functions
- **Error Handling**: Comprehensive retry logic and user-friendly messaging

### Component Optimization
- **Lazy Loading**: Components loaded on-demand for faster initial render
- **Context Splitting**: Optimized re-render patterns prevent unnecessary updates
- **Efficient Rendering**: Server-side data processing reduces client workload

### State Management
- **Centralized Contexts**: Single source of truth for application state
- **Smart Caching**: Data cached based on volatility and usage patterns  
- **Batch Updates**: Coordinated state changes minimize render cycles

## Development Patterns
- **Service-First Architecture**: Business logic abstracted to service layer
- **Context-Driven State**: Centralized data management with intelligent caching
- **Component Separation**: Pure rendering components with minimal business logic
- **Performance-Focused**: Optimized data flow and minimal client-side processing