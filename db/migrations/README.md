# Database Migrations

## วิธีรัน Migration

### ใช้ psql command line:
```bash
psql -U <username> -d <database_name> -f backend/db/migrations/add_category_column.sql
```

### หรือใช้ docker-compose exec (ถ้ารัน Docker):
```bash
docker-compose exec postgres psql -U postgres -d itrequest_db -f /migrations/add_category_column.sql
```

### หรือเชื่อมต่อ PostgreSQL แล้วรันคำสั่ง:
```sql
-- Copy และ paste คำสั่งจากไฟล์ add_category_column.sql
```

## Migrations ที่มี:
- `add_category_column.sql` - เพิ่ม column category ในตาราง it_requests
