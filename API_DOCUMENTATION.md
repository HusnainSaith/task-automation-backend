# Field Service Management API Documentation

## Overview
This backend manages companies that provide on-site services with automatic task dispatch using Google Maps APIs.

## Setup

1. **Environment Variables**
   ```bash
   # Copy .env and update with your values
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=field_service_db
   JWT_SECRET=your-super-secret-jwt-key
   OPENAI_API_KEY=your-openai-api-key
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

2. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb field_service_db
   
   # Run migrations
   npm run migration:run
   ```

3. **Start Application**
   ```bash
   npm run start:dev
   ```

## API Endpoints

### Authentication

#### Register Company Owner
```http
POST /auth/register
Content-Type: application/json

{
  "email": "owner@company.com",
  "password": "password123",
  "companyName": "ABC Repair Services"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "owner@company.com",
  "password": "password123"
}
```

### Problem Reporting (Client)

#### Report Problem
```http
POST /problems/report
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Washing machine not working",
  "description": "Machine won't start, no power",
  "address": "123 Main St, New York, NY 10001"
}
```

### Task Management (Serviceman)

#### Complete Task
```http
PATCH /tasks/{taskId}/complete
Authorization: Bearer <jwt_token>
```

#### Create Task from Problem
```http
POST /tasks/from-problem/{problemId}
Authorization: Bearer <jwt_token>
```

## System Flow

1. **Company Registration**: Owner creates company and gets JWT token
2. **Problem Reporting**: Client reports problem with location
3. **Automatic Task Creation**: System converts problem to task
4. **Smart Assignment**: System finds nearest available serviceman using Google Maps
5. **Task Completion**: Serviceman marks task complete, freeing capacity
6. **Queue Processing**: Next pending task gets assigned automatically

## Key Features

- **Automatic Dispatch**: Uses Google Maps Distance Matrix API to find nearest serviceman
- **Capacity Management**: Each serviceman can handle max 2 concurrent tasks
- **Queue System**: When all servicemen busy, tasks queue with message: "Serviceman is not free (serviceman have already assign two task)"
- **Location Intelligence**: Geocoding and distance calculation for optimal routing
- **Role-Based Access**: Owner, Serviceman, and Client roles with appropriate permissions

## Database Schema

The system uses 12 main entities:
- Companies, Users, UserProfiles
- Clients, Servicemen, Locations
- Problems, Tasks, TaskAssignments
- TaskEvents, Notifications, AuditLogs

## Error Handling

- Invalid credentials: 401 Unauthorized
- Resource not found: 404 Not Found
- Validation errors: 400 Bad Request
- Server errors: 500 Internal Server Error