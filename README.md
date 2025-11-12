# Smart Traffic Detection & Alert System

A comprehensive web application for real-time traffic detection and alerting using Google Maps APIs.

## ⚠️ Google Maps API Key Setup Required

**If you're seeing `InvalidKeyMapError`, see [QUICK_FIX_API_KEY.md](./QUICK_FIX_API_KEY.md) for immediate steps to fix it.**

### Quick Fix (3 Steps):

1. **Create `frontend/.env` file:**
   ```env
   REACT_APP_GOOGLE_MAPS_API_KEY=your-actual-api-key-here
   ```

2. **Get API key from [Google Cloud Console](https://console.cloud.google.com/):**
   - Enable billing
   - Enable these APIs: Maps JavaScript API, Places API, Geocoding API, Directions API, Distance Matrix API
   - Create API key
   - Add `http://localhost:3000/*` to allowed referrers

3. **Restart development server** (⚠️ MUST restart after creating .env)

### Verify Setup:
```bash
cd frontend
node verify-env.js
```

**Detailed instructions:** See [GOOGLE_MAPS_API_SETUP.md](./GOOGLE_MAPS_API_SETUP.md)

## Features

- **Traffic Police Module**: Region management, real-time traffic alerts, and alert resolution
- **Daily User Module**: Personalized route monitoring with scheduled alerts
- **Normal User Module**: Route finder with live traffic overlay and alternate route suggestions

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MySQL with Prisma ORM
- **Caching**: Redis
- **Frontend**: React.js + TailwindCSS
- **Maps**: Google Maps JavaScript API + Roads API + Traffic Layer API

## Prerequisites

- Node.js (v14 or higher)
- MySQL database
- Redis server
- Google Maps API key

## Installation

1. Clone the repository

2. Install dependencies:

   **Option 1: Install all at once (from root)**
   ```bash
   npm run install:all
   ```

   **Option 2: Install separately**
   ```bash
   # Backend
   cd backend && npm install && cd ..
   
   # Frontend
   cd frontend && npm install && cd ..
   ```

3. Set up the database:
   ```bash
   cd backend
   npm run prisma:generate
   npm run prisma:migrate
   cd ..
   ```

4. Set up environment variables:

   **Backend** - Create `backend/.env`:
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/traffic_detector"
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   REDIS_URL=redis://localhost:6379
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   PORT=5000
   NODE_ENV=development
   ```

   **Frontend** - Create `frontend/.env`:
   ```env
   REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   REACT_APP_API_URL=http://localhost:5000/api
   ```

5. Start Redis server (if not running):
   ```bash
   redis-server
   ```

6. Start the application:

   **Option 1: Start both together (from root)**
   ```bash
   npm run dev
   ```

   **Option 2: Start separately**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Police Routes
- `POST /api/police/region` - Create/update police region
- `GET /api/police/region` - Get police region
- `GET /api/police/dashboard` - Get police dashboard

### User Routes
- `POST /api/user/route` - Create route
- `GET /api/user/routes` - Get user routes
- `DELETE /api/user/route/:routeId` - Delete route
- `GET /api/user/dashboard` - Get user dashboard

### Traffic Routes
- `POST /api/traffic/check` - Check traffic for a route
- `POST /api/traffic/alternate-routes` - Get alternate routes

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:notificationId/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/alerts` - Get alerts (for police)
- `PATCH /api/notifications/alerts/:alertId/resolve` - Resolve alert

## Database Schema

- `users`: User accounts with roles (ADMIN, POLICE, USER, DAILY_USER)
- `regions`: Police region boundaries
- `alerts`: Traffic congestion alerts
- `routes`: User saved routes
- `notifications`: User notifications

## Project Structure

```
├── backend/          # Backend API (Node.js + Express)
│   ├── prisma/      # Prisma schema and migrations
│   ├── routes/      # API routes
│   ├── controllers/ # Request handlers
│   ├── services/    # Business logic
│   └── ...
├── frontend/        # Frontend app (React.js)
│   ├── src/        # Source code
│   └── ...
└── package.json     # Root workspace (optional)
```

For detailed setup instructions, see [SETUP.md](SETUP.md)

For project structure details, see [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

## License

ISC
