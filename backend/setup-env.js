/**
 * Setup script to create .env file from .env.example
 * Run: node setup-env.js
 */

const fs = require('fs');
const path = require('path');

const envExamplePath = path.join(__dirname, '.env.example');
const envPath = path.join(__dirname, '.env');

// Check if .env.example exists
if (!fs.existsSync(envExamplePath)) {
  console.log('Creating .env file with default values...');
  
  const defaultEnv = `# Server Configuration
PORT=5000
NODE_ENV=development

# Database (MySQL)
DATABASE_URL="mysql://user:password@localhost:3306/traffic_detection"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-${Date.now()}
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-${Date.now()}
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# CORS
CORS_ORIGIN=http://localhost:3000

# Traffic Monitor
ENABLE_TRAFFIC_MONITOR=true
`;

  fs.writeFileSync(envPath, defaultEnv);
  console.log('✅ .env file created successfully!');
  console.log('⚠️  Please update the following values:');
  console.log('   - DATABASE_URL: Your MySQL connection string (format: mysql://user:password@host:3306/database)');
  console.log('   - GOOGLE_MAPS_API_KEY: Your Google Maps API key');
  console.log('   - JWT_SECRET and JWT_REFRESH_SECRET: Change to secure random strings');
} else {
  // Copy from .env.example
  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  fs.writeFileSync(envPath, envExample);
  console.log('✅ .env file created from .env.example');
  console.log('⚠️  Please update the values in .env file');
}

