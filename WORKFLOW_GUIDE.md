# Field Service Management - Complete Workflow Guide

## 🏢 Step 1: Owner Creates Company & Users

### 1.1 Register Company (Owner)
```bash
POST http://localhost:3000/auth/register
{
  "email": "owner@company.com",
  "password": "password123",
  "companyName": "ABC Repair Services"
}
```

### 1.2 Create Clients (Owner only)
```bash
POST http://localhost:3000/users/clients
Authorization: Bearer <owner_jwt_token>
{
  "email": "client@example.com",
  "password": "password123",
  "name": "John Client",
  "phone": "+1234567890"
}
```

### 1.3 Create Servicemen (Owner only)
```bash
POST http://localhost:3000/users/servicemen
Authorization: Bearer <owner_jwt_token>
{
  "email": "serviceman@example.com",
  "password": "password123",
  "name": "Mike Serviceman",
  "phone": "+1234567891",
  "skills": ["plumbing", "electrical"]
}
```

## 👤 Step 2: Client Reports Problem

### 2.1 Client Login
```bash
POST http://localhost:3000/auth/login
{
  "email": "client@example.com",
  "password": "password123"
}
```

### 2.2 Client Reports Problem (Creates Task Directly)
```bash
POST http://localhost:3001/problems/report
Authorization: Bearer <client_jwt_token>
{
  "title": "Washing machine not working",
  "description": "Machine won't start, no power",
  "address": "123 Main St, New York, NY 10001"
}
```

**What happens automatically:**
1. ✅ Address is geocoded using Google Maps
2. ✅ Location is saved
3. ✅ Task is created directly (no problem table)
4. ✅ System tries to assign to nearest serviceman immediately

## 🔧 Step 3: Serviceman Completes Task

### 3.1 Serviceman Login
```bash
POST http://localhost:3000/auth/login
{
  "email": "serviceman@example.com",
  "password": "password123"
}
```

### 3.2 Complete Task
```bash
PATCH http://localhost:3000/tasks/{taskId}/complete
Authorization: Bearer <serviceman_jwt_token>
```

**What happens automatically:**
1. ✅ Task marked as completed
2. ✅ Serviceman capacity freed up
3. ✅ Next pending task gets assigned automatically

## 🎯 Smart Assignment Logic

When a task is created:

1. **Create Task**: Directly from client report (no problem table)
2. **Find Available Servicemen**: Online + capacity < 2 tasks
3. **Calculate Distances**: Using Google Maps Distance Matrix API
4. **Assign to Nearest**: Automatically assigns to closest serviceman
5. **Queue if Busy**: If all servicemen have 2 tasks, shows: *"Serviceman is not free (serviceman have already assign two task)"*

## 📊 Current API Endpoints

```
GET  /                          - Welcome message
GET  /health                    - Health check
POST /auth/register             - Register company owner
POST /auth/login                - Login (any role)
POST /users/clients             - Create client (owner only)
POST /users/servicemen          - Create serviceman (owner only)
POST /problems/report           - Create task directly (client only)
PATCH /tasks/:id/complete       - Complete task (serviceman only)
```

## 🔑 User Roles & Permissions

- **Owner**: Can create clients, servicemen, view all data
- **Client**: Can report problems, view own problems
- **Serviceman**: Can view assigned tasks, complete tasks

## 🗄️ Database Tables Created

✅ companies, users, user_profiles  
✅ clients, servicemen, locations  
✅ tasks (with title, description), task_assignments  
✅ task_events, notifications, audit_logs  
❌ problems (removed - tasks contain problem data directly)  

Your Field Service Management system is ready! 🚀