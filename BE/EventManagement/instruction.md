# Event Management System - API Documentation

## Architecture Overview

The Event Management System uses a microservices architecture with an API Gateway (YARP - Yet Another Reverse Proxy) that routes requests to various backend services running on different ports.

---

## API Gateway Configuration (YARP)

**Gateway URL:** `http://localhost:5000`

### Gateway Routing Configuration

The API Gateway routes incoming requests to the following services:

| Route Pattern | Cluster | Backend Service Address | Port |
|---|---|---|---|
| `/api/auth/*` | auth-cluster | http://localhost:6003 | 6003 |
| `/api/roles/*` | auth-cluster | http://localhost:6003 | 6003 |
| `/api/users/*` | auth-cluster | http://localhost:6003 | 6003 |
| `/api/events/*` | event-cluster | http://localhost:6101 | 6101 |
| `/api/categories/*` | event-cluster | http://localhost:6101 | 6101 |
| `/api/organizers/*` | event-cluster | http://localhost:6101 | 6101 |
| `/api/eventreviews/*` | event-cluster | http://localhost:6101 | 6101 |
| `/api/favorites/*` | event-cluster | http://localhost:6101 | 6101 |
| `/api/interactions/*` | event-cluster | http://localhost:6101 | 6101 |
| `/api/tickets/*` | ticket-cluster | http://localhost:6201 | 6201 |
| `/api/tickettypes/*` | ticket-cluster | http://localhost:6201 | 6201 |
| `/hubs/ticket/*` | ticket-cluster | http://localhost:6201 | 6201 |
| `/api/bookings/*` | booking-cluster | http://localhost:6301 | 6301 |
| `/api/paymentmethods/*` | payment-cluster | http://localhost:6401 | 6401 |
| `/api/notifications/*` | operation-cluster | http://localhost:6501 | 6501 |
| `/api/checkins/*` | operation-cluster | http://localhost:6501 | 6501 |

### Swagger/OpenAPI Endpoints

The gateway aggregates Swagger documentation from all services:

- **Auth Service:** `http://localhost:5000/auth-service/swagger/v1/swagger.json`
- **Event Service:** `http://localhost:5000/event-service/swagger/v1/swagger.json`
- **Ticket Service:** `http://localhost:5000/ticket-service/swagger/v1/swagger.json`
- **Booking Service:** `http://localhost:5000/booking-service/swagger/v1/swagger.json`
- **Payment Service:** `http://localhost:5000/payment-service/swagger/v1/swagger.json`
- **Operation Service:** `http://localhost:5000/operation-service/swagger/v1/swagger.json`
- **Resale Service:** `http://localhost:5000/resale-service/swagger/v1/swagger.json`

### CORS Configuration

- **Allowed Frontend URL:** `http://localhost:3000`
- **Methods:** All HTTP methods (GET, POST, PUT, DELETE, PATCH)
- **Headers:** All headers allowed
- **Credentials:** Enabled (required for SignalR)

### Authentication

All endpoints use **JWT Bearer Token** authentication where required. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## AUTH SERVICE (Port 6003)

### Controllers and Endpoints

#### 1. Authentication Controller (`/api/auth`)

**Purpose:** Handle user authentication operations including login, registration, password management, and email verification.

##### Endpoints:

| HTTP Method | Endpoint | Request | Response | Status Code | Notes |
|---|---|---|---|---|---|
| **POST** | `/api/auth/login` | `LoginCommand` | `LoginResponse` | 200/400 | Email + Password authentication |
| **POST** | `/api/auth/login-google` | `LoginGoogleCommand` | `LoginGoogleResponse` | 200/400 | OAuth2 Google login |
| **POST** | `/api/auth/refresh` | `RefreshCommand` | `RefreshResponse` | 200/400 | Refresh JWT token |
| **POST** | `/api/auth/logout` | `LogoutCommand` | `LogoutResponse` | 200/400 | Logout user |
| **POST** | `/api/auth/register` | `RegisterCommand` | `RegisterResponse` | 200/400 | Register new user |
| **POST** | `/api/auth/verify-register` | `VerifyRegisterCommand` | `VerifyRegisterResponse` | 201/400 | Verify registration via OTP/Email |
| **POST** | `/api/auth/forgot-password` | `ForgotPasswordCommand` | `ForgotPasswordResponse` | 200/400 | Request password reset |
| **POST** | `/api/auth/verify-forgot-password` | `VerifyForgotPasswordCommand` | `VerifyForgotPasswordResponse` | 200/400 | Verify and reset password |
| **POST** | `/api/auth/change-email` | `ChangeEmailCommand` | `ChangeEmailResponse` | 200/400 | Request email change |
| **POST** | `/api/auth/verify-change-email` | `VerifyChangeEmailCommand` | `ChangeEmailResponse` | 200/400 | Verify new email |
| **POST** | `/api/auth/change-password` | `ChangePasswordCommand` | `ChangePasswordResponse` | 200/400 | Change user password |

##### Request/Response Models:

**POST /api/auth/login - LoginCommand:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "location": {
    "latitude": 10.8231,
    "longitude": 106.6883,
    "address": "123 Main Street, City"
  }
}
```

**LoginResponse:**
```json
{
  "isSuccess": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "listErrors": []
}
```

---

**POST /api/auth/register - RegisterCommand:**

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "0912345678",
  "password": "password123",
  "avatarUrl": "https://example.com/avatar.jpg",
  "gender": 1,
  "dateOfBirth": "1990-01-01T00:00:00Z",
  "address": "123 Main Street",
}
```

**RegisterResponse:**
```json
{
  "isSuccess": true,
  "message": "Registration successful",
  "data": {},
  "listErrors": []
}
```

---

**POST /api/auth/login-google - LoginGoogleCommand:**

```json
{
  "googleToken": "ya29.a0AfH6SMBx...",
  "location": {
    "latitude": 10.8231,
    "longitude": 106.6883,
    "address": "123 Main Street, City"
  } 
}
```

**LoginGoogleResponse:**
```json
{
  "isSuccess": true,
  "message": "Google login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "listErrors": []
}
```

---

**POST /api/auth/refresh - RefreshCommand:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**RefreshResponse:**
```json
{
  "isSuccess": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "listErrors": []
}
```

---

**POST /api/auth/logout - LogoutCommand:**

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**LogoutResponse:**
```json
{
  "isSuccess": true,
  "message": "Logout successful",
  "data": null,
  "listErrors": []
}
```

---

**POST /api/auth/verify-register - VerifyRegisterCommand:**

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**VerifyRegisterResponse:**
```json
{
  "isSuccess": true,
  "message": "Email verified successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "0912345678",
    "isVerified": true,
    "avatarUrl": "https://example.com/avatar.jpg",
    "gender": 1,
    "dateOfBirth": "1990-01-01T00:00:00Z",
    "address": "123 Main Street",
    "status": "Active",
    "roleId": "550e8400-e29b-41d4-a716-446655440001",
    "organizerId": null
  },
  "listErrors": []
}
```

---

**POST /api/auth/forgot-password - ForgotPasswordCommand:**

```json
{
  "email": "john@example.com"
}
```

**ForgotPasswordResponse:**
```json
{
  "isSuccess": true,
  "message": "Password reset email sent successfully",
  "data": null,
  "listErrors": []
}
```

---

**POST /api/auth/verify-forgot-password - VerifyForgotPasswordCommand:**

