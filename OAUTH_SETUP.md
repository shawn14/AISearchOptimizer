# Google Analytics OAuth Setup Guide

## Step 1: Create OAuth Credentials

1. Go to https://console.cloud.google.com/apis/credentials?project=stockalarm-8b019
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. If prompted to configure consent screen:
   - Click **"CONFIGURE CONSENT SCREEN"**
   - Select **"External"** → Click **"CREATE"**
   - Fill in:
     - App name: `RevIntel`
     - User support email: Your email
     - Developer contact: Your email
   - Click **"SAVE AND CONTINUE"**
   - On Scopes page, click **"ADD OR REMOVE SCOPES"**
   - Search for and add:
     - `https://www.googleapis.com/auth/analytics.readonly`
   - Click **"UPDATE"** → **"SAVE AND CONTINUE"**
   - Click **"BACK TO DASHBOARD"**

4. Go back to Credentials page: https://console.cloud.google.com/apis/credentials?project=stockalarm-8b019
5. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
6. Application type: **"Web application"**
7. Name: `RevIntel Web Client`
8. Authorized redirect URIs - Add these:
   - `http://localhost:3001/api/auth/google/callback`
   - `http://localhost:3002/api/auth/google/callback`
   - `https://yourdomain.com/api/auth/google/callback` (add your production URL later)
9. Click **"CREATE"**
10. Copy the **Client ID** and **Client Secret**

## Step 2: Add to Environment Variables

Add these to your `.env.local` file:

```bash
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

## Step 3: Test the OAuth Flow

Once credentials are set up, you'll be able to click "Connect Google Analytics" and sign in with Google!
