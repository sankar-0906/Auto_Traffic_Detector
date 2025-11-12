# API Reference

All API endpoints are prefixed with `/api`. The frontend base URL is configured to `http://localhost:5000/api`, so frontend calls should NOT include the `/api` prefix.

## Base URL
- Development: `http://localhost:5000/api`
- Frontend uses: `axios.get('/auth/login')` → `http://localhost:5000/api/auth/login`

## Authentication Endpoints

### POST `/auth/register`
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "USER" // Optional: USER, DAILY_USER, POLICE, ADMIN
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "jwt-token-here"
  }
}
```

### POST `/auth/login`
Login user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt-token-here"
  }
}
```

### GET `/auth/profile`
Get current user profile. **Requires authentication.**

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "routes": [...],
    "notifications": [...]
  }
}
```

## Police Endpoints

All require authentication and POLICE/ADMIN role.

### POST `/police/region`
Create or update police region.

**Request Body:**
```json
{
  "name": "Chennai Central to Guindy",
  "startLat": 13.0827,
  "startLng": 80.2707,
  "endLat": 12.9716,
  "endLng": 80.2206
}
```

### GET `/police/region`
Get police region.

### GET `/police/dashboard`
Get police dashboard data (region, alerts, stats).

## User Endpoints

All require authentication.

### POST `/user/route`
Create a route.

**Request Body:**
```json
{
  "name": "Home to Office",
  "sourceLat": 13.0827,
  "sourceLng": 80.2707,
  "destinationLat": 12.9716,
  "destinationLng": 80.2206,
  "sourceAddress": "Chennai Central",
  "destAddress": "Guindy",
  "isDaily": true,
  "alertTimeStart": "08:00",
  "alertTimeEnd": "10:00"
}
```

### GET `/user/routes`
Get all user routes.

### DELETE `/user/route/:routeId`
Delete a route.

### GET `/user/dashboard`
Get user dashboard data.

## Traffic Endpoints

All require authentication.

### POST `/traffic/check`
Check traffic for a route.

**Request Body:**
```json
{
  "sourceLat": 13.0827,
  "sourceLng": 80.2707,
  "destinationLat": 12.9716,
  "destinationLng": 80.2206,
  "routeId": "optional-route-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hasTraffic": true,
    "severity": "HIGH",
    "congestionKm": 1.5,
    "estimatedTime": "45 mins",
    "distance": "12.5 km"
  }
}
```

### POST `/traffic/alternate-routes`
Get alternate routes.

**Request Body:**
```json
{
  "sourceLat": 13.0827,
  "sourceLng": 80.2707,
  "destinationLat": 12.9716,
  "destinationLng": 80.2206
}
```

## Notification Endpoints

All require authentication.

### GET `/notifications`
Get user notifications.

**Query Parameters:**
- `isRead`: boolean (optional)
- `limit`: number (optional, default: 50)

### PATCH `/notifications/:notificationId/read`
Mark notification as read.

### PATCH `/notifications/read-all`
Mark all notifications as read.

### GET `/notifications/alerts`
Get alerts (for police users).

### PATCH `/notifications/alerts/:alertId/resolve`
Resolve an alert.

## Geocoding Endpoints

All require authentication.

### POST `/geocode/geocode`
Geocode an address.

**Request Body:**
```json
{
  "address": "Chennai Central, Tamil Nadu, India"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lat": 13.0827,
    "lng": 80.2707,
    "address": "Chennai Central Station, ...",
    "placeId": "..."
  }
}
```

## Health Check

### GET `/health`
Check server status.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "redis": "connected",
  "database": "connected"
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [...] // Optional: validation errors
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

