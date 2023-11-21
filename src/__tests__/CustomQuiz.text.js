import {CustomQuiz} from '.././components/customquiz/CustomQuiz'

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; // for better matchers


// Mock the useAuth hook for testing purposes
jest.mock('../path-to-use-auth', () => ({
  useAuth: jest.fn(() => ({ currentUser: { uid: 'mockUserId' } })),
}));

// Mock the fetch function to avoid actual network requests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: [] }),
  })
);

describe('CustomQuiz Component', () => {
  beforeEach(() => {
    // Clear any mocks and reset component state before each test
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<CustomQuiz />);
    // You might add more specific assertions based on your component structure
  });

  it('fetches user quizzes on mount', async () => {
    render(<CustomQuiz />);
    // Wait for the component to fetch data
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    // You might assert on the rendered content or the state after fetching
  });

  it('handles quiz name input correctly', () => {
    const { getByLabelText, getByText } = render(<CustomQuiz />);
    
    // Simulate user input
    fireEvent.change(getByLabelText(/quiz name/i), { target: { value: 'Test Quiz' } });

    // You might assert on the state or the DOM to verify the behavior
    expect(getByText(/test quiz/i)).toBeInTheDocument();
  });

  it('handles private quiz checkbox correctly', () => {
    const { getByLabelText, getByText } = render(<CustomQuiz />);
    
    // Simulate user clicking on the checkbox
    fireEvent.click(getByLabelText(/private quiz/i));

    // You might assert on the state or the DOM to verify the behavior
    expect(getByText(/private quiz/i)).toBeInTheDocument();
  });

  // Add more tests for other parts of your component's functionality

  // For example, you can test the createQuizObject function, verifyQuizNameInput, etc.

});
