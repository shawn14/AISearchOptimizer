# Firebase Setup Guide

## Quick Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `aisearchoptimizer` (or your choice)
4. Disable Google Analytics (optional for this project)
5. Click "Create project"

### 2. Enable Firestore Database

1. In your Firebase project, click "Firestore Database" in the left menu
2. Click "Create database"
3. Choose "Start in production mode"
4. Select a location (choose closest to your users)
5. Click "Enable"

### 3. Get Service Account Credentials

1. Go to Project Settings (gear icon) → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file securely
4. Add to `.env` file

### 4. Configure Environment Variables

Add these to your `.env` file:

```bash
# Option 1: Individual fields (easier for development)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# Option 2: Single JSON (better for production)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

**Important**: The private key must include the `\n` characters and be wrapped in quotes.

### 5. Set Firestore Security Rules (Optional for MVP)

In Firestore console, go to "Rules" tab and use:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads/writes for development
    // TODO: Add proper auth rules in production
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Warning**: These rules allow anyone to read/write. Add authentication before going to production!

### 6. Create Firestore Indexes (Required for Queries)

Run these commands in the Firestore console to create composite indexes:

1. Go to Firestore → Indexes → Composite
2. Click "Create Index"
3. Collection: `monitoring_runs`
   - Fields: `brand_id` (Ascending), `timestamp` (Descending)
   - Query scope: Collection
4. Click "Create Index"

You may also need:
- Collection: `prompts`
  - Fields: `brand_id` (Ascending), `is_active` (Ascending), `created_at` (Descending)

## Testing Connection

After setup, test the connection:

```bash
npm run dev
```

Navigate to http://localhost:3000/dashboard/brands

Try creating a brand. If successful, check Firebase console to see the data!

## Production Deployment (Vercel)

### Add Environment Variables

In Vercel dashboard:
1. Go to your project → Settings → Environment Variables
2. Add all Firebase variables
3. Use the `FIREBASE_SERVICE_ACCOUNT` JSON format for simplicity
4. Redeploy your app

### Security Checklist

Before going live:

- [ ] Update Firestore security rules with proper authentication
- [ ] Enable Firebase Authentication
- [ ] Add rate limiting per user
- [ ] Set up Firebase App Check (prevents abuse)
- [ ] Configure Firebase budget alerts
- [ ] Enable Firestore backups
- [ ] Add monitoring/logging

## Cost Estimates

Firebase Firestore pricing (Free tier):
- 50,000 reads/day
- 20,000 writes/day
- 20,000 deletes/day
- 1 GB storage

**Estimated usage for AISearchOptimizer**:
- 1 brand creation = 1 write
- 1 monitoring run = 1 write
- Loading dashboard = ~5-10 reads
- **~500-1000 monitoring runs per day within free tier**

Paid tier starts at $0.06 per 100K reads after free quota.

## Troubleshooting

### Error: "FIREBASE_PROJECT_ID is not defined"

Make sure `.env` file has all Firebase variables and restart dev server.

### Error: "Permission denied"

Check Firestore security rules - they might be too restrictive.

### Error: "Cannot parse private key"

Ensure private key has `\n` line breaks and is properly quoted in `.env`.

### Local Development

For local dev, you can use the Firebase Emulator Suite:

```bash
npm install -g firebase-tools
firebase login
firebase init emulators
firebase emulators:start
```

Update `.env`:
```
FIRESTORE_EMULATOR_HOST=localhost:8080
```

## Migration from JSON Files

The current implementation automatically falls back to JSON files if Firebase is not configured. To migrate:

1. Set up Firebase credentials
2. The app will automatically use Firebase
3. Old JSON files in `/data` folder are no longer used
4. You can manually import old data using the migration script (if needed)

## Next Steps

Once Firebase is set up:
- [ ] Add Firebase Authentication
- [ ] Implement user management
- [ ] Add proper security rules
- [ ] Set up automated backups
- [ ] Configure monitoring
