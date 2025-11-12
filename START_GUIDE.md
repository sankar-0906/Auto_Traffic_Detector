# Quick Start Guide

## Prerequisites Checklist

Before starting the application, ensure you have:

- ✅ Node.js installed (v14 or higher)
- ✅ MySQL database running and accessible
- ✅ Redis server running (optional but recommended)
- ✅ Google Maps API key
- ✅ Environment variables configured

## Starting the Application

### Option 1: Start Both Together (Recommended)

From the **root directory**:

```bash
# 1. Install all dependencies (first time only)
npm run install:all

# 2. Start both backend and frontend
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend app on `http://localhost:3000`

### Option 2: Start Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm install  # First time only
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install  # First time only
npm start
```

## Troubleshooting

### Backend Not Starting

**Error: Cannot connect to database**
- Check MySQL is running: `mysql -u root -p`
- Verify `DATABASE_URL` in `backend/.env`
- Run migrations: `cd backend && npm run prisma:migrate`

**Error: Redis connection failed**
- Check Redis is running: `redis-cli ping` (should return PONG)
- Verify `REDIS_URL` in `backend/.env`
- Server will continue without Redis (some features limited)

**Error: Port 5000 already in use**
- Change `PORT` in `backend/.env` to a different port (e.g., 5001)
- Update `frontend/.env` `REACT_APP_API_URL` to match

### Frontend Proxy Errors

**Error: `ECONNREFUSED` or `Proxy error`**
- ✅ **Solution**: Make sure the backend server is running first!
- Start backend: `cd backend && npm run dev`
- Wait for: `🚀 Server running on port 5000`
- Then start frontend: `cd frontend && npm start`

**Error: Cannot connect to backend**
- Check backend is running on correct port
- Verify `REACT_APP_API_URL` in `frontend/.env`
- Check proxy setting in `frontend/package.json`

### Common Issues

**Database Migration Errors**
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

**Missing Environment Variables**
- Backend: Create `backend/.env` (see `backend/ENV_SETUP.md`)
- Frontend: Create `frontend/.env` with `REACT_APP_GOOGLE_MAPS_API_KEY`

**Port Conflicts**
- Backend: Change `PORT` in `backend/.env`
- Frontend: Set `PORT=3001` in `frontend/.env` or use `set PORT=3001 && npm start` (Windows)

## Verification

### Check Backend is Running

Visit: `http://localhost:5000/api/health`

Should return:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

### Check Frontend is Running

Visit: `http://localhost:3000`

Should show the login page.

## Development Workflow

1. **Start Backend First**
   ```bash
   cd backend
   npm run dev
   ```

2. **Wait for Backend to Start**
   Look for: `🚀 Server running on port 5000`

3. **Start Frontend**
   ```bash
   cd frontend
   npm start
   ```

4. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## Environment Setup

### Backend Environment (`backend/.env`)
```env
DATABASE_URL="mysql://user:password@localhost:3306/traffic_detector"
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
GOOGLE_MAPS_API_KEY=your-api-key
PORT=5000
NODE_ENV=development
```

### Frontend Environment (`frontend/.env`)
```env
REACT_APP_GOOGLE_MAPS_API_KEY=your-api-key
REACT_APP_API_URL=http://localhost:5000/api
```

## Need Help?

1. Check `SETUP.md` for detailed setup instructions
2. Check `backend/ENV_SETUP.md` for environment variable setup
3. Check `backend/README.md` for backend-specific issues
4. Check `frontend/README.md` for frontend-specific issues