```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newPassword123"
}
```

**VerifyForgotPasswordResponse:**
```json
{
  "isSuccess": true,
  "message": "Password reset successfully",
  "data": null,
  "listErrors": []
}
```

---

**POST /api/auth/change-email - ChangeEmailCommand:**

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "newEmail": "newemail@example.com"
}
```

**ChangeEmailResponse:**
```json
{
  "isSuccess": true,
  "message": "Change email request sent. Please verify your new email.",
  "data": null,
  "listErrors": []
}
```

---

**POST /api/auth/verify-change-email - VerifyChangeEmailCommand:**

```json
{
  "email": "newemail@example.com",
  "otp": "123456"
}
```

---

**POST /api/auth/change-password - ChangePasswordCommand:**

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "password": "oldPassword123",
  "newPassword": "newPassword123"
}
```

**ChangePasswordResponse:**
```json
{
  "isSuccess": true,
  "message": "Password changed successfully",
  "data": null,
  "listErrors": []
}
```


---

#### 2. User Controller (`/api/users`)

**Purpose:** Manage user profiles and information.

##### Endpoints:

| HTTP Method | Endpoint | Request | Response | Status Code | Notes |
|---|---|---|---|---|---|
| **POST** | `/api/users` | `UserCreateCommand` | `UserCreateResponse` | 201/400 | Create new user |
| **GET** | `/api/users/{id}` | `UserGetByIdQuery` | `UserGetByIdResponse` | 200/400 | Get user by ID |
| **GET** | `/api/users` | `UserGetListQuery` | `UserGetListResponse` | 200/400 | Get paginated list of users |
| **PUT** | `/api/users/{id}` | `UserUpdateCommand` | `UserUpdateResponse` | 201/400 | Update user information |
| **DELETE** | `/api/users/{id}` | - | `UserDeleteResponse` | 200/400 | Hard delete user |
| **PATCH** | `/api/users/{id}` | - | `UserRestoreResponse` | 200/400 | Restore soft-deleted user |

##### Request/Response Models:

**POST /api/users - UserCreateCommand:**

```json
{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "phone": "0987654321",
  "password": "password123",
  "avatarUrl": "https://example.com/avatar.jpg",
  "gender": 0,
  "dateOfBirth": "1995-05-15T00:00:00Z",
  "address": "456 Oak Avenue",
  "status": "Active",
  "roleName": "User",
  "organizerId": null
}
```

**UserCreateResponse:**
```json
{
  "isSuccess": true,
  "message": "User created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "phone": "0987654321",
    "isVerified": false,
    "avatarUrl": "https://example.com/avatar.jpg",
    "gender": 0,
    "dateOfBirth": "1995-05-15T00:00:00Z",
    "address": "456 Oak Avenue",
    "status": "Active",
    "role": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "User"
    },
    "organizerId": null,
    "locations": []
  },
  "listErrors": []
}
```

---

**GET /api/users/{id} - UserGetByIdQuery:**

Query Parameters:
```json
{
  "fields": "id,fullName,email,phone",
  "hasLocation": false
}
```

**UserGetByIdResponse:**
```json
{
  "isSuccess": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "phone": "0987654321",
    "isVerified": true,
    "avatarUrl": "https://example.com/avatar.jpg",
    "gender": 0,
    "dateOfBirth": "1995-05-15T00:00:00Z",
    "address": "456 Oak Avenue",
    "status": "Active",
    "role": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "User"
    },
    "organizerId": null,
    "locations": []
  },
  "listErrors": []
}
```

---

**GET /api/users - UserGetListQuery:**

Query Parameters:
```json
{
  "pageNumber": 1,
  "pageSize": 10,
  "fullName": null,
  "email": null,
  "phone": null,
  "isVerified": null,
  "gender": null,
  "status": null,
  "fields": "id,fullName,email",
  "hasLocation": false,
  "isDescending": false,
  "isDeleted": false
}
```

**UserGetListResponse:**
```json
{
  "isSuccess": true,
  "message": "Users retrieved successfully",
  "data": {
    "totalCount": 150,
    "pageNumber": 1,
    "pageSize": 10,
    "totalPage": 15,
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "fullName": "Jane Smith",
        "email": "jane@example.com",
        "phone": "0987654321",
        "isVerified": true,
        "status": "Active",
        "role": {
          "id": "550e8400-e29b-41d4-a716-446655440003",
          "name": "User"
        }
      }
    ]
  },
  "listErrors": []
}
```

---

**PUT /api/users/{id} - UserUpdateCommand:**

```json
{
  "fullName": "Jane Smith Updated",
  "phone": "0987654322",
  "avatarUrl": "https://example.com/avatar-new.jpg",
  "gender": 0,
  "dateOfBirth": "1995-05-15T00:00:00Z",
  "address": "789 Pine Road",
  "status": "Active",
  "roleName": "User",
  "organizerId": null
}
```

**UserUpdateResponse:**
```json
{
  "isSuccess": true,
  "message": "User updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "fullName": "Jane Smith Updated",
    "email": "jane@example.com",
    "phone": "0987654322",
    "isVerified": true,
    "status": "Active",
    "role": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "User"
    }
  },
  "listErrors": []
}
```

---

**DELETE /api/users/{id}:**

**UserDeleteResponse:**
```json
{
  "isSuccess": true,
  "message": "User deleted successfully",
  "data": null,
  "listErrors": []
}
```

---

**PATCH /api/users/{id}:**

**UserRestoreResponse:**
```json
{
  "isSuccess": true,
  "message": "User restored successfully",
  "data": null,
  "listErrors": []
}
```

---

#### 3. Role Controller (`/api/roles`)

**Purpose:** Manage user roles and permissions (requires authorization).

##### Endpoints:

| HTTP Method | Endpoint | Request | Response | Status Code | Authorization | Notes |
|---|---|---|---|---|---|---|
| **GET** | `/api/roles` | `RoleGetAllQuery` | `RoleGetAllResponse` | 200/400 | Required | Get all roles |
| **POST** | `/api/roles` | `RoleCreateCommand` | `RoleCreateResponse` | 201/400 | - | Create new role |
| **POST** | `/api/roles/dumb` | `RoleDumbCommand` | `RoleResponse` | 200/400 | - | Initialize default roles |
| **DELETE** | `/api/roles/{id}` | - | `RoleDeleteResponse` | 200/400 | - | Hard delete role |
| **PATCH** | `/api/roles/{id}` | - | `RoleRestoreResponse` | 200/400 | - | Restore soft-deleted role |

##### Request/Response Models:

**GET /api/roles - RoleGetAllQuery:**

No parameters required

**RoleGetAllResponse:**
```json
{
  "isSuccess": true,
  "message": "Roles retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "User",
      "description": "Standard user role"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "name": "Admin",
      "description": "Administrator role"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440005",
      "name": "Organizer",
      "description": "Event organizer role"
    }
  ],
  "listErrors": []
}
```

---

**POST /api/roles - RoleCreateCommand:**

```json
{
  "name": "Premium Member",
  "description": "Premium membership role with additional features"
}
```

**RoleCreateResponse:**
```json
{
  "isSuccess": true,
  "message": "Role created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440006",
    "name": "Premium Member",
    "description": "Premium membership role with additional features"
  },
  "listErrors": []
}
```

---

**POST /api/roles/dumb - RoleDumbCommand:**

