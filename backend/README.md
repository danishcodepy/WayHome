# WayHome Backend

Spring Boot 3 + MySQL backend for **WayHome — Online Real Estate & Student Accommodation Management System**.
The backend now matches the frontend data model, supports JWT authentication, CORS, real property/student-accommodation data, admin approval, applications, agreements, messaging, notifications and password recovery.

## Requirements

- JDK 17+
- Maven 3.8+
- MySQL 8+

## Setup

1. Create the database if you want to use the SQL script:

```bash
mysql -u root -p < src/main/resources/schema.sql
```

2. Configure environment variables or edit `src/main/resources/application.properties`:

```text
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_32_plus_character_secret
FRONTEND_URL=http://localhost:5173
```

3. Start the backend:

```bash
mvn spring-boot:run
```

The API base URL is:

```text
http://localhost:8080/api
```

On a fresh database, `DataInitializer` creates local demo accounts and sample listings so the complete frontend/backend flow can be tested immediately.

### Demo accounts

All seeded demo accounts use the password:

```text
demo-preview
```

- Admin: `arjun.kapoor@wayhome.example`
- Property Manager: `rohit.sharma@example.com`
- Tenant: `vikram.singh@example.com`
- Student: `aarav.mehta@example.com`

Change/remove these seeded accounts before using the project outside a college demonstration.

## API overview

### Public

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/verify-reset`
- `POST /api/auth/reset-password`
- `GET /api/properties`
- `GET /api/properties/{id}` (approved listings only)
- `GET /api/accommodations`
- `GET /api/accommodations/{id}`
- `GET /api/accommodations/universities`

### Authenticated

- `POST/PATCH/DELETE /api/properties...` according to role
- `GET /api/properties/owner/{ownerId}`
- `GET/POST/PUT /api/applications...`
- `GET /api/agreements...`
- `GET/POST /api/messages...`
- `GET/PUT /api/notifications...`
- `GET/PUT /api/users/me`

### Admin

- `GET /api/admin/stats`
- `GET /api/admin/properties`
- `GET /api/admin/applications`
- `GET /api/admin/agreements`
- `GET/PUT/DELETE /api/users...`
- property approval/rejection endpoints

## Frontend connection

Copy the frontend environment example into a local `.env` file:

```text
VITE_API_BASE_URL=http://localhost:8080/api
```

If `VITE_API_BASE_URL` is left empty, the frontend intentionally runs in offline demo mode using local sample data.
