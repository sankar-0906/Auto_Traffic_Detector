# Backend Troubleshooting Guide

## Common Issues and Solutions

### 1. Missing .env File

**Error:** `Cannot find module` or environment variable errors

**Solution:**
1. Run the setup script:
   ```bash
   node setup-env.js
   ```

2. Or manually create `.env` file in the `backend` directory with:
   ```
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="postgresql://user:password@localhost:5432/traffic_detection?schema=public"
   REDIS_HOST=localhost
   REDIS_PORT=6379
   JWT_SECRET=your-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret-key
   GOOGLE_MAPS_API_KEY=your-api-key
   CORS_ORIGIN=http://localhost:3000
   ```

### 2. Database Connection Error

**Error:** `Can't reach database server` or Prisma connection errors

**Solution:**
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in `.env` file
3. Create the database:
   ```sql
   CREATE DATABASE traffic_detection;
   ```
4. Run Prisma migrations:
   ```bash
   npm run prisma:migrate
   ```

### 3. Redis Connection Error

**Error:** `Redis Client Error` or connection refused

**Solution:**
1. Ensure Redis is running:
   ```bash
   redis-server
   ```
2. Or disable Redis temporarily by commenting out Redis usage in code
3. Check REDIS_HOST and REDIS_PORT in `.env`

### 4. Prisma Client Not Generated

**Error:** `@prisma/client did not initialize yet`

**Solution:**
```bash
npm run prisma:generate
```

### 5. Missing Dependencies

**Error:** `Cannot find module 'xxx'`

**Solution:**
```bash
npm install
```

### 6. Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
1. Change PORT in `.env` file
2. Or kill the process using port 5000:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

### 7. JWT Secret Missing

**Error:** `JWT_SECRET is not defined`

**Solution:**
Add JWT_SECRET and JWT_REFRESH_SECRET to `.env` file

### 8. Google Maps API Error

**Error:** `Google Maps API error` or `INVALID_REQUEST`

**Solution:**
1. Ensure GOOGLE_MAPS_API_KEY is set in `.env`
2. Verify API key is valid and has required APIs enabled:
   - Maps JavaScript API
   - Directions API
   - Distance Matrix API
   - Geocoding API

### 9. Socket.io Connection Issues

**Error:** `Socket connection error` or authentication errors

**Solution:**
1. Check CORS_ORIGIN in `.env` matches frontend URL
2. Ensure JWT_SECRET is set
3. Check Socket.io authentication middleware

### 10. Logs Directory Error

**Error:** `ENOENT: no such file or directory` for logs

**Solution:**
The logger now automatically creates the logs directory. If it still fails:
```bash
mkdir logs
```

## Quick Fix Checklist

1. ✅ Create `.env` file (run `node setup-env.js`)
2. ✅ Install dependencies (`npm install`)
3. ✅ Generate Prisma client (`npm run prisma:generate`)
4. ✅ Run database migrations (`npm run prisma:migrate`)
5. ✅ Start PostgreSQL
6. ✅ Start Redis (optional but recommended)
7. ✅ Set GOOGLE_MAPS_API_KEY in `.env`
8. ✅ Set JWT secrets in `.env`
9. ✅ Check DATABASE_URL in `.env`
10. ✅ Start server (`npm run dev`)

## Testing the Backend

1. Check health endpoint:
   ```bash
   curl http://localhost:5000/health
   ```

2. Test registration:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test1234","name":"Test User"}'
   ```

## Still Having Issues?

1. Check the logs in `backend/logs/` directory
2. Check console output for detailed error messages
3. Verify all environment variables are set correctly
4. Ensure all services (PostgreSQL, Redis) are running
5. Check network connectivity