```json
{}
```

**RoleResponse:**
```json
{
  "isSuccess": true,
  "message": "Default roles initialized",
  "data": null,
  "listErrors": []
}
```

---

**DELETE /api/roles/{id}:**

**RoleDeleteResponse:**
```json
{
  "isSuccess": true,
  "message": "Role deleted successfully",
  "data": null,
  "listErrors": []
}
```

---

**PATCH /api/roles/{id}:**

**RoleRestoreResponse:**
```json
{
  "isSuccess": true,
  "message": "Role restored successfully",
  "data": null,
  "listErrors": []
}
```

---

## EVENT SERVICE (Port 6101)

### Controllers and Endpoints

#### 1. Event Controller (`/api/events`)

**Purpose:** Manage event creation, updates, and retrieval.

##### Endpoints:

| HTTP Method | Endpoint | Request | Response | Status Code | Notes |
|---|---|---|---|---|---|
| **GET** | `/api/events` | `EventGetListQuery` | `EventGetListResponse` | 200/400 | Get paginated list of events |
| **GET** | `/api/events/{id}` | `EventGetByIdQuery` | `EventGetByIdResponse` | 200/400 | Get event details by ID |
| **POST** | `/api/events` | `EventCreateCommand` | `EventCreateResponse` | 201/400 | Create new event |
| **PUT** | `/api/events/{id}` | `EventUpdateCommand` | `EventUpdateResponse` | 200/400 | Update event information |
| **DELETE** | `/api/events/{id}` | - | `EventDeleteResponse` | 200/400 | Hard delete event |
| **PATCH** | `/api/events/{id}` | - | `EventRestoreResponse` | 200/400 | Restore soft-deleted event |

##### Request/Response Models:

**POST /api/events - EventCreateCommand:**

```json
{
  "name": "Tech Conference 2024",
  "slug": "tech-conference-2024",
  "subtitle": "Future of Technology",
  "description": "Join us for an exciting tech conference showcasing innovations in AI and cloud computing",
  "tags": [
    { "name": "Technology" },
    { "name": "Conference" },
    { "name": "AI" }
  ],
  "startTime": "2024-06-01T09:00:00Z",
  "endTime": "2024-06-01T17:00:00Z",
  "openTime": "09:00",
  "closedTime": "17:00",
  "thumbnailUrl": "https://example.com/thumb.jpg",
  "bannerUrl": "https://example.com/banner.jpg",
  "ageRestriction": 18,
  "categoryId": "550e8400-e29b-41d4-a716-446655440007",
  "organizerId": "550e8400-e29b-41d4-a716-446655440008",
  "locations": [
    {
      "name": "Main Hall",
      "address": "123 Tech Street",
      "latitude": 10.8231,
      "longitude": 106.6883
    },
    {
      "name": "Conference Room A",
      "address": "456 Tech Avenue",
      "latitude": 10.8240,
      "longitude": 106.6890
    }
  ]
}
```

**EventCreateResponse:**
```json
{
  "isSuccess": true,
  "message": "Event created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440009",
    "name": "Tech Conference 2024",
    "slug": "tech-conference-2024",
    "subtitle": "Future of Technology",
    "description": "Join us for an exciting tech conference...",
    "tags": [
      { "name": "Technology" },
      { "name": "Conference" }
    ],
    "startTime": "2024-06-01T09:00:00Z",
    "endTime": "2024-06-01T17:00:00Z",
    "openTime": "09:00",
    "closedTime": "17:00",
    "status": "Draft",
    "thumbnailUrl": "https://example.com/thumb.jpg",
    "bannerUrl": "https://example.com/banner.jpg",
    "ageRestriction": 18,
    "category": {
      "id": "550e8400-e29b-41d4-a716-446655440007",
      "name": "Technology"
    },
    "organizer": {
      "id": "550e8400-e29b-41d4-a716-446655440008",
      "name": "Tech Leaders"
    },
    "locations": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "name": "Main Hall",
        "address": "123 Tech Street",
        "latitude": 10.8231,
        "longitude": 106.6883
      }
    ]
  },
  "listErrors": []
}
```

---

**GET /api/events - EventGetListQuery:**

Query Parameters:
```json
{
  "pageNumber": 1,
  "pageSize": 20,
  "name": null,
  "slug": null,
  "subtitle": null,
  "description": null,
  "tags": null,
  "startTime": null,
  "endTime": null,
  "status": null,
  "categoryId": null,
  "organizerId": null,
  "ageRestriction": null,
  "fields": "id,name,slug,description,thumbnailUrl",
  "isDescending": false,
  "isDeleted": false
}
```

**EventGetListResponse:**
```json
{
  "isSuccess": true,
  "message": "Events retrieved successfully",
  "data": {
    "totalCount": 250,
    "pageNumber": 1,
    "pageSize": 20,
    "totalPage": 13,
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440009",
        "name": "Tech Conference 2024",
        "slug": "tech-conference-2024",
        "subtitle": "Future of Technology",
        "description": "Join us...",
        "status": "Draft",
        "thumbnailUrl": "https://example.com/thumb.jpg",
        "category": {
          "id": "550e8400-e29b-41d4-a716-446655440007",
          "name": "Technology"
        },
        "organizer": {
          "id": "550e8400-e29b-41d4-a716-446655440008",
          "name": "Tech Leaders"
        }
      }
    ]
  },
  "listErrors": []
}
```

---

**GET /api/events/{id} - EventGetByIdQuery:**

Query Parameters:
```json
{
  "fields": "id,name,slug,description,category,organizer,locations"
}
```

**EventGetByIdResponse:**
```json
{
  "isSuccess": true,
  "message": "Event retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440009",
    "name": "Tech Conference 2024",
    "slug": "tech-conference-2024",
    "subtitle": "Future of Technology",
    "description": "Join us for an exciting tech conference...",
    "tags": [
      { "name": "Technology" },
      { "name": "Conference" }
    ],
    "startTime": "2024-06-01T09:00:00Z",
    "endTime": "2024-06-01T17:00:00Z",
    "openTime": "09:00",
    "closedTime": "17:00",
    "status": "Published",
    "thumbnailUrl": "https://example.com/thumb.jpg",
    "bannerUrl": "https://example.com/banner.jpg",
    "ageRestriction": 18,
    "category": {
      "id": "550e8400-e29b-41d4-a716-446655440007",
      "name": "Technology",
      "slug": "technology",
      "description": "Technology events"
    },
    "organizer": {
      "id": "550e8400-e29b-41d4-a716-446655440008",
      "name": "Tech Leaders",
      "email": "contact@techleaders.com",
      "phone": "0912345678"
    },
    "locations": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "name": "Main Hall",
        "address": "123 Tech Street",
        "latitude": 10.8231,
        "longitude": 106.6883
      }
    ]
  },
  "listErrors": []
}
```

---

**PUT /api/events/{id} - EventUpdateCommand:**

```json
{
  "name": "Tech Conference 2024 - Updated",
  "slug": "tech-conference-2024",
  "subtitle": "Future of Technology and Innovation",
  "description": "Updated description...",
  "tags": [
    { "name": "Technology" },
    { "name": "Conference" }
  ],
  "startTime": "2024-06-05T09:00:00Z",
  "endTime": "2024-06-05T18:00:00Z",
  "openTime": "09:00",
  "closedTime": "18:00",
  "status": "Published",
  "thumbnailUrl": "https://example.com/thumb-new.jpg",
  "bannerUrl": "https://example.com/banner-new.jpg",
  "ageRestriction": 16,
  "categoryId": "550e8400-e29b-41d4-a716-446655440007",
  "organizerId": "550e8400-e29b-41d4-a716-446655440008"
}
```

