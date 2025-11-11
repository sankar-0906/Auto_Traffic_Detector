# MySQL Setup Guide

## Prerequisites

1. MySQL Server installed and running
2. MySQL client tools (mysql command line or MySQL Workbench)

## Database Setup

### 1. Create Database

Connect to MySQL and create the database:

```sql
CREATE DATABASE traffic_detection CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or using command line:
```bash
mysql -u root -p -e "CREATE DATABASE traffic_detection CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 2. Update .env File

Update the `DATABASE_URL` in your `.env` file:

```env
DATABASE_URL="mysql://username:password@localhost:3306/traffic_detection"
```

**Format:** `mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME`

**Example:**
```env
DATABASE_URL="mysql://root:mypassword@localhost:3306/traffic_detection"
```

### 3. Install MySQL Driver

The Prisma client will automatically use the MySQL driver. Make sure you have the correct Prisma version:

```bash
npm install @prisma/client prisma
```

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Run Migrations

```bash
npm run prisma:migrate
```

This will create all the tables in your MySQL database.

## MySQL Connection String Examples

### Local MySQL
```env
DATABASE_URL="mysql://root:password@localhost:3306/traffic_detection"
```

### Remote MySQL
```env
DATABASE_URL="mysql://user:password@192.168.1.100:3306/traffic_detection"
```

### MySQL with SSL
```env
DATABASE_URL="mysql://user:password@localhost:3306/traffic_detection?sslmode=REQUIRED"
```

### MySQL with Connection Pool
```env
DATABASE_URL="mysql://user:password@localhost:3306/traffic_detection?connection_limit=10"
```

## Troubleshooting

### Connection Refused
- Check if MySQL server is running: `mysqladmin ping` or `systemctl status mysql`
- Verify host and port (default is 3306)
- Check firewall settings

### Access Denied
- Verify username and password
- Check user permissions:
  ```sql
  GRANT ALL PRIVILEGES ON traffic_detection.* TO 'username'@'localhost';
  FLUSH PRIVILEGES;
  ```

### Database Not Found
- Create the database first (see step 1)
- Verify database name in connection string

### Character Set Issues
- Ensure database uses utf8mb4:
  ```sql
  ALTER DATABASE traffic_detection CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

### Prisma Migration Errors
- Drop and recreate database if needed:
  ```sql
  DROP DATABASE traffic_detection;
  CREATE DATABASE traffic_detection CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```
- Then run migrations again

## Testing Connection

Test your MySQL connection:

```bash
mysql -u username -p -h localhost traffic_detection
```

Or test with Node.js:
```javascript
const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'username',
  password: 'password',
  database: 'traffic_detection'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting:', err);
  } else {
    console.log('Connected to MySQL!');
  }
});
```

## Notes

- MySQL doesn't support native UUID generation, but Prisma handles UUID generation in the application layer
- Use `utf8mb4` character set for full Unicode support (emojis, etc.)
- The schema uses `@default(uuid())` which Prisma will handle correctly for MySQL

