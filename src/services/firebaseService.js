/**
 * Core Firebase service - handles initialization and common utilities
 */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

// Error handling utility
export const handleFirebaseError = (error) => {    
    // Map Firebase error codes to user-friendly messages
    const errorMessages = {
        'auth/user-not-found': 'No account found with this email address.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password should be at least 6 characters long.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'permission-denied': 'You do not have permission to perform this action.',
        'unavailable': 'Service is currently unavailable. Please try again later.',
        'not-found': 'The requested resource was not found.',
    };

    const userFriendlyMessage = errorMessages[error.code] || error.message || 'An unexpected error occurred.';
    
    // Create a proper Error object with the user-friendly message
    const friendlyError = new Error(userFriendlyMessage);
    friendlyError.code = error.code || 'unknown-error';
    friendlyError.originalError = error;
    
    return friendlyError;
};

// Retry mechanism for Firebase operations
export const withRetry = async (operation, maxRetries = 3, delay = 700) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt === maxRetries) {
                throw handleFirebaseError(error);
            }
        
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
    }
};

// Firebase timestamp utilities
export const timestamp = {
    now: () => new Date(),

    fromFirestore: (firestoreTimestamp) => {
        return firestoreTimestamp?.toDate?.() || null;
    },

    toFirestore: (date) => {
        return date instanceof Date ? date : new Date(date);
    }
};

export default app;