**EventUpdateResponse:**
```json
{
  "isSuccess": true,
  "message": "Event updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440009",
    "name": "Tech Conference 2024 - Updated",
    "slug": "tech-conference-2024",
    "subtitle": "Future of Technology and Innovation",
    "status": "Published"
  },
  "listErrors": []
}
```

---

**DELETE /api/events/{id}:**

**EventDeleteResponse:**
```json
{
  "isSuccess": true,
  "message": "Event deleted successfully",
  "data": null,
  "listErrors": []
}
```

---

**PATCH /api/events/{id}:**

**EventRestoreResponse:**
```json
{
  "isSuccess": true,
  "message": "Event restored successfully",
  "data": null,
  "listErrors": []
}
```

---

#### 2. Category Controller (`/api/categories`)

**Purpose:** Manage event categories (requires authorization for list).

##### Endpoints:

| HTTP Method | Endpoint | Request | Response | Status Code | Authorization | Notes |
|---|---|---|---|---|---|---|
| **GET** | `/api/categories` | `CategoryGetListQuery` | `CategoryGetListResponse` | 200/400 | Required | Get all categories |
| **GET** | `/api/categories/{id}` | `CategoryGetByIdQuery` | `CategoryGetByIdResponse` | 200/400 | - | Get category by ID |
| **POST** | `/api/categories` | `CategoryCreateCommand` | `CategoryCreateResponse` | 201/400 | - | Create new category |
| **PUT** | `/api/categories/{id}` | `CategoryUpdateCommand` | `CategoryUpdateResponse` | 200/400 | - | Update category |
| **DELETE** | `/api/categories/{id}` | - | `CategoryDeleteResponse` | 200/400 | - | Hard delete category |
| **PATCH** | `/api/categories/{id}` | - | `CategoryRestoreResponse` | 200/400 | - | Restore soft-deleted category |

##### Request/Response Models:

**POST /api/categories - CategoryCreateCommand:**

```json
{
  "name": "Music & Concerts",
  "slug": "music-concerts",
  "description": "Live music events and concerts",
  "iconUrl": "https://example.com/icons/music.png",
  "status": "Active",
  "parentCategoryId": null
}
```

**CategoryCreateResponse:**
```json
{
  "isSuccess": true,
  "message": "Category created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440011",
    "name": "Music & Concerts",
    "slug": "music-concerts",
    "description": "Live music events and concerts",
    "iconUrl": "https://example.com/icons/music.png",
    "status": "Active",
    "parentCategory": null,
    "subCategories": []
  },
  "listErrors": []
}
```

---

**GET /api/categories - CategoryGetListQuery:**

Query Parameters:
```json
{
  "pageNumber": 1,
  "pageSize": 50,
  "name": null,
  "status": null,
  "fields": "id,name,slug,description"
}
```

**CategoryGetListResponse:**
```json
{
  "isSuccess": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440007",
      "name": "Technology",
      "slug": "technology",
      "description": "Tech conferences and workshops",
      "iconUrl": "https://example.com/icons/tech.png",
      "status": "Active",
      "parentCategory": null,
      "subCategories": []
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440011",
      "name": "Music & Concerts",
      "slug": "music-concerts",
      "description": "Live music events and concerts",
      "iconUrl": "https://example.com/icons/music.png",
      "status": "Active",
      "parentCategory": null,
      "subCategories": []
    }
  ]
}
```

---

**GET /api/categories/{id} - CategoryGetByIdQuery:**

**CategoryGetByIdResponse:**
```json
{
  "isSuccess": true,
  "message": "Category retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440007",
    "name": "Technology",
    "slug": "technology",
    "description": "Tech conferences and workshops",
    "iconUrl": "https://example.com/icons/tech.png",
    "status": "Active",
    "parentCategory": null,
    "subCategories": []
  },
  "listErrors": []
}
```

---

**PUT /api/categories/{id} - CategoryUpdateCommand:**

```json
{
  "name": "Music & Concerts",
  "slug": "music-concerts",
  "description": "Updated: Live music events, concerts, and festivals",
  "iconUrl": "https://example.com/icons/music-new.png",
  "status": "Active",
  "parentCategoryId": null
}
```

**CategoryUpdateResponse:**
```json
{
  "isSuccess": true,
  "message": "Category updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440011",
    "name": "Music & Concerts",
    "slug": "music-concerts",
    "description": "Updated: Live music events, concerts, and festivals",
    "status": "Active"
  },
  "listErrors": []
}
```

---

**DELETE /api/categories/{id}:**

**CategoryDeleteResponse:**
```json
{
  "isSuccess": true,
  "message": "Category deleted successfully",
  "data": null,
  "listErrors": []
}
```

---

**PATCH /api/categories/{id}:**

**CategoryRestoreResponse:**
```json
{
  "isSuccess": true,
  "message": "Category restored successfully",
  "data": null,
  "listErrors": []
}
```

---

#### 3. Organizer Controller (`/api/organizers`)

**Purpose:** Manage event organizers.

##### Endpoints:

| HTTP Method | Endpoint | Request | Response | Status Code | Notes |
|---|---|---|---|---|---|
| **GET** | `/api/organizers` | `OrganizerGetListQuery` | `OrganizerGetListResponse` | 200/400 | Get all organizers |
| **GET** | `/api/organizers/{id}` | `OrganizerGetByIdQuery` | `OrganizerGetByIdResponse` | 200/400 | Get organizer by ID |
| **POST** | `/api/organizers` | `OrganizerCreateCommand` | `OrganizerCreateResponse` | 201/400 | Create new organizer |
| **PUT** | `/api/organizers/{id}` | `OrganizerUpdateCommand` | `OrganizerUpdateResponse` | 200/400 | Update organizer |
| **DELETE** | `/api/organizers/{id}` | - | `OrganizerDeleteResponse` | 200/400 | Hard delete organizer |
| **PATCH** | `/api/organizers/{id}` | - | `OrganizerRestoreResponse` | 200/400 | Restore soft-deleted organizer |

##### Request/Response Models:

**POST /api/organizers - OrganizerCreateCommand:**

```json
{
  "name": "Tech Leaders",
  "slug": "tech-leaders",
  "description": "We organize innovative tech conferences and workshops",
  "logoUrl": "https://example.com/logo.png",
  "bannerUrl": "https://example.com/banner.jpg",
  "email": "contact@techleaders.com",
  "phone": "0912345678",
  "websiteUrl": "https://techleaders.com",
  "facebookUrl": "https://facebook.com/techleaders",
  "instagramUrl": "https://instagram.com/techleaders",
  "tiktokUrl": "https://tiktok.com/@techleaders",
  "address": "123 Tech Street, City",
  "isVerified": false,
  "status": "Pending"
}
```

