# Fix MySQL Token Column Length Issue

## Problem
MySQL has a limitation where `String` type defaults to `VARCHAR(191)` which is too short for JWT tokens (which can be 200-500+ characters). Also, MySQL doesn't support unique indexes directly on `TEXT` columns.

## Solution
Changed the `token` field in `RefreshToken` model to use `@db.VarChar(1000)` which:
- Allows tokens up to 1000 characters (more than enough for JWTs)
- Supports unique indexing (unlike TEXT)
- Is efficient for indexing

## Steps to Apply Fix

1. **Update the schema** (already done):
   ```prisma
   token     String   @unique @db.VarChar(1000)
   ```

2. **Create a new migration**:
   ```bash
   npm run prisma:migrate
   ```
   
   Or if you need to reset the database:
   ```bash
   npx prisma migrate reset
   npx prisma migrate dev
   ```

3. **If you already have data, you may need to manually alter the table**:
   ```sql
   ALTER TABLE refresh_tokens 
   MODIFY COLUMN token VARCHAR(1000) NOT NULL;
   ```

4. **Regenerate Prisma client**:
   ```bash
   npm run prisma:generate
   ```

5. **Restart your server**:
   ```bash
   npm run dev
   ```

## Alternative Solutions

If you prefer a different approach:

### Option 1: Use TEXT with hash for uniqueness
```prisma
token     String   @db.Text
tokenHash String   @unique @db.VarChar(64)  // SHA256 hash
```

### Option 2: Use VARCHAR(500) if you want to limit size
```prisma
token     String   @unique @db.VarChar(500)
```

The current solution (VARCHAR(1000)) is recommended as it:
- Handles all JWT token lengths
- Supports unique indexing
- Is performant
- Doesn't require additional columns

