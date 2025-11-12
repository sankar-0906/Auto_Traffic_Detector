/**
 * Verify environment variables are set correctly
 * Run: node verify-env.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n=== Environment Variables Verification ===\n');

const envPath = path.join(__dirname, '.env');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file NOT found in frontend directory');
  console.error('\n📝 To fix this:');
  console.error('1. Create a file named .env in the frontend directory');
  console.error('2. Add this line:');
  console.error('   REACT_APP_GOOGLE_MAPS_API_KEY=your-api-key-here');
  console.error('3. Replace "your-api-key-here" with your actual API key');
  console.error('4. Restart the development server\n');
  console.error('💡 You can copy .env.example to .env as a template:');
  console.error('   cp .env.example .env\n');
  process.exit(1);
}

console.log('✅ .env file exists');

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

// Check for API key
const apiKeyLine = lines.find(line => line.startsWith('REACT_APP_GOOGLE_MAPS_API_KEY'));
if (!apiKeyLine) {
  console.error('❌ REACT_APP_GOOGLE_MAPS_API_KEY not found in .env file');
  console.error('\n📝 Add this line to your .env file:');
  console.error('   REACT_APP_GOOGLE_MAPS_API_KEY=your-api-key-here\n');
  process.exit(1);
}

// Extract API key value
const apiKey = apiKeyLine.split('=')[1]?.trim();

if (!apiKey || apiKey === '' || apiKey === 'your-api-key-here') {
  console.error('❌ REACT_APP_GOOGLE_MAPS_API_KEY is not set or is a placeholder');
  console.error('\n📝 Update your .env file with your actual API key:');
  console.error('   REACT_APP_GOOGLE_MAPS_API_KEY=your-actual-api-key\n');
  process.exit(1);
}

console.log('✅ REACT_APP_GOOGLE_MAPS_API_KEY is set');
console.log('🔑 API Key (first 20 chars):', apiKey.substring(0, 20) + '...');
console.log('📏 Key length:', apiKey.length, 'characters');

if (apiKey.length < 30) {
  console.warn('⚠️  Warning: API key seems too short');
}

if (apiKey.includes(' ') || apiKey.includes('"') || apiKey.includes("'")) {
  console.warn('⚠️  Warning: API key may contain invalid characters (spaces or quotes)');
  console.warn('   Make sure there are no quotes around the API key in .env file');
}

console.log('\n✅ Environment variables look good!');
console.log('\n💡 Next steps:');
console.log('   1. Make sure the development server is RESTARTED after setting .env');
console.log('   2. Verify the API key is correct in Google Cloud Console');
console.log('   3. Check that all required APIs are enabled');
console.log('   4. Ensure billing is enabled');
console.log('   5. Verify API key restrictions allow localhost:3000\n');

console.log('📖 For detailed setup instructions, see:');
console.log('   - QUICK_FIX_API_KEY.md');
console.log('   - GOOGLE_MAPS_API_SETUP.md\n');

