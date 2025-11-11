# Smart Traffic Detection System - Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Redis (v6 or higher)
- Google Maps API Key
- React Native development environment (for mobile app)

## Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Copy `.env.example` to `.env` and fill in the values:
```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_REFRESH_SECRET`: Secret key for refresh tokens
- `GOOGLE_MAPS_API_KEY`: Your Google Maps API key
- `REDIS_HOST`: Redis host (default: localhost)
- `REDIS_PORT`: Redis port (default: 6379)

### 4. Set up database
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### 5. Start the server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000` by default.

## Frontend Web Setup

### 1. Navigate to frontend-web directory
```bash
cd frontend-web
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the `frontend-web` directory:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 4. Start the development server
```bash
npm start
```

The app will run on `http://localhost:3000` by default.

## Frontend Mobile Setup

### 1. Navigate to frontend-mobile directory
```bash
cd frontend-mobile
```

### 2. Install dependencies
```bash
npm install
```

### 3. Install iOS dependencies (macOS only)
```bash
cd ios && pod install && cd ..
```

### 4. Set up environment variables
Create a `.env` file in the `frontend-mobile` directory:
```
API_URL=http://localhost:5000/api
SOCKET_URL=http://localhost:5000
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

**Note:** For Android, you may need to use your machine's IP address instead of `localhost`.

### 5. Run the app
```bash
# iOS
npm run ios

# Android
npm run android
```

## Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API (for web)
   - Maps SDK for Android (for Android app)
   - Maps SDK for iOS (for iOS app)
   - Directions API
   - Distance Matrix API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domains/apps for security
6. Add the API key to your environment variables

## Database Schema

The system uses Prisma ORM with PostgreSQL. The main models are:

- **User**: User accounts with roles (TRAFFIC_POLICE, DAILY_USER, NORMAL_USER, ADMIN)
- **PoliceRegion**: Assigned regions for traffic police
- **DailyRoute**: Saved routes for daily users
- **TrafficAlert**: Traffic congestion alerts
- **Notification**: User notifications
- **RefreshToken**: JWT refresh tokens

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/profile` - Get current user profile

### Traffic
- `POST /api/traffic/detect` - Detect traffic congestion
- `GET /api/traffic/data` - Get traffic data by coordinates
- `POST /api/traffic/directions` - Get directions with traffic

### Routes (Daily Users)
- `POST /api/routes` - Create daily route
- `GET /api/routes` - Get user routes
- `GET /api/routes/:id` - Get route by ID
- `PUT /api/routes/:id` - Update route
- `DELETE /api/routes/:id` - Delete route
- `POST /api/routes/:id/check-traffic` - Check traffic for route

### Police
- `GET /api/police/region` - Get police region
- `GET /api/police/alerts` - Get alerts for region
- `PUT /api/police/alerts/:id/status` - Update alert status
- `GET /api/police/stats` - Get alert statistics

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## Socket.io Events

### Client → Server
- Connection with JWT token in auth

### Server → Client
- `traffic_alert` - New traffic alert notification
- `alert_updated` - Alert status updated

## User Roles

1. **TRAFFIC_POLICE**: Can view and manage traffic alerts in their assigned region
2. **DAILY_USER**: Can save daily routes and receive automatic traffic notifications
3. **NORMAL_USER**: Can explore routes and view traffic conditions
4. **ADMIN**: System administrator (optional)

## Features

- ✅ Real-time traffic detection using Google Maps API
- ✅ Automatic police alerts for congestion > 1km
- ✅ Daily route monitoring with automatic notifications
- ✅ Real-time updates via Socket.io
- ✅ Role-based access control
- ✅ JWT authentication with refresh tokens
- ✅ Redis caching for performance
- ✅ Traffic visualization on maps
- ✅ Police dashboard with alert management

## Troubleshooting

### Backend Issues
- Ensure PostgreSQL and Redis are running
- Check database connection string in `.env`
- Verify JWT secrets are set
- Check logs in `backend/logs/` directory

### Frontend Web Issues
- Clear browser cache
- Check CORS settings in backend
- Verify API URL in `.env`
- Check browser console for errors

### Frontend Mobile Issues
- For Android, use your machine's IP instead of `localhost`
- Ensure Google Maps API key has correct restrictions
- Check React Native version compatibility
- Clear Metro bundler cache: `npm start -- --reset-cache`

## Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Use strong JWT secrets
3. Enable HTTPS
4. Set up proper CORS origins
5. Configure Redis for production
6. Set up database backups
7. Use environment-specific Google Maps API keys
8. Enable rate limiting
9. Set up monitoring and logging
10. Configure reverse proxy (nginx) if needed

## Support

For issues or questions, please check the logs and error messages first. Most common issues are related to:
- Missing environment variables
- Database connection issues
- Google Maps API key problems
- CORS configuration

