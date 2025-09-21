import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isGoogleAuth, setIsGoogleAuth] = useState(false);
    const [authInitialized, setAuthInitialized] = useState(false);

    // Single useEffect to handle all auth initialization
    useEffect(() => {
        let isMounted = true;
        let authUnsubscribe = null;
        
        const initializeAuth = async () => {
            try {
                // Initialize auth service
                const unsubscribe = authService.init();
                
                                // Subscribe to auth state changes
                const authUnsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
                    if (!isMounted) return;
                    
                    if (firebaseUser) {
                        try {
                            setLoading(true);
                            setIsGoogleAuth(firebaseUser.providerData[0]?.providerId === 'google.com');
                        
                            // Fetch or create user profile
                            let userProfile = null;
                            try {
                                userProfile = await authService.getUserProfile(firebaseUser.uid);
                                
                                // Create profile for new Google users
                                if (!userProfile && firebaseUser.providerData[0]?.providerId === 'google.com') {
                                    await authService.handleGoogleUserProfile(firebaseUser);
                                    userProfile = await authService.getUserProfile(firebaseUser.uid);
                                }
                            } catch (profileError) {
                                console.error('Error with user profile:', profileError);
                            }
                        
                            setUser(firebaseUser);
                            setProfile(userProfile);
                            setError(null);
                        
                        } catch (err) {
                            console.error('Error in auth state change:', err);
                            setError(err.message || 'Authentication error');
                            setUser(firebaseUser);
                            setProfile(null);
                        } finally {
                            setLoading(false);
                        }
                    } else {
                        setUser(null);
                        setProfile(null);
                        setIsGoogleAuth(false);
                        setError(null);
                        setLoading(false);
                    }
                });

                // Mark auth as initialized
                setAuthInitialized(true);
                
                return unsubscribe;
                
            } catch (error) {
                console.error('Auth initialization error:', error);
                if (isMounted) {
                    setError(error.message || 'Failed to initialize authentication');
                    setLoading(false);
                }
            }
        };

        initializeAuth();
        
        return () => {
            isMounted = false;
            if (authUnsubscribe) {
                authUnsubscribe();
            }
        };
    }, []);

    const signIn = useCallback(async (email, password) => {
        // Don't set global loading - let components handle their own loading states
        setError(null);

        try {
            const result = await authService.signIn(email, password);
            return result;
        } catch (err) {
            setError(err.message || 'Sign in failed');
            throw err;
        }
    }, []);

    const googleLogin = useCallback(async () => {
        setError(null);

        try {
            const result = await authService.signInWithGoogle();
            
            if (result && result.user) {
                return result;
            }
            
        } catch (err) {
            // Remove console.error to keep console clean
            const errorMessage = err.message || 'Failed to sign in with Google';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    const signUp = useCallback(async (userData) => {
        // Don't set global loading - let components handle their own loading states
        setError(null);

        try {
            const result = await authService.register(userData);
            return result;
        } catch (err) {
            setError(err.message || 'Registration failed');
            throw err;
        }
    }, []);

    const signOut = useCallback(async () => {
        setLoading(true);

        try {
            await authService.signOut();
        } catch (err) {
            setError(err.message || 'Sign out failed');
            console.error('Sign out error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const resetPassword = useCallback(async (email) => {
        setError(null);

        try {
            await authService.sendPasswordResetEmail(email);
        } catch (err) {
            setError(err.message || 'Password reset failed');
            throw err;
        }
    }, []);

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

    const changePassword = useCallback(async (currentPassword, newPassword) => {
        setError(null);

        try {
            await authService.changePassword(currentPassword, newPassword);
        } catch (err) {
            setError(err.message || 'Password change failed');
            throw err;
        }
    }, []);

    const hasRole = useCallback(async (roles) => {
        if (!user) return false;

        try {
            return await authService.hasRole(user.uid, roles);
        } catch (err) {
            console.error('Error checking role:', err);
            return false;
        }
    }, [user]);

    const value = {
        user,
        profile,
        currentUser: user,
        loading,
        error,
        isGoogleAuth,
        authInitialized,
        isAuthenticated: !!user,
        login: signIn,
        googleLogin,
        signup: signUp,
        signIn,
        signUp,
        logout: signOut,
        signOut,
        resetPassword,
        updateUserProfile,
        updateProfile: updateUserProfile,
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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};