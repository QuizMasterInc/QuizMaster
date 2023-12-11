import React from 'react';
import { render, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CustomQuiz from '../components/customquiz/CustomQuiz';
import { AuthProvider } from '../contexts/AuthContext';

// Import the AuthContext module directly
import * as AuthContext from '../contexts/AuthContext';

// Test your component
test('renders without crashing', async () => {
  // Set up a mock user for testing
  const mockUser = {
    uid: 'mockUserId',
    // Add other properties as needed for your tests
  };

  // Mock the useAuth method
  jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
    currentUser: mockUser,
    setCurrentUser: jest.fn(),
    setLoading: jest.fn(), // Mock the setLoading function
  });

  // Wrap your rendering and testing logic in an `act` call
  await act(async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <CustomQuiz />
        </AuthProvider>
      </MemoryRouter>
    );
  });

  // Your testing logic here
  // This is where you can add your assertions to test the component's behavior

  // No need for additional act for synchronous code, but if you have async code, use act again
});
