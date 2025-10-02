# Route Components

## Purpose
The route components provide authentication-based navigation control throughout the QuizMaster application. These components ensure proper access control and user flow based on authentication status and user roles.

## Architecture

### Component Structure
```
routes/
├── PrivateRoute.jsx        # Protected routes for authenticated users
├── PrivateSigninRoute.jsx  # Login flow protection for authenticated users
├── DeveloperRoute.jsx      # Role-based access for developer features
├── PublicRoute.jsx         # Public access routes
└── README.md              # This documentation
```

### Key Features
- **Authentication Control**: Route access based on user login status
- **Role-Based Access**: Different access levels for users, developers, and admins
- **Automatic Redirects**: Seamless navigation based on authentication state
- **Context Integration**: Real-time authentication state monitoring

## Route Components

### PrivateRoute.jsx
**Purpose**: Protects routes that require authentication
**Usage**: Wraps components that need user login

### PrivateSigninRoute.jsx
**Purpose**: Prevents authenticated users from accessing login pages
**Usage**: Wraps authentication-related components

### DeveloperRoute.jsx
**Purpose**: Restricts access to developer and admin features
**Usage**: Wraps administrative and developer tools

### PublicRoute.jsx
**Purpose**: Manages public access routes
**Usage**: Routes accessible to all users regardless of authentication

## Usage Example
```jsx
// In App.jsx
<Routes>
  <Route path="/dashboard" element={
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  } />
  
  <Route path="/login" element={
    <PrivateSigninRoute>
      <Login />
    </PrivateSigninRoute>
  } />
  
  <Route path="/developer" element={
    <DeveloperRoute>
      <DeveloperTools />
    </DeveloperRoute>
  } />
</Routes>
```