**OrganizerCreateResponse:**
```json
{
  "isSuccess": true,
  "message": "Organizer created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440008",
    "name": "Tech Leaders",
    "slug": "tech-leaders",
    "description": "We organize innovative tech conferences and workshops",
    "logoUrl": "https://example.com/logo.png",
    "bannerUrl": "https://example.com/banner.jpg",
    "email": "contact@techleaders.com",
    "phone": "0912345678",
    "websiteUrl": "https://techleaders.com",
    "facebookUrl": "https://facebook.com/techleaders",
    "instagramUrl": "https://instagram.com/techleaders",
    "tiktokUrl": "https://tiktok.com/@techleaders",
    "address": "123 Tech Street, City",
    "isVerified": false,
    "status": "Pending",
    "createdAt": "2024-02-16T10:30:00Z",
    "updatedAt": null,
    "events": []
  },
  "listErrors": []
}
```

---

**GET /api/organizers - OrganizerGetListQuery:**

Query Parameters:
```json
{
  "pageNumber": 1,
  "pageSize": 20,
  "name": null,
  "status": null,
  "fields": "id,name,slug,email,phone"
}
```

**OrganizerGetListResponse:**
```json
{
  "isSuccess": true,
  "message": "Organizers retrieved successfully",
  "data": {
    "totalCount": 50,
    "pageNumber": 1,
    "pageSize": 20,
    "totalPage": 3,
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440008",
        "name": "Tech Leaders",
        "slug": "tech-leaders",
        "email": "contact@techleaders.com",
        "phone": "0912345678",
        "status": "Pending"
      }
    ]
  }
}
```

---

**PUT /api/organizers/{id} - OrganizerUpdateCommand:**

```json
{
  "name": "Tech Leaders International",
  "slug": "tech-leaders-intl",
  "description": "Global tech conference organizer",
  "logoUrl": "https://example.com/logo-new.png",
  "email": "info@techleaders.com",
  "phone": "0912345679",
  "websiteUrl": "https://techleaders.com",
  "status": "Active"
}
```

**OrganizerUpdateResponse:**
```json
{
  "isSuccess": true,
  "message": "Organizer updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440008",
    "name": "Tech Leaders International",
    "email": "info@techleaders.com",
    "status": "Active"
  },
  "listErrors": []
}
```

---

**GET /api/organizers/{id} - OrganizerGetByIdQuery:**

**OrganizerGetByIdResponse:**
```json
{
  "isSuccess": true,
  "message": "Organizer retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440008",
    "name": "Tech Leaders",
    "slug": "tech-leaders",
    "description": "We organize innovative tech conferences and workshops",
    "logoUrl": "https://example.com/logo.png",
    "email": "contact@techleaders.com",
    "phone": "0912345678",
    "websiteUrl": "https://techleaders.com",
    "isVerified": true,
    "status": "Active",
    "createdAt": "2024-02-16T10:30:00Z",
    "updatedAt": "2024-02-16T15:45:00Z",
    "events": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440009",
        "name": "Tech Conference 2024"
      }
    ]
  },
  "listErrors": []
}
```

---

**DELETE /api/organizers/{id}:**

**OrganizerDeleteResponse:**
```json
{
  "isSuccess": true,
  "message": "Organizer deleted successfully",
  "data": null,
  "listErrors": []
}
```

---

**PATCH /api/organizers/{id}:**

**OrganizerRestoreResponse:**
```json
{
  "isSuccess": true,
  "message": "Organizer restored successfully",
  "data": null,
  "listErrors": []
}
```

---

#### 4. Event Review Controller (`/api/eventreviews`)

**Purpose:** Manage user reviews for events.

##### Endpoints:

| HTTP Method | Endpoint | Request | Response | Status Code | Notes |
|---|---|---|---|---|---|
| **GET** | `/api/eventreviews` | `EventReviewGetListQuery` | `EventReviewGetListResponse` | 200/400 | Get reviews (paginated) |
| **GET** | `/api/eventreviews/{id}` | `EventReviewGetByIdQuery` | `EventReviewGetByIdResponse` | 200/400 | Get review by ID |
| **POST** | `/api/eventreviews` | `EventReviewCreateCommand` | `EventReviewCreateResponse` | 201/400 | Create new review |
| **PUT** | `/api/eventreviews/{id}` | `EventReviewUpdateCommand` | `EventReviewUpdateResponse` | 200/400 | Update review |
| **DELETE** | `/api/eventreviews/{id}` | - | `EventReviewDeleteResponse` | 200/400 | Hard delete review |
| **PATCH** | `/api/eventreviews/{id}` | - | `EventReviewRestoreResponse` | 200/400 | Restore soft-deleted review |

##### Request/Response Models:

**POST /api/eventreviews - EventReviewCreateCommand:**

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440009",
  "userId": "550e8400-e29b-41d4-a716-446655440002",
  "rating": 5,
  "comment": "Excellent event! Great organization and amazing speakers.",
  "parentReviewId": null
}
```

**EventReviewCreateResponse:**
```json
{
  "isSuccess": true,
  "message": "Review created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440012",
    "eventId": "550e8400-e29b-41d4-a716-446655440009",
    "userId": "550e8400-e29b-41d4-a716-446655440002",
    "rating": 5,
    "comment": "Excellent event! Great organization and amazing speakers.",
    "parentReviewId": null
  },
  "listErrors": []
}
```

---

**GET /api/eventreviews - EventReviewGetListQuery:**

Query Parameters:
```json
{
  "pageNumber": 1,
  "pageSize": 20,
  "eventId": "550e8400-e29b-41d4-a716-446655440009",
  "userId": null,
  "minRating": 1,
  "maxRating": 5,
  "fields": "id,rating,comment,userId",
  "isDescending": true,
  "isDeleted": false
}
```

**EventReviewGetListResponse:**
```json
{
  "isSuccess": true,
  "message": "Reviews retrieved successfully",
  "data": {
    "totalCount": 45,
    "pageNumber": 1,
    "pageSize": 20,
    "totalPage": 3,
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440012",
        "eventId": "550e8400-e29b-41d4-a716-446655440009",
        "userId": "550e8400-e29b-41d4-a716-446655440002",
        "rating": 5,
        "comment": "Excellent event!",
        "user": {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "fullName": "Jane Smith"
        }
      }
    ]
  }
}
```

---

**PUT /api/eventreviews/{id} - EventReviewUpdateCommand:**

```json
{
  "rating": 4,
  "comment": "Great event with minor organization issues"
}
```

**EventReviewUpdateResponse:**
```json
{
  "isSuccess": true,
  "message": "Review updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440012",
    "rating": 4,
    "comment": "Great event with minor organization issues"
  },
  "listErrors": []
}
```

---

**DELETE /api/eventreviews/{id}:**

**EventReviewDeleteResponse:**
```json
{
  "isSuccess": true,
  "message": "Review deleted successfully",
  "data": null,
  "listErrors": []
}
```

---

**PATCH /api/eventreviews/{id}:**

**EventReviewRestoreResponse:**
```json
{
  "isSuccess": true,
  "message": "Review restored successfully",
  "data": null,
  "listErrors": []
}
```

---

#### 5. Favorite Controller (`/api/favorites`)

**Purpose:** Manage user's favorite events.

##### Endpoints:

| HTTP Method | Endpoint | Request | Response | Status Code | Notes |
|---|---|---|---|---|---|
| **GET** | `/api/favorites` | `FavoriteGetListQuery` | `FavoriteGetListResponse` | 200/400 | Get user's favorites (paginated) |
| **GET** | `/api/favorites/{id}` | `FavoriteGetByIdQuery` | `FavoriteGetByIdResponse` | 200/400 | Get favorite by ID |
| **POST** | `/api/favorites` | `FavoriteCreateCommand` | `FavoriteCreateResponse` | 201/400 | Add event to favorites |
| **DELETE** | `/api/favorites/{userId}/{eventId}` | - | `FavoriteDeleteResponse` | 200/400 | Hard delete from favorites |
| **DELETE** | `/api/favorites/{userId}/{eventId}/soft` | - | `FavoriteSoftDeleteResponse` | 200/400 | Soft delete from favorites |
| **PATCH** | `/api/favorites/{userId}/{eventId}` | - | `FavoriteRestoreResponse` | 200/400 | Restore favorite |

##### Request/Response Models:

**POST /api/favorites - FavoriteCreateCommand:**

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440002",
  "eventId": "550e8400-e29b-41d4-a716-446655440009"
}
```

