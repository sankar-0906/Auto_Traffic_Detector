# Smart Traffic Detection System - Architecture

## System Overview

The Smart Traffic Detection System is a full-stack application that detects traffic congestion using Google Maps API and automatically alerts nearby traffic police when congestion exceeds 1km.

## Architecture Pattern

The system follows **MVC (Model-View-Controller)** pattern with a clean, modular architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  React.js    │  │ React Native │  │   Socket.io  │  │
│  │   (Web)      │  │   (Mobile)   │  │   Client     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/REST + WebSocket
                          │
┌─────────────────────────────────────────────────────────┐
│                    Backend Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Express    │  │   Socket.io   │  │   Services    │  │
│  │   Server     │  │   Server     │  │   Layer       │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Controllers  │  │  Middleware  │  │   Routes      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│  PostgreSQL  │  │    Redis     │  │ Google Maps  │
│   (Prisma)   │  │   (Cache)    │  │     API      │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Backend Architecture

### Directory Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # Prisma client
│   │   ├── redis.js     # Redis client
│   │   └── logger.js    # Winston logger
│   ├── controllers/     # Request handlers (C)
│   │   ├── authController.js
│   │   ├── trafficController.js
│   │   ├── routeController.js
│   │   ├── policeController.js
│   │   └── notificationController.js
│   ├── services/        # Business logic
│   │   ├── googleMapsService.js
│   │   └── trafficDetectionService.js
│   ├── middleware/      # Express middleware
│   │   ├── auth.js      # JWT authentication
│   │   └── errorHandler.js
│   ├── routes/          # API routes
│   │   ├── authRoutes.js
│   │   ├── trafficRoutes.js
│   │   ├── routeRoutes.js
│   │   ├── policeRoutes.js
│   │   └── notificationRoutes.js
│   ├── utils/           # Utility functions
│   │   ├── jwt.js
│   │   └── validators.js
│   ├── jobs/            # Background jobs
│   │   └── trafficMonitor.js
│   └── server.js        # Entry point
├── prisma/
│   └── schema.prisma    # Database schema
└── package.json
```

### Key Components

#### 1. Authentication & Authorization
- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** (RBAC)
- **Token refresh mechanism** for seamless user experience
- **Password hashing** using bcrypt

#### 2. Traffic Detection Service
- **Google Maps API integration** for directions and traffic data
- **Congestion analysis** algorithm
- **Automatic alert generation** when congestion > 1km
- **Police region assignment** based on proximity
- **Redis caching** for performance

#### 3. Real-time Communication
- **Socket.io** for real-time updates
- **User-specific rooms** for targeted notifications
- **Event-driven architecture** for alerts

#### 4. Data Layer
- **Prisma ORM** for database operations
- **PostgreSQL** for persistent storage
- **Redis** for caching and session management

## Frontend Architecture

### Web Application (React.js)

```
frontend-web/
├── src/
│   ├── components/      # Reusable components
│   │   ├── Auth/        # Login/Register
│   │   ├── Map/         # Google Maps integration
│   │   ├── Dashboard/   # User dashboard
│   │   └── Police/      # Police dashboard
│   ├── store/           # Redux store
│   │   ├── authSlice.js
│   │   └── store.js
│   ├── config/          # Configuration
│   │   ├── api.js       # Axios instance
│   │   └── socket.js    # Socket.io client
│   └── App.js           # Main component
└── package.json
```

### Mobile Application (React Native)

```
frontend-mobile/
├── src/
│   ├── screens/         # Screen components
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── DashboardScreen.js
│   │   └── PoliceDashboardScreen.js
│   ├── store/           # Redux store
│   │   ├── authSlice.js
│   │   └── store.js
│   ├── config/          # Configuration
│   │   ├── api.js       # Axios instance
│   │   └── socket.js    # Socket.io client
│   └── App.js           # Main component
└── package.json
```

## Data Flow

### Traffic Detection Flow

```
1. User requests route/directions
   ↓
2. Frontend calls /api/traffic/directions
   ↓
3. Backend calls Google Maps API
   ↓
4. Traffic Detection Service analyzes congestion
   ↓
5. If congestion > 1km:
   ├─ Create TrafficAlert in database
   ├─ Find nearest PoliceRegion
   ├─ Create Notification for police
   └─ Emit Socket.io event to police user
   ↓
6. Police receives real-time alert
   ↓
7. Police can acknowledge/resolve alert
```

### Authentication Flow

```
1. User submits credentials
   ↓
2. Backend validates and hashes password
   ↓
3. Generate JWT access & refresh tokens
   ↓
4. Store refresh token in database
   ↓
5. Return tokens to frontend
   ↓
6. Frontend stores tokens (localStorage/AsyncStorage)
   ↓
7. Include access token in API requests
   ↓
8. If token expires, use refresh token to get new access token
```

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Password Hashing**: bcrypt with salt rounds
3. **Role-Based Access Control**: Different permissions per role
4. **Input Validation**: express-validator for request validation
5. **Error Handling**: Centralized error handling middleware
6. **CORS Configuration**: Restricted origins
7. **Rate Limiting**: Protection against abuse (express-rate-limit)

## Scalability Considerations

1. **Redis Caching**: Reduces database load and API calls
2. **Socket.io Rooms**: Efficient real-time communication
3. **Background Jobs**: Scheduled traffic monitoring
4. **Database Indexing**: Optimized queries (via Prisma)
5. **Modular Architecture**: Easy to scale individual components

## API Design

### RESTful Endpoints

- **Authentication**: `/api/auth/*`
- **Traffic**: `/api/traffic/*`
- **Routes**: `/api/routes/*`
- **Police**: `/api/police/*`
- **Notifications**: `/api/notifications/*`

### Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Format

```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]
}
```

## Real-time Events

### Socket.io Events

**Client → Server:**
- Connection with JWT token in auth

**Server → Client:**
- `traffic_alert`: New traffic alert notification
- `alert_updated`: Alert status updated

## Database Schema

### Key Models

- **User**: User accounts with roles
- **PoliceRegion**: Assigned regions for traffic police
- **DailyRoute**: Saved routes for daily users
- **TrafficAlert**: Traffic congestion alerts
- **Notification**: User notifications
- **RefreshToken**: JWT refresh tokens

## Deployment Considerations

1. **Environment Variables**: All sensitive data in `.env`
2. **Database Migrations**: Prisma migrations for schema changes
3. **Logging**: Winston logger with file and console outputs
4. **Error Monitoring**: Centralized error handling
5. **Health Checks**: `/health` endpoint for monitoring

## Future Enhancements

1. **Admin Panel**: User management and system monitoring
2. **Analytics Dashboard**: Traffic patterns and statistics
3. **Push Notifications**: Mobile push notifications
4. **Machine Learning**: Predictive traffic analysis
5. **Multi-language Support**: Internationalization
6. **Advanced Caching**: More sophisticated caching strategies

