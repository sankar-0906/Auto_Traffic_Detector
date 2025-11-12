# Traffic Detector Backend

Backend API for Smart Traffic Detection & Alert System.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the backend directory:
```env
DATABASE_URL="mysql://user:password@localhost:3306/traffic_detector"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
PORT=5000
NODE_ENV=development
```

3. Set up database:
```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Start Redis server:
```bash
redis-server
```

5. Run the server:
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:push` - Push schema changes to database

## API Endpoints

See main README.md for API documentation.

