# Uber Backend API Documentation

## Overview
This is the backend API for the Uber clone application built with Node.js, Express, and MongoDB.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn package manager

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```
   PORT=4000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/uber
   JWT_SECRET=your-secret-key
   FRONTEND_URL=http://localhost:3000
   ```
4. Start the server: `npm run dev`

## API Endpoints

### Authentication

#### POST /api/users/register
Register a new user account.

**Description:** Creates a new user account with email, password, and full name. Returns user data and authentication token.

**Request URL:** `POST http://localhost:4000/api/users/register`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": {
    "firstName": "John",
    "lastName": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

**Request Body Validation:**
- `fullName.firstName`: Required, minimum 3 characters
- `fullName.lastName`: Optional, minimum 3 characters if provided
- `email`: Required, valid email format, minimum 5 characters
- `password`: Required, minimum 6 characters

**Response Status Codes:**

| Status Code | Description |
|-------------|-------------|
| 201 | User created successfully |
| 400 | Bad request - Validation errors or user already exists |
| 500 | Internal server error |

**Success Response (201):**
```json
{
  "user": {
    "_id": "64f8b1c2d4e5f6a7b8c9d0e1",
    "fullName": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "email": "john.doe@example.com",
    "createdAt": "2023-09-07T10:30:00.000Z",
    "updatedAt": "2023-09-07T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (400 - Validation):**
```json
{
  "errors": [
    {
      "msg": "First name is required",
      "param": "fullName.firstName",
      "location": "body"
    },
    {
      "msg": "Valid email is required",
      "param": "email",
      "location": "body"
    }
  ]
}
```

**Error Response (400 - User Exists):**
```json
{
  "error": "User already exists"
}
```

**Error Response (500):**
```json
{
  "error": "Failed to hash password"
}
```

## Data Models

### User Model
```javascript
{
  fullName: {
    firstName: String (required, min: 3 chars),
    lastName: String (min: 3 chars)
  },
  email: String (required, unique, min: 5 chars),
  password: String (required, hashed),
  socketId: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port number | 4000 |
| MONGODB_URI | MongoDB connection string | mongodb+srv://... |
| JWT_SECRET | Secret key for JWT tokens | your-secret-key |
| FRONTEND_URL | Frontend application URL | http://localhost:3000 |

## Testing with Postman

1. Set method to `POST`
2. Set URL to `http://localhost:4000/api/users/register`
3. Set header: `Content-Type: application/json`
4. Set body to raw JSON with the required fields
5. Send the request

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation with express-validator
- CORS configuration
- Password field excluded from queries by default

## Error Handling

The API uses consistent error response format:
- Validation errors return array of error objects
- Business logic errors return single error message
- All errors include appropriate HTTP status codes
