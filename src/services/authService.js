/**
 * Authentication service - handles all user authentication operations
 */
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,sendPasswordResetEmail, updatePassword, updateProfile, onAuthStateChanged,
    EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, handleFirebaseError, withRetry, timestamp } from './firebaseService';
  
class AuthService {
    constructor() {
        this.currentUser = null;
        this.authStateListeners = [];
    }
  
    /**
     * Initialize auth state listener
     */
    init() {
        return onAuthStateChanged(auth, (user) => {
            this.currentUser = user;
            this.authStateListeners.forEach(callback => callback(user));
        });
    }
  
    /**
     * Subscribe to authentication state changes
     * @param {Function} callback - Callback function to execute on auth state change
     * @returns {Function} Unsubscribe function
     */
    onAuthStateChange(callback) {
        this.authStateListeners.push(callback);
      
        // Return unsubscribe function
        return () => {
            this.authStateListeners = this.authStateListeners.filter(cb => cb !== callback);
        };
    }
  
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} User data
     */
    async register(userData) {
        const { email, password, firstName, lastName, role = 'student' } = userData;
        
        try {
            
            const userCredential = await withRetry(() => 
                createUserWithEmailAndPassword(auth, email, password)
            );
            
            const user = userCredential.user;
            
            await updateProfile(user, { displayName: `${firstName} ${lastName}`});
            
            const userDoc = { uid: user.uid, email: user.email, firstName, lastName, displayName: `${firstName} ${lastName}`, role,
                createdAt: timestamp.now(), updatedAt: timestamp.now(), isActive: true, profileComplete: true
            };
            
            await setDoc(doc(db, 'users', user.uid), userDoc);
            
            return {
                user: user,
                profile: userDoc
            };
            
        } catch (error) {
            throw handleFirebaseError(error);
        }
    }
  
    /**
     * Sign in user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User data
     */
    async signIn(email, password) {
        try {
            const userCredential = await withRetry(() => 
                signInWithEmailAndPassword(auth, email, password)
            );
            
            const user = userCredential.user;
            
            const profile = await this.getUserProfile(user.uid);
            
            // Update last login time
            await updateDoc(doc(db, 'users', user.uid), {
                lastLoginAt: timestamp.now(),
                updatedAt: timestamp.now()
            });
            
            return {
                user: user,
                profile: profile
            };
            
        } catch (error) {
            throw handleFirebaseError(error);
        }
    }
  
    /**
     * Sign out user
     * @returns {Promise<void>}
     */
    async signOut() {
        try {
            await signOut(auth);
        } catch (error) {
            throw handleFirebaseError(error);
        }
    }
  
    /**
     * Get user profile from Firestore
     * @param {string} uid - User ID
     * @returns {Promise<Object>} User profile
     */
    async getUserProfile(uid) {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            
            if (!userDoc.exists()) {
                throw new Error('User profile not found');
            }
            
            const profile = userDoc.data();

            return {
                ...profile,
                createdAt: timestamp.fromFirestore(profile.createdAt),
                updatedAt: timestamp.fromFirestore(profile.updatedAt),
                lastLoginAt: timestamp.fromFirestore(profile.lastLoginAt)
            };
            
        } catch (error) {
            throw handleFirebaseError(error);
        }
    }
  
    /**
     * Update user profile
     * @param {string} uid - User ID
     * @param {Object} updates - Profile updates
     * @returns {Promise<Object>} Updated profile
     */
    async updateUserProfile(uid, updates) {
        try {
            const profileUpdates = {
                ...updates,
                updatedAt: timestamp.now()
            };

            await updateDoc(doc(db, 'users', uid), profileUpdates);
            
            if (updates.firstName || updates.lastName) {
                const displayName = `${updates.firstName || ''} ${updates.lastName || ''}`.trim();
                if (displayName && this.currentUser) {
                    await updateProfile(this.currentUser, { displayName });
                }
            }
            
            return await this.getUserProfile(uid);
            
        } catch (error) {
            throw handleFirebaseError(error);
        }
    }
  
    /**
     * Send password reset email
     * @param {string} email - User email
     * @returns {Promise<void>}
     */
    async sendPasswordResetEmail(email) {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            throw handleFirebaseError(error);
        }
    }
  
    /**
     * Change user password
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<void>}
     */
    async changePassword(currentPassword, newPassword) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('No user is currently signed in');
            }
            
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            
            await updatePassword(user, newPassword);
            
            await updateDoc(doc(db, 'users', user.uid), {
                updatedAt: timestamp.now()
            });
            
        } catch (error) {
            throw handleFirebaseError(error);
        }
    }
  
    /**
     * Check if user has specific role
     * @param {string} uid - User ID
     * @param {string|Array} roles - Role(s) to check
     * @returns {Promise<boolean>} Whether user has the role
     */
    async hasRole(uid, roles) {
        try {
            const profile = await this.getUserProfile(uid);
            const userRole = profile.role;
            
            if (Array.isArray(roles)) {
                return roles.includes(userRole);
            }
            
            return userRole === roles;
            
        } catch (error) {
            console.error('Error checking user role:', error);
            return false;
        }
    }
  
    /**
     * Get current user
     * @returns {Object|null} Current user
     */
    getCurrentUser() {
        return this.currentUser;
    }
  
    /**
     * Check if user is authenticated
     * @returns {boolean} Whether user is authenticated
     */
    isAuthenticated() {
        return !!this.currentUser;
    }
  }
  
// Export singleton instance
export default new AuthService();