import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

/**
 * Authentication provider component
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isGoogleAuth, setIsGoogleAuth] = useState(false);

    // Initialize auth service and listen to auth state changes
    useEffect(() => {
        const unsubscribe = authService.init();

        // Subscribe to auth state changes
        const authUnsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    setLoading(true);
                    setIsGoogleAuth(firebaseUser.providerData[0]?.providerId === 'google.com');
                
                    const userProfile = await authService.getUserProfile(firebaseUser.uid);
                
                    setUser(firebaseUser);
                    setProfile(userProfile);
                    setError(null);
                
                } catch (err) {
                    console.error('Error fetching user profile:', err);
                    setError(err.message || 'Failed to load user profile');
                    setUser(firebaseUser);
                    setProfile(null);
                }
            } else {
                setUser(null);
                setProfile(null);
                setIsGoogleAuth(false);
            }
            
            setLoading(false);
        });

        // Cleanup function
        return () => {
            unsubscribe();
            authUnsubscribe();
        };
    }, []);

    /**
     * Sign in user
     */
    const signIn = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);

        try {
            const result = await authService.signIn(email, password);
            // User state will be updated via auth state listener
            return result;
        } catch (err) {
            setError(err.message || 'Sign in failed');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Register new user
     */
    const signUp = useCallback(async (userData) => {
        setLoading(true);
        setError(null);

        try {
        const result = await authService.register(userData);
        // User state will be updated via auth state listener
        return result;
        } catch (err) {
        setError(err.message || 'Registration failed');
        throw err;
        } finally {
        setLoading(false);
        }
    }, []);

    /**
     * Sign out user
     */
    const signOut = useCallback(async () => {
        setLoading(true);

        try {
            await authService.signOut();
            // User state will be updated via auth state listener
        } catch (err) {
            setError(err.message || 'Sign out failed');
            console.error('Sign out error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Send password reset email
     */
    const resetPassword = useCallback(async (email) => {
        setError(null);

        try {
            await authService.sendPasswordResetEmail(email);
        } catch (err) {
            setError(err.message || 'Password reset failed');
            throw err;
        }
    }, []);

    /**
     * Update user profile
     */
    const updateUserProfile = useCallback(async (updates) => {
        if (!user) {
            throw new Error('No user is currently signed in');
        }

        setLoading(true);
        setError(null);

        try {
            const updatedProfile = await authService.updateUserProfile(user.uid, updates);
            setProfile(updatedProfile);
            return updatedProfile;
        } catch (err) {
            setError(err.message || 'Profile update failed');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    /**
     * Change password
     */
    const changePassword = useCallback(async (currentPassword, newPassword) => {
        setError(null);

        try {
            await authService.changePassword(currentPassword, newPassword);
        } catch (err) {
            setError(err.message || 'Password change failed');
            throw err;
        }
    }, []);

    /**
     * Check if user has specific role
     */
    const hasRole = useCallback(async (roles) => {
        if (!user) return false;

        try {
            return await authService.hasRole(user.uid, roles);
        } catch (err) {
            console.error('Error checking role:', err);
            return false;
        }
    }, [user]);

    // Context values
    const value = {
        user,
        profile,
        currentUser: user, // For backward compatibility        
        loading,
        error,
        isGoogleAuth,
        isAuthenticated: !!user,
        login: signIn, // For backward compatibility
        signup: signUp, // For backward compatibility
        signIn,
        signUp,
        logout: signOut, // For backward compatibility
        signOut,
        resetPassword,
        updateUserProfile,
        updateProfile: updateUserProfile, // For backward compatibility
        changePassword,
        hasRole,
        clearError: () => setError(null),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook for using authentication context
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;