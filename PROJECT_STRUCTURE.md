# Project Structure

## Backend Structure

```
backend/
├── server.js                 # Main server file
├── prisma/                   # Prisma schema and migrations
│   └── schema.prisma        # Database schema definition
├── routes/                   # API routes
│   ├── auth.js              # Authentication routes
│   ├── police.js            # Police-specific routes
│   ├── user.js              # User routes
│   ├── traffic.js           # Traffic detection routes
│   ├── notifications.js     # Notification routes
│   └── geocode.js           # Geocoding routes
├── controllers/             # Request handlers
│   ├── authController.js
│   ├── policeController.js
│   └── userController.js
├── services/                # Business logic
│   ├── trafficDetectionService.js  # Traffic detection logic
│   └── alertService.js              # Alert management
├── middlewares/             # Express middlewares
│   └── auth.js             # Authentication & authorization
├── utils/                   # Utility functions
│   ├── jwt.js              # JWT token utilities
│   └── validation.js       # Input validation
└── cron/                    # Scheduled tasks
    └── trafficMonitor.js    # Traffic monitoring cron jobs
```

## Frontend Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/         # Reusable components
│   │   ├── Layout.js
│   │   ├── PrivateRoute.js
│   │   ├── RouteForm.js
│   │   ├── RouteList.js
│   │   ├── RegionForm.js
│   │   ├── NotificationPanel.js
│   │   └── AlertPanel.js
│   ├── pages/              # Page components
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── UserDashboard.js
│   │   ├── PoliceDashboard.js
│   │   └── RouteFinder.js
│   ├── context/            # React Context
│   │   └── AuthContext.js
│   ├── services/           # API services
│   │   └── api.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## Database Schema (Prisma)

The Prisma schema is located at `backend/prisma/schema.prisma`.

**Models:**
- User (id, name, email, password, role)
- Region (id, policeId, name, coordinates)
- Alert (id, regionId, trafficLevel, lengthKm, status)
- Route (id, userId, source, destination, isDaily)
- Notification (id, userId, message, type, isRead)

## Key Features

### Backend
- RESTful API with Express.js
- JWT-based authentication
- Role-based access control (ADMIN, POLICE, USER, DAILY_USER)
- Prisma ORM for database operations
- Redis caching for traffic alerts
- Cron jobs for automated traffic monitoring
- Google Maps API integration

### Frontend
- React.js with hooks and context
- React Router for navigation
- TailwindCSS for styling
- Google Maps JavaScript API integration
- Responsive design
- Real-time traffic visualization

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Police Routes
- `POST /api/police/region` - Create/update region
- `GET /api/police/region` - Get police region
- `GET /api/police/dashboard` - Get dashboard data

### User Routes
- `POST /api/user/route` - Create route
- `GET /api/user/routes` - Get user routes
- `DELETE /api/user/route/:id` - Delete route
- `GET /api/user/dashboard` - Get dashboard

### Traffic Routes
- `POST /api/traffic/check` - Check traffic for route
- `POST /api/traffic/alternate-routes` - Get alternate routes

### Notifications
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/alerts` - Get alerts
- `PATCH /api/notifications/alerts/:id/resolve` - Resolve alert

### Geocoding
- `POST /api/geocode/geocode` - Geocode address

## Environment Variables

### Backend (.env)
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - Token expiration time
- `REDIS_URL` - Redis connection URL
- `GOOGLE_MAPS_API_KEY` - Google Maps API key
- `PORT` - Server port
- `NODE_ENV` - Environment (development/production)

### Frontend (frontend/.env)
- `REACT_APP_GOOGLE_MAPS_API_KEY` - Google Maps API key
- `REACT_APP_API_URL` - Backend API URL

