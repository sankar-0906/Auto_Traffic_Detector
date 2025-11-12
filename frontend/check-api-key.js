/**
 * Quick script to check if Google Maps API key is set
 * Run this with: node check-api-key.js
 */

require('dotenv').config({ path: '.env' });

const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

console.log('\n=== Google Maps API Key Check ===\n');

if (!apiKey) {
  console.error('❌ REACT_APP_GOOGLE_MAPS_API_KEY is NOT set');
  console.error('\n📝 To fix this:');
  console.error('1. Create or edit frontend/.env file');
  console.error('2. Add this line:');
  console.error('   REACT_APP_GOOGLE_MAPS_API_KEY=your-api-key-here');
  console.error('3. Replace "your-api-key-here" with your actual API key');
  console.error('4. Restart the development server\n');
  process.exit(1);
} else {
  console.log('✅ REACT_APP_GOOGLE_MAPS_API_KEY is set');
  console.log('🔑 API Key (first 20 chars):', apiKey.substring(0, 20) + '...');
  console.log('📏 Key length:', apiKey.length, 'characters');
  
  if (apiKey.length < 30) {
    console.warn('⚠️  Warning: API key seems too short. Make sure it\'s the full key.');
  }
  
  if (apiKey.includes('your-api-key') || apiKey.includes('YOUR_API_KEY')) {
    console.error('❌ Error: API key appears to be a placeholder');
    console.error('   Please replace it with your actual Google Maps API key');
    process.exit(1);
  }
  
  console.log('\n✅ API key looks valid!');
  console.log('💡 If you still see errors, check:');
  console.log('   1. API key is correct in Google Cloud Console');
  console.log('   2. Required APIs are enabled (Maps JavaScript API, Places API, etc.)');
  console.log('   3. Billing is enabled');
  console.log('   4. API key restrictions allow localhost:3000');
  console.log('   5. Development server was restarted after setting .env\n');
}

