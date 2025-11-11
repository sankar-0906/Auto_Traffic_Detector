# Smart Traffic Detection System

A real-time web and mobile application that detects traffic congestion using Google Maps API and alerts nearby traffic police automatically.

## Tech Stack

### Backend
- Node.js + Express.js
- PostgreSQL + Prisma ORM
- Redis (caching & message broker)
- Socket.io (real-time updates)
- JWT (authentication)

### Frontend Web
- React.js
- Google Maps API
- Socket.io Client
- Axios

### Frontend Mobile
- React Native
- React Native Maps
- Socket.io Client
- Axios

## User Roles

1. **Traffic Police**: Receive alerts for traffic congestion in their assigned region
2. **Daily User**: Save daily commute routes and receive automatic notifications
3. **Normal User**: Explore routes and view traffic conditions

## Project Structure

```
├── backend/          # Node.js + Express backend
├── frontend-web/     # React.js web application
├── frontend-mobile/  # React Native mobile application
└── README.md
```

## Setup Instructions

### Backend Setup
1. Navigate to `backend/` directory
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run Prisma migrations: `npx prisma migrate dev`
5. Start server: `npm run dev`

### Frontend Web Setup
1. Navigate to `frontend-web/` directory
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start development server: `npm start`

### Frontend Mobile Setup
1. Navigate to `frontend-mobile/` directory
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run on iOS: `npx react-native run-ios`
5. Run on Android: `npx react-native run-android`

## Environment Variables

See `.env.example` files in each directory for required environment variables.

## Features

- Real-time traffic detection
- Automatic police alerts for congestion > 1km
- Route monitoring for daily users
- Traffic visualization on maps
- Role-based access control
- Real-time notifications via Socket.io

