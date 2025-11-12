# Setup Guide

## Prerequisites

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MySQL** - [Download](https://dev.mysql.com/downloads/)
3. **Redis** - [Download](https://redis.io/download)
4. **Google Maps API Key** - [Get API Key](https://console.cloud.google.com/google/maps-apis)

## Step-by-Step Setup

### 1. Install Dependencies

**Option 1: Install all at once (from root)**

```bash
npm run install:all
```

**Option 2: Install separately**

```bash
# Install root dependencies (optional, for convenience scripts)
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Database Setup

1. Create a MySQL database:

```sql
CREATE DATABASE traffic_detector;
```

2. Update `.env` file with your database connection:

```env
DATABASE_URL="mysql://username:password@localhost:3306/traffic_detector"
```

3. Generate Prisma client and run migrations:

```bash
# Navigate to backend directory
cd backend

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Or use npx directly
npx prisma generate
npx prisma migrate dev --name init

cd ..
```

### 3. Redis Setup

1. Start Redis server:

```bash
# On Windows (if installed via installer)
redis-server

# On Linux/Mac
redis-server
```

2. Update `.env` file:

```env
REDIS_URL=redis://localhost:6379
```

### 4. Google Maps API Setup

**⚠️ IMPORTANT: See [GOOGLE_MAPS_API_SETUP.md](./GOOGLE_MAPS_API_SETUP.md) for detailed step-by-step instructions.**

Quick steps:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable billing (Google provides $200 free credit per month)
4. Enable the following APIs:
   - ✅ Maps JavaScript API (Required)
   - ✅ Places API (Required for autocomplete)
   - ✅ Geocoding API (Required)
   - ✅ Directions API (Required)
   - ✅ Distance Matrix API (Required)
5. Create an API key
6. Configure API key restrictions (add `http://localhost:3000/*` for development)
7. Update environment variables:

**Frontend `.env` (create `frontend/.env`):**

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your-api-key-here
```

**Backend `.env`:**

```env
GOOGLE_MAPS_API_KEY=your-api-key-here
```

### 5. JWT Secret

Generate a secure JWT secret and add to `.env`:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### 6. Complete `.env` Files

**Backend** - Create `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

Then edit `backend/.env` with your configuration:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/traffic_detector"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Server
PORT=5000
NODE_ENV=development
```

**Frontend** - Create `frontend/.env`:

```bash
cp frontend/.env.example frontend/.env
```

Then edit `frontend/.env` with your configuration:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
REACT_APP_API_URL=http://localhost:5000/api
```

### 7. Start the Application

**Option 1: Start both together (from root)**

```bash
npm run dev
```

**Option 2: Start separately**

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm start
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Testing the Application

### 1. Create Test Users

1. Register as a **Traffic Police** user
2. Register as a **Daily User** user
3. Register as a **Normal User** user

### 2. Police User Flow

1. Login as Police user
2. Create a region (e.g., "Chennai Central to Guindy")
3. View dashboard with map
4. Wait for traffic alerts (cron runs every 2 minutes)

### 3. Daily User Flow

1. Login as Daily User
2. Add a daily route with alert time window
3. Receive notifications during alert window if traffic detected

### 4. Normal User Flow

1. Login as Normal User
2. Use Route Finder to search routes
3. View traffic information and alternate routes
4. Save routes for later

## Troubleshooting

### Database Connection Issues

- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists

### Redis Connection Issues

- Verify Redis is running: `redis-cli ping` (should return PONG)
- Check Redis URL in `.env`

### Google Maps API Issues

- Verify API key is correct
- Check API quotas in Google Cloud Console
- Ensure required APIs are enabled

### Port Already in Use

- Change `PORT` in `.env` for backend
- Change port in `frontend/package.json` scripts for frontend

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use strong JWT secret
3. Configure CORS properly
4. Set up HTTPS
5. Use environment-specific database
6. Configure Redis for production
7. Build frontend: `cd frontend && npm run build`
8. Serve frontend build with a web server (nginx, Apache, etc.)
