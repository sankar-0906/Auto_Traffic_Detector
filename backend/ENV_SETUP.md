# Environment Variables Setup

## Backend .env File

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/traffic_detector"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379
# OR for Upstash Redis:
# REDIS_URL=rediss://default:password@host:6379

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Server
PORT=5000
NODE_ENV=development
```

## Important Notes

### Redis URL Format

The `REDIS_URL` should **NOT** include the variable name. Use one of these formats:

✅ **Correct:**
```env
REDIS_URL=redis://localhost:6379
REDIS_URL=rediss://default:password@host:6379
```

❌ **Incorrect:**
```env
REDIS_URL=REDIS_URL=redis://localhost:6379
REDIS_URL="redis://localhost:6379"
```

### For Upstash Redis

If you're using Upstash Redis, the URL format should be:
```env
REDIS_URL=rediss://default:YOUR_PASSWORD@YOUR_HOST.upstash.io:6379
```

Make sure to:
1. Remove any quotes around the URL
2. Do not include the variable name in the value
3. Use the full URL provided by Upstash

### Troubleshooting

If you see an error like `Invalid URL` or `REDIS_URL=rediss://...`, check:

1. **No quotes**: Remove any quotes around the URL value
2. **No variable name**: Make sure the value doesn't include `REDIS_URL=`
3. **Correct format**: URL should start with `redis://` or `rediss://`
4. **File location**: Make sure the `.env` file is in the `backend/` directory
5. **File encoding**: Ensure the file is saved as UTF-8 without BOM

### Testing Redis Connection

You can test your Redis connection by running:
```bash
cd backend
node -e "require('dotenv').config(); const redis = require('redis'); const client = redis.createClient({ url: process.env.REDIS_URL }); client.connect().then(() => { console.log('✅ Redis connected!'); client.quit(); }).catch(err => console.error('❌ Error:', err.message));"
```

