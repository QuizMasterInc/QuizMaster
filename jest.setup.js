//Setup before all tests
import '@testing-library/jest-dom';

// Mock Firebase
global.console = {
  ...console,
  // Suppress Firebase warnings in tests
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock environment variables
process.env = {
  ...process.env,
  VITE_FIREBASE_API_KEY: 'test-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'test-domain',
  VITE_FIREBASE_PROJECT_ID: 'test-project',
  VITE_FIREBASE_STORAGE_BUCKET: 'test-bucket',
  VITE_FIREBASE_MESSAGING_SENDER_ID: 'test-sender',
  VITE_FIREBASE_APP_ID: 'test-app-id'
};