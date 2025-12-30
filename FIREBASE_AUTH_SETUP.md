# Firebase Authentication Setup for Risewith9

## Firebase Configuration

The Firebase configuration is already set up in `services/firebase.ts` with your project credentials.

## Setting Up Firebase Authentication

### 1. Enable Email/Password Authentication in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **risewith9-5efa2**
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Email/Password**
5. Enable **Email/Password** authentication
6. Click **Save**

### 2. Create a User Account

You need to create at least one user account to test the login:

**Option A: Using Firebase Console (Recommended)**
1. Go to **Authentication** → **Users** tab
2. Click **Add user**
3. Enter:
   - Email: `admin@risewith9.com` (or any email you prefer)
   - Password: Your secure password
4. Click **Add user**

**Option B: Using Firebase CLI or Code**
- You can also create users programmatically or use Firebase CLI

### 3. Login Credentials

After creating a user in Firebase, use those credentials to log in:
- **Email**: The email you created in Firebase
- **Password**: The password you set

## How It Works

### Authentication Flow

1. **App Loads**: Checks if user is already authenticated
2. **Login Page**: User enters email and password
3. **Firebase Authentication**: Credentials are verified with Firebase
4. **Success**: User is redirected to Builder Dashboard
5. **Logout**: User is signed out and redirected to landing page

### Files Structure

```
services/
├── firebase.ts          # Firebase configuration
├── authService.ts       # Authentication functions
└── mockStore.ts         # Mock data store

App.tsx                  # Main app with auth state management
components/
└── BuilderDashboard.tsx # Protected dashboard component
```

### Key Features

- ✅ Email/Password authentication
- ✅ Persistent login (stays logged in after refresh)
- ✅ Automatic redirect if already authenticated
- ✅ Error handling with user-friendly messages
- ✅ Loading states during authentication
- ✅ Secure logout functionality

## Testing

1. Create a user in Firebase Console
2. Run the app: `npm run dev`
3. Click "Login to Console"
4. Enter your Firebase credentials
5. You should be logged into the Builder Dashboard

## Security Notes

⚠️ **Important**: The Firebase API key in the code is safe to expose in client-side code. Firebase uses security rules to protect your data, not API key secrecy.

However, make sure to:
1. Set up proper Firebase Security Rules
2. Enable only necessary authentication methods
3. Use environment variables for production builds (optional)

## Troubleshooting

### "Login failed" error
- Verify Email/Password authentication is enabled in Firebase Console
- Check that the user account exists in Firebase Authentication
- Ensure credentials are correct

### User stays on login page
- Check browser console for errors
- Verify Firebase configuration is correct
- Ensure internet connection is stable

### Auto-logout after refresh
- Check browser console for Firebase errors
- Verify Firebase project is active
- Clear browser cache and try again