**FavoriteCreateResponse:**
```json
{
  "isSuccess": true,
  "message": "Event added to favorites successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440013",
    "userId": "550e8400-e29b-41d4-a716-446655440002",
    "eventId": "550e8400-e29b-41d4-a716-446655440009",
    "createdAt": "2024-02-16T12:00:00Z"
  },
  "listErrors": []
}
```

---

**GET /api/favorites - FavoriteGetListQuery:**

Query Parameters:
```json
{
  "pageNumber": 1,
  "pageSize": 20,
  "userId": "550e8400-e29b-41d4-a716-446655440002",
  "eventId": null,
  "fields": "id,userId,eventId",
  "isDescending": true,
  "isDeleted": false
}
```

**FavoriteGetListResponse:**
```json
{
  "isSuccess": true,
  "message": "Favorites retrieved successfully",
  "data": {
    "totalCount": 12,
    "pageNumber": 1,
    "pageSize": 20,
    "totalPage": 1,
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440013",
        "userId": "550e8400-e29b-41d4-a716-446655440002",
        "eventId": "550e8400-e29b-41d4-a716-446655440009",
        "event": {
          "id": "550e8400-e29b-41d4-a716-446655440009",
          "name": "Tech Conference 2024",
          "thumbnailUrl": "https://example.com/thumb.jpg"
        },
        "createdAt": "2024-02-16T12:00:00Z"
      }
    ]
  }
}
```

---

**GET /api/favorites/{id} - FavoriteGetByIdQuery:**

**FavoriteGetByIdResponse:**
```json
{
  "isSuccess": true,
  "message": "Favorite retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440013",
    "userId": "550e8400-e29b-41d4-a716-446655440002",
    "eventId": "550e8400-e29b-41d4-a716-446655440009",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "fullName": "Jane Smith"
    },
    "event": {
      "id": "550e8400-e29b-41d4-a716-446655440009",
      "name": "Tech Conference 2024"
    },
    "createdAt": "2024-02-16T12:00:00Z"
  },
  "listErrors": []
}
```

---

**DELETE /api/favorites/{userId}/{eventId}:**

**FavoriteDeleteResponse:**
```json
{
  "isSuccess": true,
  "message": "Favorite deleted successfully",
  "data": null,
  "listErrors": []
}
```

---

**DELETE /api/favorites/{userId}/{eventId}/soft:**

**FavoriteSoftDeleteResponse:**
```json
{
  "isSuccess": true,
  "message": "Favorite removed from list",
  "data": null,
  "listErrors": []
}
```

---

**PATCH /api/favorites/{userId}/{eventId}:**

**FavoriteRestoreResponse:**
```json
{
  "isSuccess": true,
  "message": "Favorite restored successfully",
  "data": null,
  "listErrors": []
}
```

---

#### 6. Event Interaction Controller (`/api/interactions`)

**Purpose:** Manage user interactions with events (likes, shares, views, etc.).

##### Endpoints:

| HTTP Method | Endpoint | Request | Response | Status Code | Notes |
|---|---|---|---|---|---|
| **GET** | `/api/interactions` | `InteractionGetListQuery` | `InteractionGetListResponse` | 200/400 | Get interactions (paginated) |
| **GET** | `/api/interactions/{id}` | `InteractionGetByIdQuery` | `InteractionGetByIdResponse` | 200/400 | Get interaction by ID |
| **POST** | `/api/interactions` | `InteractionCreateCommand` | `InteractionCreateResponse` | 201/400 | Record user interaction |
| **DELETE** | `/api/interactions/{userId}/{eventId}/{type}` | - | `InteractionDeleteResponse` | 200/400 | Hard delete interaction |
| **DELETE** | `/api/interactions/{userId}/{eventId}/{type}/soft` | - | `InteractionSoftDeleteResponse` | 200/400 | Soft delete interaction |
| **PATCH** | `/api/interactions/{userId}/{eventId}/{type}` | - | `InteractionRestoreResponse` | 200/400 | Restore interaction |

##### Interaction Types:
- `0` = View
- `1` = Like
- `2` = Share
- `3` = Comment

##### Request/Response Models:

**POST /api/interactions - InteractionCreateCommand:**

```json
{
  "type": 1,
  "eventId": "550e8400-e29b-41d4-a716-446655440009",
  "userId": "550e8400-e29b-41d4-a716-446655440002"
}
```

**InteractionCreateResponse:**
```json
{
  "isSuccess": true,
  "message": "Interaction recorded successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440014",
    "type": "Like",
    "eventId": "550e8400-e29b-41d4-a716-446655440009",
    "userId": "550e8400-e29b-41d4-a716-446655440002",
    "createdAt": "2024-02-16T13:15:00Z"
  },
  "listErrors": []
}
```

---

**GET /api/interactions - InteractionGetListQuery:**

Query Parameters:
```json
{
  "pageNumber": 1,
  "pageSize": 50,
  "userId": null,
  "eventId": "550e8400-e29b-41d4-a716-446655440009",
  "type": null,
  "fields": "id,type,userId,eventId",
  "isDescending": true,
  "isDeleted": false
}
```

**InteractionGetListResponse:**
```json
{
  "isSuccess": true,
  "message": "Interactions retrieved successfully",
  "data": {
    "totalCount": 234,
    "pageNumber": 1,
    "pageSize": 50,
    "totalPage": 5,
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440014",
        "type": "Like",
        "eventId": "550e8400-e29b-41d4-a716-446655440009",
        "userId": "550e8400-e29b-41d4-a716-446655440002",
        "user": {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "fullName": "Jane Smith"
        },
        "event": {
          "id": "550e8400-e29b-41d4-a716-446655440009",
          "name": "Tech Conference 2024"
        },
        "createdAt": "2024-02-16T13:15:00Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440015",
        "type": "View",
        "eventId": "550e8400-e29b-41d4-a716-446655440009",
        "userId": "550e8400-e29b-41d4-a716-446655440003",
        "createdAt": "2024-02-16T12:50:00Z"
      }
    ]
  }
}
```

---

**GET /api/interactions/{id} - InteractionGetByIdQuery:**

**InteractionGetByIdResponse:**
```json
{
  "isSuccess": true,
  "message": "Interaction retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440014",
    "type": "Like",
    "eventId": "550e8400-e29b-41d4-a716-446655440009",
    "userId": "550e8400-e29b-41d4-a716-446655440002",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "fullName": "Jane Smith"
    },
    "event": {
      "id": "550e8400-e29b-41d4-a716-446655440009",
      "name": "Tech Conference 2024"
    },
    "createdAt": "2024-02-16T13:15:00Z"
  },
  "listErrors": []
}
```

