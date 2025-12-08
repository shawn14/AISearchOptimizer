const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Service account details from the conversation
const SERVICE_ACCOUNT_EMAIL = 'ga-data-reader@stockalarm-8b019.iam.gserviceaccount.com';
const PROPERTY_ID = '147692282';

async function testGAPermissions() {
  try {
    console.log('Testing GA Property Access for:');
    console.log('Service Account:', SERVICE_ACCOUNT_EMAIL);
    console.log('Property ID:', PROPERTY_ID);
    console.log('');

    // We need to use the service account credentials
    // The user should have them saved in Firebase
    console.log('⚠️  Note: This test requires the service account JSON key file');
    console.log('');

    // Check if we can find a service account key in StockAlarm project
    const stockAlarmPath = '/Users/shawncarpenter/StockAlarm';
    const possibleKeyPaths = [
      path.join(stockAlarmPath, 'ga-service-account.json'),
      path.join(stockAlarmPath, 'service-account.json'),
      path.join(stockAlarmPath, 'ga-data-reader.json'),
    ];

    let keyPath = null;
    for (const p of possibleKeyPaths) {
      if (fs.existsSync(p)) {
        keyPath = p;
        break;
      }
    }

    if (!keyPath) {
      console.log('❌ Could not find service account key file');
      console.log('');
      console.log('To test permissions, the user needs to:');
      console.log('1. Download the service account JSON key from Google Cloud');
      console.log('2. Try connecting via the Settings page');
      console.log('');
      console.log('The actual issue is likely:');
      console.log('🔍 The service account was added to Google Cloud IAM (wrong place)');
      console.log('✅ It needs to be added to Google Analytics → Admin → Property Access Management');
      console.log('');
      console.log('Steps to fix:');
      console.log('1. Go to https://analytics.google.com/analytics/web/#/a/admin');
      console.log('2. Select the property (ID: 147692282)');
      console.log('3. Click "Property Access Management"');
      console.log('4. Click the "+" button in the top right');
      console.log('5. Add email: ga-data-reader@stockalarm-8b019.iam.gserviceaccount.com');
      console.log('6. Grant "Viewer" role');
      console.log('7. Click "Add"');
      return;
    }

    console.log('✅ Found service account key:', keyPath);

    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const analyticsAdmin = google.analyticsadmin({
      version: 'v1beta',
      auth,
    });

    // Try to list account summaries
    console.log('Testing API access...');
    const response = await analyticsAdmin.accountSummaries.list();
    console.log('✅ API access successful!');
    console.log('Accounts found:', response.data.accountSummaries?.length || 0);

  } catch (error) {
    console.error('❌ Error:', error.message);

    if (error.message.includes('PERMISSION_DENIED') || error.message.includes('403')) {
      console.log('');
      console.log('🔍 PERMISSION DENIED - Service account does NOT have GA access');
      console.log('');
      console.log('This confirms the service account needs to be added in:');
      console.log('Google Analytics → Admin → Property Access Management');
      console.log('');
      console.log('NOT in Google Cloud IAM (that only controls Cloud resources, not GA data)');
    }
  }
}

testGAPermissions();
