/**
 * Test Google Maps API Key
 * This script tests if your API key is valid and properly configured
 * Run: node test-api-key.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('\n=== Google Maps API Key Diagnostic Test ===\n');

// Read .env file
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyLine = envContent.split('\n').find(line => line.startsWith('REACT_APP_GOOGLE_MAPS_API_KEY'));
if (!apiKeyLine) {
  console.error('❌ REACT_APP_GOOGLE_MAPS_API_KEY not found in .env');
  process.exit(1);
}

const apiKey = apiKeyLine.split('=')[1]?.trim();
if (!apiKey || apiKey === 'your-api-key-here') {
  console.error('❌ API key is not set or is a placeholder');
  process.exit(1);
}

console.log('🔑 Testing API Key:', apiKey.substring(0, 20) + '...\n');

// Test 1: Test Maps JavaScript API
console.log('Test 1: Testing Maps JavaScript API...');
testAPI('https://maps.googleapis.com/maps/api/js?key=' + apiKey + '&libraries=places', (error, status, body) => {
  if (error) {
    console.error('❌ Network error:', error.message);
    console.log('\n💡 Make sure you have internet connection\n');
    return;
  }

  if (status === 200 && body.includes('function')) {
    console.log('✅ Maps JavaScript API: Key is valid!\n');
  } else if (body.includes('InvalidKeyMapError') || body.includes('RefererNotAllowedMapError')) {
    console.error('❌ Maps JavaScript API: Key is invalid or restricted\n');
    console.error('Common issues:');
    console.error('  1. API key is incorrect');
    console.error('  2. API key restrictions block this request');
    console.error('  3. Maps JavaScript API is not enabled');
    console.error('  4. Billing is not enabled\n');
    console.log('💡 Solutions:');
    console.log('  1. Go to Google Cloud Console > APIs & Services > Credentials');
    console.log('  2. Check your API key');
    console.log('  3. Enable Maps JavaScript API');
    console.log('  4. Enable billing');
    console.log('  5. Add localhost to allowed referrers (for development)\n');
  } else if (body.includes('REQUEST_DENIED')) {
    console.error('❌ Maps JavaScript API: Request denied\n');
    console.error('This usually means:');
    console.error('  - API is not enabled');
    console.error('  - Billing is not enabled');
    console.error('  - API key restrictions are too strict\n');
  } else {
    console.error('❌ Maps JavaScript API: Unexpected response');
    console.error('Status:', status);
    console.error('Response:', body.substring(0, 200) + '...\n');
  }

  // Test 2: Test Geocoding API
  console.log('Test 2: Testing Geocoding API...');
  testAPI('https://maps.googleapis.com/maps/api/geocode/json?address=New+York&key=' + apiKey, (error, status, body) => {
    if (error) {
      console.error('❌ Network error:', error.message);
      return;
    }

    try {
      const data = JSON.parse(body);
      if (data.status === 'OK') {
        console.log('✅ Geocoding API: Key is valid!\n');
      } else if (data.status === 'REQUEST_DENIED') {
        console.error('❌ Geocoding API: Request denied');
        console.error('  Error:', data.error_message || 'Unknown error');
        console.error('  💡 Enable Geocoding API in Google Cloud Console\n');
      } else {
        console.error('❌ Geocoding API: Error -', data.status);
        console.error('  Error:', data.error_message || 'Unknown error\n');
      }
    } catch (e) {
      console.error('❌ Geocoding API: Invalid response\n');
    }

    // Summary
    console.log('=== Summary ===\n');
    console.log('If you see errors above, follow these steps:');
    console.log('1. Go to https://console.cloud.google.com/');
    console.log('2. Select your project');
    console.log('3. Go to APIs & Services > Library');
    console.log('4. Enable these APIs:');
    console.log('   - Maps JavaScript API');
    console.log('   - Places API');
    console.log('   - Geocoding API');
    console.log('   - Directions API');
    console.log('   - Distance Matrix API');
    console.log('5. Go to APIs & Services > Credentials');
    console.log('6. Click on your API key');
    console.log('7. Under "Application restrictions", add:');
    console.log('   http://localhost:3000/*');
    console.log('8. Under "API restrictions", select the APIs above');
    console.log('9. Enable billing if not already enabled');
    console.log('10. Restart your development server\n');
    console.log('📖 For detailed instructions, see:');
    console.log('   - QUICK_FIX_API_KEY.md');
    console.log('   - GOOGLE_MAPS_API_SETUP.md\n');
  });
});

function testAPI(url, callback) {
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      callback(null, res.statusCode, data);
    });
  }).on('error', (error) => {
    callback(error, null, null);
  });
}