---

**DELETE /api/interactions/{userId}/{eventId}/{type}:**

**InteractionDeleteResponse:**
```json
{
  "isSuccess": true,
  "message": "Interaction deleted successfully",
  "data": null,
  "listErrors": []
}
```

---

**DELETE /api/interactions/{userId}/{eventId}/{type}/soft:**

**InteractionSoftDeleteResponse:**
```json
{
  "isSuccess": true,
  "message": "Interaction removed",
  "data": null,
  "listErrors": []
}
```

---

**PATCH /api/interactions/{userId}/{eventId}/{type}:**

**InteractionRestoreResponse:**
```json
{
  "isSuccess": true,
  "message": "Interaction restored successfully",
  "data": null,
  "listErrors": []
}
```

---

## TICKET SERVICE (Port 6201)

### Controllers and Endpoints

#### 1. Ticket Controller (`/api/tickets`)

**Purpose:** Manage individual tickets for events.

##### Endpoints:

| HTTP Method | Endpoint | Request | Response | Status Code | Notes |
|---|---|---|---|---|---|
| **GET** | `/api/tickets` | `TicketGetListQuery` | `TicketGetListResponse` | 200/400 | Get paginated list of tickets |
| **GET** | `/api/tickets/{id}` | `TicketGetByIdQuery` | `TicketGetByIdResponse` | 200/400 | Get ticket details by ID |
| **POST** | `/api/tickets` | `TicketCreateCommand` | `TicketCreateResponse` | 201/400 | Create new ticket |
| **PUT** | `/api/tickets/{id}` | `TicketUpdateCommand` | `TicketUpdateResponse` | 200/400 | Update ticket information |
| **DELETE** | `/api/tickets/{id}` | - | `TicketDeleteResponse` | 200/400 | Hard delete ticket |
| **PATCH** | `/api/tickets/{id}` | - | `TicketRestoreResponse` | 200/400 | Restore soft-deleted ticket |

##### Ticket Status Enum:
- `0` = Ready
- `1` = Sold
- `2` = Expired
- `3` = Cancelled

##### Request/Response Models:

**POST /api/tickets - TicketCreateCommand:**

```json
{
  "ticketTypeId": "550e8400-e29b-41d4-a716-446655440020",
  "eventId": "550e8400-e29b-41d4-a716-446655440009",
  "zone": "A1",
  "status": 0
}
```

**TicketCreateResponse:**
```json
{
  "isSuccess": true,
  "message": "Ticket created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440030",
    "ticketType": {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "name": "VIP",
      "price": 150.00
    },
    "event": {
      "id": "550e8400-e29b-41d4-a716-446655440009",
      "name": "Tech Conference 2024"
    },
    "zone": "A1",
    "status": "Ready",
    "createdAt": "2024-02-16T14:20:00Z"
  },
  "listErrors": []
}
```

---

**GET /api/tickets - TicketGetListQuery:**

Query Parameters:
```json
{
  "pageNumber": 1,
  "pageSize": 50,
  "ticketTypeId": null,
  "eventId": "550e8400-e29b-41d4-a716-446655440009",
  "zone": null,
  "status": null,
  "fields": "id,zone,status,createdAt",
  "hasEvent": false,
  "hasType": false,
  "isDescending": false,
  "isDeleted": false
}
```

**TicketGetListResponse:**
```json
{
  "isSuccess": true,
  "message": "Tickets retrieved successfully",
  "data": {
    "totalCount": 500,
    "pageNumber": 1,
    "pageSize": 50,
    "totalPage": 10,
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440030",
        "ticketType": {
          "id": "550e8400-e29b-41d4-a716-446655440020",
          "name": "VIP",
          "price": 150.00
        },
        "event": {
          "id": "550e8400-e29b-41d4-a716-446655440009",
          "name": "Tech Conference 2024"
        },
        "zone": "A1",
        "status": "Ready",
        "createdAt": "2024-02-16T14:20:00Z"
      }
    ]
  }
}
```

---

**GET /api/tickets/{id} - TicketGetByIdQuery:**

Query Parameters:
```json
{
  "fields": "id,zone,status,ticketType,event",
  "hasEvent": true,
  "hasType": true
}
```

**TicketGetByIdResponse:**
```json
{
  "isSuccess": true,
  "message": "Ticket retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440030",
    "ticketType": {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "name": "VIP",
      "price": 150.00,
      "totalQuantity": 100,
      "availableQuantity": 85,
      "description": "VIP access with premium seating"
    },
    "event": {
      "id": "550e8400-e29b-41d4-a716-446655440009",
      "name": "Tech Conference 2024",
      "startTime": "2024-06-01T09:00:00Z",
      "endTime": "2024-06-01T17:00:00Z"
    },
    "zone": "A1",
    "status": "Ready",
    "createdAt": "2024-02-16T14:20:00Z"
  },
  "listErrors": []
}
```

---

**PUT /api/tickets/{id} - TicketUpdateCommand:**

```json
{
  "ticketTypeId": "550e8400-e29b-41d4-a716-446655440020",
  "zone": "B2",
  "status": 1
}
```

**TicketUpdateResponse:**
```json
{
  "isSuccess": true,
  "message": "Ticket updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440030",
    "zone": "B2",
    "status": "Sold"
  },
  "listErrors": []
}
```

---

**DELETE /api/tickets/{id}:**

**TicketDeleteResponse:**
```json
{
  "isSuccess": true,
  "message": "Ticket deleted successfully",
  "data": null,
  "listErrors": []
}
```

---

**PATCH /api/tickets/{id}:**

**TicketRestoreResponse:**
```json
{
  "isSuccess": true,
  "message": "Ticket restored successfully",
  "data": null,
  "listErrors": []
}
```

---

#### 2. Ticket Type Controller (`/api/tickettypes`)

**Purpose:** Manage ticket types (categories of tickets) for events.

##### Endpoints:

| HTTP Method | Endpoint | Request | Response | Status Code | Notes |
|---|---|---|---|---|---|
| **GET** | `/api/tickettypes` | `TicketTypeGetListQuery` | `TicketTypeGetListResponse` | 200/400 | Get paginated list of ticket types |
| **GET** | `/api/tickettypes/{id}` | `TicketTypeGetByIdQuery` | `TicketTypeGetByIdResponse` | 200/400 | Get ticket type by ID |
| **POST** | `/api/tickettypes` | `TicketTypeCreateCommand` | `TicketTypeCreateResponse` | 201/400 | Create new ticket type |
| **PUT** | `/api/tickettypes/{id}` | `TicketTypeUpdateCommand` | `TicketTypeUpdateResponse` | 200/400 | Update ticket type |
| **DELETE** | `/api/tickettypes/{id}` | - | `TicketTypeDeleteResponse` | 200/400 | Hard delete ticket type |
| **PATCH** | `/api/tickettypes/{id}` | - | `TicketTypeRestoreResponse` | 200/400 | Restore soft-deleted ticket type |

##### Request/Response Models:

