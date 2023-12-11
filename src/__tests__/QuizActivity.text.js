import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuizActivity from '../components/quiz/QuizActivity';
import { AuthProvider } from '../contexts/AuthContext';

// Import the AuthContext module directly
import * as AuthContext from '../contexts/AuthContext';


// Test your component
test('renders without crashing', async () => {
  // Mock the useAuth method
  jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
    currentUser: { uid: 'mockUserId' },
    setCurrentUser: jest.fn(),
    setLoading: jest.fn(),
  });

  // Render the component
  render(
    <MemoryRouter>
      <AuthProvider>
        <QuizActivity />
      </AuthProvider>
    </MemoryRouter>
  );

  // No need for waitFor or additional expectations in this simple test

  // Your testing logic here if needed
});
