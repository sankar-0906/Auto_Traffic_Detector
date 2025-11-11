# Manual Fix for Token Column Length

Since Prisma migrate requires interactive mode, here's how to fix it manually:

## Option 1: Run SQL Directly (Recommended)

1. Connect to your MySQL database:
   ```bash
   mysql -u your_username -p auto_traffic_detection
   ```

2. Run the SQL commands from `fix_token_column.sql`:
   ```sql
   ALTER TABLE refresh_tokens DROP INDEX token;
   ALTER TABLE refresh_tokens MODIFY COLUMN token VARCHAR(500) NOT NULL;
   ALTER TABLE refresh_tokens ADD UNIQUE INDEX token (token);
   ```

3. Regenerate Prisma client:
   ```bash
   npm run prisma:generate
   ```

## Option 2: Use Prisma DB Push (Alternative)

```bash
npx prisma db push
```

This will push the schema changes directly without creating a migration file.

## Option 3: Use MySQL Workbench or phpMyAdmin

1. Open your database management tool
2. Navigate to the `refresh_tokens` table
3. Modify the `token` column:
   - Change type from `VARCHAR(191)` to `VARCHAR(500)`
   - Keep it as `NOT NULL` and `UNIQUE`
4. Apply the changes
5. Run `npm run prisma:generate`

## Verify the Fix

After applying the fix, verify the column:
```sql
DESCRIBE refresh_tokens;
```

The `token` column should show `varchar(500)`.

## Why VARCHAR(500)?

- JWT tokens are typically 200-400 characters
- VARCHAR(500) provides enough space with buffer
- MySQL unique index limit is 3072 bytes
- With utf8mb4 (4 bytes per char), 500 chars = 2000 bytes (within limit)

