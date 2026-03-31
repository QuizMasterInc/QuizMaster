import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/auth/authService';
import { ensureOAuthUsername, reserveUsername } from '../services/firebase/usernameService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isGoogleAuth, setIsGoogleAuth] = useState(false);
    const [authInitialized, setAuthInitialized] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

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
                        
                        // Check if Google auth
                        const isGoogle = firebaseUser.providerData[0]?.providerId === 'google.com';
                        setIsGoogleAuth(isGoogle);
                        
                        // Handle anonymous users (no profile in Firestore)
                        if (firebaseUser.isAnonymous) {
                            setUser(firebaseUser);
                            setProfile(null);
                            setError(null);
                            return;
                        }

                        // Fetch user profile for real users
                        const userProfile = await authService.getUserProfile(firebaseUser.uid);

                        if (!userProfile) {
                            console.error('User authenticated but no profile found');
                            await authService.signOut();
                            setError('Account data not found. Please try signing in again.');
                            setUser(null);
                            setProfile(null);
                            return;
                        }

                        // Success - set user and profile
                        setUser(firebaseUser);
                        setProfile(userProfile);
                        setError(null);
                        
                    } catch (err) {
                        console.error('Error fetching user profile:', err);
                        setError(err.message || 'Failed to load user profile');
                        // Keep user set so they can retry
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
                // Ensure OAuth users have a classroom-friendly username
                await ensureOAuthUsername({ uid: result.user.uid });
                return result;
            }
            
        } catch (err) {
            // Remove console.error to keep console clean
            const errorMessage = err.message || 'Failed to sign in with Google';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    const googleRegister = useCallback(async (additionalData = {}) => {
        setError(null);

        try {
            // The service now handles everything synchronously
            const result = await authService.registerWithGoogle(additionalData);
            
            if (result && result.user && result.profile) {
                // Assign an auto-generated classroom-friendly username if missing
                await ensureOAuthUsername({ uid: result.user.uid });
                const updatedProfile = await authService.getUserProfile(result.user.uid);

                // Set state immediately - no need to wait for auth state listener
                setUser(result.user);
                setProfile(updatedProfile || result.profile);
                setIsGoogleAuth(true);
                setLoading(false);
                return { ...result, profile: updatedProfile || result.profile };
            }
            
            throw new Error('Registration completed but data not returned');
            
        } catch (err) {
            const errorMessage = err.message || 'Failed to register with Google';
            setError(errorMessage);
            setLoading(false);
            throw new Error(errorMessage);
        }
    }, []);

    const githubLogin = useCallback(async () => {
        setError(null);

        try {
            const result = await authService.signInWithGitHub();

            if (result && result.user) {
                // Ensure OAuth users have a classroom-friendly username
                await ensureOAuthUsername({ uid: result.user.uid });
                return result;
            }

        } catch (err) {
            const errorMessage = err.message || 'Failed to sign in with GitHub';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    const githubRegister = useCallback(async (additionalData = {}) => {
        setError(null);

        try {
            const result = await authService.registerWithGitHub(additionalData);

            if (result && result.user && result.profile) {
                // Assign an auto-generated classroom-friendly username if missing
                await ensureOAuthUsername({ uid: result.user.uid });
                const updatedProfile = await authService.getUserProfile(result.user.uid);

                setUser(result.user);
                setProfile(updatedProfile || result.profile);
                setLoading(false);
                return { ...result, profile: updatedProfile || result.profile };
            }

            throw new Error('Registration completed but data not returned');

        } catch (err) {
            const errorMessage = err.message || 'Failed to register with GitHub';
            setError(errorMessage);
            setLoading(false);
            throw new Error(errorMessage);
        }
    }, []);


    const signUp = useCallback(async (userData) => {
        // Don't set global loading - let components handle their own loading states
        setError(null);
        setIsRegistering(true);

        try {
            const result = await authService.register(userData);
            
            if (result && result.user) {
                // Atomically reserve the chosen username (guarantees uniqueness)
                if (userData?.username) {
                    await reserveUsername({ uid: result.user.uid, username: userData.username });
                }

                // Refresh profile so username shows up immediately
                const updatedProfile = await authService.getUserProfile(result.user.uid);

                // Set the user and profile immediately after successful registration
                setUser(result.user);
                setProfile(updatedProfile || result.profile);
                setError(null);
                setLoading(false);

                return { ...result, profile: updatedProfile || result.profile };
            }
            
            return result;
        } catch (err) {
            if (err?.message === 'USERNAME_TAKEN') {
                setError('That username is already taken. Try another.');
            } else {
                setError(err.message || 'Registration failed');
            }
            throw err;
        } finally {
            setIsRegistering(false);
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

    const value = {
        user,
        profile,
        currentUser: user,
        loading,
        error,
        isGoogleAuth,
        authInitialized,
        isAuthenticated: user && !user.isAnonymous,
        googleLogin,
        googleRegister,
        githubLogin,
        githubRegister,
        signup: signUp,
        signIn,
        signUp,
        logout: signOut,
        signOut,
        resetPassword,
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