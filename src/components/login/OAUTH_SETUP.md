# OAuth Authentication Setup Guide

This guide explains how to set up GitHub and Apple authentication for QuizMaster.

## Overview

QuizMaster now supports two OAuth providers:
- **Google** (already configured)
- **GitHub** (new)

All OAuth authentication uses Firebase's built-in OAuth flow with `signInWithPopup()`, which means **you don't need custom callback URLs in your React app**. Firebase handles all redirects automatically.

---

## GitHub Authentication Setup

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Settings → Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the following:
   - **Application name**: `QuizMaster` (or your preferred name)
   - **Homepage URL**: 
     - Development: `http://localhost:5173`
     - Production: `https://yourdomain.com`
   - **Authorization callback URL**: `https://<your-firebase-project-id>.firebaseapp.com/__/auth/handler`
     
     ⚠️ **Important**: Get the exact callback URL from Firebase Console (see Step 2)

4. Click **"Register application"**
5. Copy your **Client ID** and generate a **Client Secret**

### Step 2: Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication → Sign-in method**
4. Click **"Add new provider"**
5. Select **GitHub**
6. Enable the provider
7. Copy the **Authorization callback URL** shown (it will be `https://<project-id>.firebaseapp.com/__/auth/handler`)
8. Paste your GitHub **Client ID** and **Client Secret**
9. Click **Save**

### Step 3: Update GitHub OAuth App

1. Go back to your GitHub OAuth App settings
2. Paste the Firebase callback URL into **"Authorization callback URL"**
3. Save changes

✅ **Done!** GitHub authentication is now configured.



---

## Testing Authentication

### Local Development

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the registration page
3. Click "Sign up with GitHub" or "Sign up with Apple"
4. Complete the OAuth flow in the popup window
5. You'll be redirected back to the dashboard

### Troubleshooting

**GitHub:**
- Make sure your callback URL exactly matches: `https://<project-id>.firebaseapp.com/__/auth/handler`
- Check that your OAuth App is not in "Development" mode for production use

**Apple:**
- Ensure all domains and return URLs are correctly configured
- Verify your Team ID, Key ID, and Private Key are correct
- Apple authentication requires HTTPS in production

**Common Errors:**
- `auth/popup-blocked`: User's browser blocked the popup - ask them to allow popups
- `auth/cancelled-popup-request`: User closed the popup - this is normal
- `auth/popup-closed-by-user`: User closed the popup before completing sign-in

---

## How It Works

### No Custom Callback Routes Needed

Firebase's `signInWithPopup()` handles the entire OAuth flow:

1. User clicks "Sign up with GitHub/Apple"
2. A popup window opens to the OAuth provider
3. User authenticates and authorizes the app
4. OAuth provider redirects to Firebase's handler: `/__/auth/handler`
5. Firebase processes the response and closes the popup
6. Your app receives the authenticated user
7. User profile is created in Firestore
8. User is redirected to dashboard

### Code Flow

```javascript
// 1. User clicks button
async function handleGitHubRegister() {
  // 2. Call AuthContext method
  await githubRegister(additionalData)
}

// 3. AuthContext calls authService
const githubRegister = async (additionalData) => {
  const result = await authService.registerWithGitHub(additionalData)
}

// 4. authService uses Firebase
async registerWithGitHub(additionalData) {
  const provider = new GithubAuthProvider()
  const result = await signInWithPopup(auth, provider) // Firebase handles everything!
  // Create user profile in Firestore
  // Return user data
}
```

---

3. Click "Sign up with GitHub"

1. **Never commit** your OAuth secrets to version control
2. Store secrets in environment variables or Firebase Functions config
3. Enable **only the OAuth providers you need**
4. Regularly rotate your OAuth secrets
5. Monitor authentication logs in Firebase Console

---

When deploying to production, update your OAuth app settings:

**GitHub:**
- Homepage URL: `https://yourdomain.com`
- Callback URL stays the same: `https://<project-id>.firebaseapp.com/__/auth/handler`

**Apple:**
- Add your production domain to authorized domains
- Return URL stays the same: `https://<project-id>.firebaseapp.com/__/auth/handler`

### Custom Domain (Optional)

If you want to use a custom domain for OAuth callbacks:

1. Set up Firebase Hosting with your custom domain
2. Update OAuth provider callback URLs to: `https://yourdomain.com/__/auth/handler`
3. Firebase will automatically handle the routing

1. User clicks "Sign up with GitHub"

## Support

For issues or questions:
- Check Firebase Authentication documentation
- Review provider-specific OAuth documentation (GitHub, Apple)
- Check browser console for detailed error messages