**POST /api/tickettypes - TicketTypeCreateCommand:**

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440009",
  "name": "VIP",
  "price": 150.00,
  "totalQuantity": 100,
  "availableQuantity": 100,
  "description": "VIP access with premium seating and exclusive lounge"
}
```

**TicketTypeCreateResponse:**
```json
{
  "isSuccess": true,
  "message": "Ticket type created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "eventId": "550e8400-e29b-41d4-a716-446655440009",
    "name": "VIP",
    "price": 150.00,
    "totalQuantity": 100,
    "availableQuantity": 100,
    "description": "VIP access with premium seating and exclusive lounge",
    "createdAt": "2024-02-16T11:30:00Z"
  },
  "listErrors": []
}
```

---

**GET /api/tickettypes - TicketTypeGetListQuery:**

Query Parameters:
```json
{
  "pageNumber": 1,
  "pageSize": 20,
  "eventId": "550e8400-e29b-41d4-a716-446655440009",
  "name": null,
  "fromPrice": 0.00,
  "toPrice": 1000.00,
  "description": null,
  "fields": "id,name,price,totalQuantity,availableQuantity"
}
```

**TicketTypeGetListResponse:**
```json
{
  "isSuccess": true,
  "message": "Ticket types retrieved successfully",
  "data": {
    "totalCount": 4,
    "pageNumber": 1,
    "pageSize": 20,
    "totalPage": 1,
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440020",
        "eventId": "550e8400-e29b-41d4-a716-446655440009",
        "name": "VIP",
        "price": 150.00,
        "totalQuantity": 100,
        "availableQuantity": 85,
        "description": "VIP access with premium seating"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440021",
        "eventId": "550e8400-e29b-41d4-a716-446655440009",
        "name": "Standard",
        "price": 50.00,
        "totalQuantity": 500,
        "availableQuantity": 420,
        "description": "Standard event ticket"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440022",
        "eventId": "550e8400-e29b-41d4-a716-446655440009",
        "name": "Student",
        "price": 30.00,
        "totalQuantity": 200,
        "availableQuantity": 180,
        "description": "Student discount ticket"
      }
    ]
  }
}
```

---

**GET /api/tickettypes/{id} - TicketTypeGetByIdQuery:**

Query Parameters:
```json
{
  "fields": "id,name,price,totalQuantity,availableQuantity,description,eventId"
}
```

**TicketTypeGetByIdResponse:**
```json
{
  "isSuccess": true,
  "message": "Ticket type retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "eventId": "550e8400-e29b-41d4-a716-446655440009",
    "name": "VIP",
    "price": 150.00,
    "totalQuantity": 100,
    "availableQuantity": 85,
    "description": "VIP access with premium seating and exclusive lounge access",
    "event": {
      "id": "550e8400-e29b-41d4-a716-446655440009",
      "name": "Tech Conference 2024",
      "startTime": "2024-06-01T09:00:00Z",
      "endTime": "2024-06-01T17:00:00Z"
    },
    "createdAt": "2024-02-16T11:30:00Z",
    "updatedAt": "2024-02-16T15:45:00Z"
  },
  "listErrors": []
}
```

---

**PUT /api/tickettypes/{id} - TicketTypeUpdateCommand:**

```json
{
  "name": "VIP Premium",
  "price": 175.00,
  "totalQuantity": 100,
  "availableQuantity": 85,
  "description": "VIP Premium access with extra benefits"
}
```

**TicketTypeUpdateResponse:**
```json
{
  "isSuccess": true,
  "message": "Ticket type updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "name": "VIP Premium",
    "price": 175.00,
    "totalQuantity": 100,
    "availableQuantity": 85,
    "description": "VIP Premium access with extra benefits"
  },
  "listErrors": []
}
```

---

**DELETE /api/tickettypes/{id}:**

**TicketTypeDeleteResponse:**
```json
{
  "isSuccess": true,
  "message": "Ticket type deleted successfully",
  "data": null,
  "listErrors": []
}
```

---

**PATCH /api/tickettypes/{id}:**

**TicketTypeRestoreResponse:**
```json
{
  "isSuccess": true,
  "message": "Ticket type restored successfully",
  "data": null,
  "listErrors": []
}
```

---

## Response Structure

All responses follow a standardized wrapper structure:

```csharp
{
  "isSuccess": true,
  "message": "Operation successful",
  "statusCode": 200,
  "data": {
    // Response data here
  },
  "listErrors": [
    {
      "field": "email",
      "detail": "Email already exists"
    }
  ]
}
```

### Error Response Format:

```csharp
{
  "isSuccess": false,
  "message": "Operation failed",
  "statusCode": 400,
  "data": null,
  "listErrors": [
    {
      "field": "fieldName",
      "detail": "Error description"
    }
  ]
}
```

---

## Common Query Parameters

Most list endpoints support these pagination and filtering parameters:

- **pageNumber** (int): Page number (default: 1)
- **pageSize** (int): Items per page (default: 10)
- **fields** (string): Comma-separated field names to include
- **isDeleted** (bool): Include soft-deleted items
- **isDescending** (bool): Sort in descending order

---

## Soft Delete vs Hard Delete

- **Soft Delete (DELETE `/path/soft` or implied):** Marks record as deleted but preserves data
- **Hard Delete (DELETE `/path`):** Permanently removes record from database
- **Restore (PATCH `/path`):** Recovers soft-deleted records

---

## Status Codes Summary

| Code | Meaning |
|---|---|
| **200** | OK - Request successful |
| **201** | Created - Resource successfully created |
| **400** | Bad Request - Invalid input or operation failed |
| **401** | Unauthorized - Missing or invalid token |
| **403** | Forbidden - User lacks permissions |
| **404** | Not Found - Resource doesn't exist |
| **500** | Internal Server Error |

---

## Architecture Notes

- **CQRS Pattern:** Commands (write operations) and Queries (read operations) are separated
- **MediatR:** Used for handling requests through pipelines and handlers
- **DTOs:** Data Transfer Objects for request/response serialization
- **Entity Framework Core:** ORM for database operations
- **Multi-tenant Support:** System supports location-based data filtering
- **Soft Delete:** Records are marked as deleted rather than permanently removed

---

## Docker Deployment

Services are containerized and can be deployed via `docker-compose.yml`:

```bash
docker-compose up
```

All services will start on their designated ports and register with the API Gateway.

---

## Integration Events

Services communicate asynchronously through integration events via RabbitMQ/Message Bus:

- **SendOtpRegisterEvent:** Triggered when user registers
- **SendChangeEmailEmailEvent:** Triggered when email change is verified
- **SendFirstLoginGoogleEmailEvent:** Triggered on first Google login
- **SendForgotPasswordEmailEvent:** Triggered when password reset requested
- Custom domain events for each service operation

---

## Client Integration Examples

### Authentication Flow:

1. User registers: `POST /api/auth/register`
2. Verify email: `POST /api/auth/verify-register`
3. User logs in: `POST /api/auth/login`
4. Receive JWT token in response
5. Include token in subsequent requests: `Authorization: Bearer <token>`

### Event Discovery:

1. Browse categories: `GET /api/categories`
2. List events: `GET /api/events?pageNumber=1&pageSize=20`
3. Get event details: `GET /api/events/{eventId}`
4. View event reviews: `GET /api/eventreviews?eventId={eventId}`

### Ticket Purchase:

1. Get ticket types: `GET /api/tickettypes?eventId={eventId}`
2. Create booking: `POST /api/bookings`
3. Process payment: `POST /api/paymentmethods`
4. Receive tickets: `GET /api/tickets?eventId={eventId}&status=Sold`
