#!/bin/bash

# Firebase Setup Script for AISearchOptimizer
# Project ID: aiseachoptimizer

echo "🔥 Firebase Setup for AISearchOptimizer"
echo "========================================"
echo ""

PROJECT_ID="aiseachoptimizer"

echo "📋 Steps to complete:"
echo ""
echo "1. Go to Firebase Console:"
echo "   https://console.firebase.google.com/u/0/project/aiseachoptimizer/settings/serviceaccounts/adminsdk"
echo ""
echo "2. Click 'Generate new private key'"
echo ""
echo "3. Save the JSON file to this directory as 'firebase-service-account.json'"
echo ""
echo "4. Run this script again to update .env"
echo ""

# Check if service account file exists
if [ -f "firebase-service-account.json" ]; then
  echo "✅ Service account file found!"
  echo ""
  echo "Extracting credentials..."

  PROJECT_ID=$(node -p "require('./firebase-service-account.json').project_id")
  CLIENT_EMAIL=$(node -p "require('./firebase-service-account.json').client_email")
  PRIVATE_KEY=$(node -p "require('./firebase-service-account.json').private_key")

  echo "Project ID: $PROJECT_ID"
  echo "Client Email: $CLIENT_EMAIL"
  echo ""
  echo "Add these to your .env file:"
  echo ""
  echo "FIREBASE_PROJECT_ID=$PROJECT_ID"
  echo "FIREBASE_CLIENT_EMAIL=$CLIENT_EMAIL"
  echo "FIREBASE_PRIVATE_KEY=\"$PRIVATE_KEY\""
  echo ""
  echo "Or use the single JSON format:"
  echo ""
  echo "FIREBASE_SERVICE_ACCOUNT='$(cat firebase-service-account.json | tr -d '\n')'"
  echo ""
else
  echo "⚠️  Service account file not found."
  echo ""
  echo "Please follow steps 1-3 above, then run this script again."
  echo ""
fi

echo "Done! 🎉"
