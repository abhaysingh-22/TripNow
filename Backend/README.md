# Uber Backend API Documentation

## Overview
This is the backend API for the Uber clone application built with Node.js, Express, and MongoDB.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn package manager
- Google Maps API key with Geocoding API, Distance Matrix API, and Places API enabled

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```
   PORT=4000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/uber
   JWT_SECRET=your-secret-key
   FRONTEND_URL=http://localhost:3000
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```
4. Start the server: `npm run dev`

## Dependencies

### Production Dependencies
- **express** (v5.1.0) - Web application framework for Node.js
- **mongoose** (v8.16.1) - MongoDB object modeling for Node.js
- **bcrypt** (v6.0.0) - Password hashing library
- **jsonwebtoken** (v9.0.2) - JWT token implementation
- **express-validator** (v7.2.1) - Middleware for input validation
- **cors** (v2.8.5) - Cross-Origin Resource Sharing middleware
- **cookie-parser** (v1.4.7) - Cookie parsing middleware
- **dotenv** (v17.0.1) - Environment variable loader
- **axios** (v1.11.0) - HTTP client for external API calls (Google Maps)

### Development Dependencies
- **nodemon** (v3.1.10) - Development server with hot reload

## API Endpoints

### Maps Management

#### GET /api/maps/geocode
Get coordinates (latitude, longitude) for a given address.

**Description:** Converts a human-readable address into geographic coordinates using Google Maps Geocoding API. This endpoint is protected and requires user authentication to prevent unauthorized API usage and costs.

**Request URL:** `GET http://localhost:4000/api/maps/geocode?address={address}`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```
**OR**
```
Cookie: token=<token>
```

**Authentication:** Required (JWT token via Authorization header or cookie)

**Query Parameters:**
- `address` (required): String - The address to geocode (e.g., "1600 Amphitheatre Parkway, Mountain View, CA")

**Response Status Codes:**

| Status Code | Description |
|-------------|-------------|
| 200 | Coordinates retrieved successfully |
| 400 | Bad request - Missing or invalid address parameter |
| 401 | Unauthorized - Invalid or missing token |
| 500 | Internal server error - Google Maps API error |

**Success Response (200):**
```json
{
  "latitude": 37.4219999,
  "longitude": -122.0840575
}
```

**Error Response (400 - Validation):**
```json
{
  "errors": [
    {
      "msg": "Invalid value",
      "param": "address",
      "location": "query"
    }
  ]
}
```

**Error Response (401 - Unauthorized):**
```json
{
  "error": "Authentication token is required"
}
```

**Error Response (500 - API Error):**
```json
{
  "error": "GoMaps.pro API key not set in environment variables."
}
```

#### GET /api/maps/distance-time
Get distance and duration between two locations.

**Description:** Calculates the distance and travel time between origin and destination addresses using Google Maps Distance Matrix API. Requires user authentication.

**Request URL:** `GET http://localhost:4000/api/maps/distance-time?origin={origin}&destination={destination}`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```
**OR**
```
Cookie: token=<token>
```

**Authentication:** Required (JWT token via Authorization header or cookie)

**Query Parameters:**
- `origin` (required): String - Starting location address
- `destination` (required): String - Destination location address

**Response Status Codes:**

| Status Code | Description |
|-------------|-------------|
| 200 | Distance and time retrieved successfully |
| 400 | Bad request - Missing origin or destination |
| 401 | Unauthorized - Invalid or missing token |
| 500 | Internal server error - Google Maps API error |

**Success Response (200):**
```json
{
  "distance": "15.2 km",
  "duration": "22 mins"
}
```

**Error Response (400 - Validation):**
```json
{
  "errors": [
    {
      "msg": "Invalid value",
      "param": "origin",
      "location": "query"
    },
    {
      "msg": "Invalid value",
      "param": "destination",
      "location": "query"
    }
  ]
}
```

**Error Response (500 - API Error):**
```json
{
  "error": "Failed to fetch distance and time: GoMaps.pro API error: ZERO_RESULTS"
}
```

#### GET /api/maps/suggestions
Get autocomplete suggestions for place search.

**Description:** Provides place autocomplete suggestions based on user input using Google Maps Places API. Helps users select accurate addresses. Requires user authentication.

**Request URL:** `GET http://localhost:4000/api/maps/suggestions?input={input}`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```
**OR**
```
Cookie: token=<token>
```

**Authentication:** Required (JWT token via Authorization header or cookie)

**Query Parameters:**
- `input` (required): String - Partial address or place name to get suggestions for

**Response Status Codes:**

| Status Code | Description |
|-------------|-------------|
| 200 | Suggestions retrieved successfully |
| 400 | Bad request - Missing or empty input parameter |
| 401 | Unauthorized - Invalid or missing token |
| 500 | Internal server error - Google Maps API error |

**Success Response (200):**
```json
[
  {
    "description": "New York, NY, USA",
    "matched_substrings": [
      {
        "length": 8,
        "offset": 0
      }
    ],
    "place_id": "ChIJOwg_06VPwokRYv534QaPC8g",
    "reference": "ChIJOwg_06VPwokRYv534QaPC8g",
    "structured_formatting": {
      "main_text": "New York",
      "main_text_matched_substrings": [
        {
          "length": 8,
          "offset": 0
        }
      ],
      "secondary_text": "NY, USA"
    },
    "terms": [
      {
        "offset": 0,
        "value": "New York"
      },
      {
        "offset": 10,
        "value": "NY"
      },
      {
        "offset": 14,
        "value": "USA"
      }
    ],
    "types": [
      "locality",
      "political",
      "geocode"
    ]
  }
]
```

**Error Response (400 - Validation):**
```json
{
  "errors": [
    {
      "msg": "Invalid value",
      "param": "input",
      "location": "query"
    }
  ]
}
```

**Error Response (500 - API Error):**
```json
{
  "error": "Failed to fetch suggestions: Input must be a non-empty string."
}
```

### Ride Management

#### POST /api/rides/create
Create a new ride request.

**Description:** Creates a new ride request with pickup and dropoff locations, calculates fare automatically based on distance, duration, and vehicle type. Generates an OTP for ride verification. Requires user authentication.

**Request URL:** `POST http://localhost:4000/api/rides/create`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```
**OR**
```
Cookie: token=<token>
```

**Authentication:** Required (JWT token via Authorization header or cookie)

**Request Body:**
```json
{
  "pickup": "Times Square, New York, NY, USA",
  "dropoff": "Central Park, New York, NY, USA",
  "vehicleType": "car"
}
```

**Request Body Validation:**
- `pickup` (required): String - Pickup location address, non-empty
- `dropoff` (required): String - Dropoff location address, non-empty
- `vehicleType` (required): String - Type of vehicle ("auto", "car", "motorcycle", "bike")

**Response Status Codes:**

| Status Code | Description |
|-------------|-------------|
| 201 | Ride created successfully |
| 400 | Bad request - Validation errors |
| 401 | Unauthorized - Invalid or missing token |
| 500 | Internal server error - Fare calculation or database error |

**Success Response (201):**
```json
{
  "_id": "64f8b1c2d4e5f6a7b8c9d0e1",
  "userId": "64f8b1c2d4e5f6a7b8c9d0e0",
  "pickupLocation": "Times Square, New York, NY, USA",
  "dropoffLocation": "Central Park, New York, NY, USA",
  "fare": 125.75,
  "status": "pending",
  "otp": "1234",
  "createdAt": "2023-09-07T10:30:00.000Z",
  "updatedAt": "2023-09-07T10:30:00.000Z",
  "__v": 0
}
```

**Error Response (400 - Validation):**
```json
{
  "errors": [
    {
      "msg": "Pickup location is required",
      "param": "pickup",
      "location": "body"
    },
    {
      "msg": "Dropoff location is required",
      "param": "dropoff",
      "location": "body"
    },
    {
      "msg": "Vehicle type is required",
      "param": "vehicleType",
      "location": "body"
    }
  ]
}
```

**Error Response (401 - Unauthorized):**
```json
{
  "error": "Authentication token is required"
}
```

**Error Response (500 - Fare Calculation Error):**
```json
{
  "error": "Failed to calculate fare: Could not retrieve distance or duration."
}
```

**Error Response (500 - Database Error):**
```json
{
  "error": "Failed to create ride: User ID, pickup location, dropoff location, and vehicle type are required."
}
```

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

#### POST /api/users/login
Authenticate an existing user.

**Description:** Authenticates a user with email and password. Returns user data and authentication token.

**Request URL:** `POST http://localhost:4000/api/users/login`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

**Request Body Validation:**
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters

**Response Status Codes:**

| Status Code | Description |
|-------------|-------------|
| 200 | Login successful |
| 400 | Bad request - Validation errors |
| 401 | Unauthorized - Invalid credentials |
| 500 | Internal server error |

**Success Response (200):**
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
      "msg": "Valid email is required",
      "param": "email",
      "location": "body"
    },
    {
      "msg": "Password must be at least 6 characters long",
      "param": "password",
      "location": "body"
    }
  ]
}
```

**Error Response (401 - Invalid Credentials):**
```json
{
  "error": "Invalid email or password"
}
```

**Error Response (500):**
```json
{
  "error": "Failed to generate auth token"
}
```

#### GET /api/users/profile
Get authenticated user's profile information.

**Description:** Retrieves the current user's profile data. Requires authentication token.

**Request URL:** `GET http://localhost:4000/api/users/profile`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```
**OR**
```
Cookie: token=<token>
```

**Authentication:** Required (JWT token via Authorization header or cookie)

**Response Status Codes:**

| Status Code | Description |
|-------------|-------------|
| 200 | Profile retrieved successfully |
| 401 | Unauthorized - Invalid or missing token |
| 404 | User not found |
| 500 | Internal server error |

**Success Response (200):**
```json
{
  "user": {
    "_id": "64f8b1c2d4e5f6a7b8c9d0e1",
    "fullName": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "email": "john.doe@example.com"
  },
  "message": "User profile retrieved successfully"
}
```

**Error Response (401 - Unauthorized):**
```json
{
  "error": "Authentication token is required"
}
```

**Error Response (401 - Blacklisted Token):**
```json
{
  "error": "Token is blacklisted, please log in again"
}
```

**Error Response (404 - User Not Found):**
```json
{
  "error": "User not found"
}
```

#### GET /api/users/logout
Logout the authenticated user.

**Description:** Logs out the current user by clearing the authentication cookie and blacklisting the token.

**Request URL:** `GET http://localhost:4000/api/users/logout`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```
**OR**
```
Cookie: token=<token>
```

**Authentication:** Required (JWT token via Authorization header or cookie)

**Response Status Codes:**

| Status Code | Description |
|-------------|-------------|
| 200 | Logout successful |
| 401 | Unauthorized - Invalid or missing token |
| 500 | Internal server error |

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Error Response (401 - Unauthorized):**
```json
{
  "error": "Authentication token is required"
}
```

**Error Response (500):**
```json
{
  "error": "Internal server error"
}
```

### Captain Management

#### POST /api/captains/register
Register a new captain account.

**Description:** Creates a new captain account with personal details and vehicle information. Returns success message and authentication token.

**Request URL:** `POST http://localhost:4000/api/captains/register`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": {
    "firstName": "John",
    "lastName": "Smith"
  },
  "email": "captain@example.com",
  "password": "securepassword123",
  "vehicle": {
    "color": "red",
    "numberPlate": "UP32BF7655",
    "capacity": "4",
    "typeofVehicle": "car"
  }
}
```

**Request Body Validation:**
- `fullName.firstName`: Required, non-empty string
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters
- `vehicle.color`: Required, non-empty string
- `vehicle.numberPlate`: Required, non-empty string
- `vehicle.capacity`: Required, numeric value
- `vehicle.typeofVehicle`: Required, must be one of: "car", "bike", "truck"

**Response Status Codes:**

| Status Code | Description |
|-------------|-------------|
| 201 | Captain registered successfully |
| 400 | Bad request - Validation errors or captain already exists |
| 500 | Internal server error |

**Success Response (201):**
```json
{
  "message": "Captain registered successfully",
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
      "msg": "Vehicle type is required",
      "param": "vehicle.typeofVehicle",
      "location": "body"
    }
  ]
}
```

**Error Response (400 - Captain Exists):**
```json
{
  "message": "Captain already exists"
}
```

**Error Response (500):**
```json
{
  "message": "Internal server error"
}
```

#### POST /api/captains/login
Authenticate an existing captain.

**Description:** Authenticates a captain with email and password. Returns success message and authentication token.

**Request URL:** `POST http://localhost:4000/api/captains/login`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "captain@example.com",
  "password": "securepassword123"
}
```

**Request Body Validation:**
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters

**Response Status Codes:**

| Status Code | Description |
|-------------|-------------|
| 200 | Login successful |
| 400 | Bad request - Validation errors or invalid credentials |
| 500 | Internal server error |

**Success Response (200):**
```json
{
  "message": "Captain logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (400 - Validation):**
```json
{
  "errors": [
    {
      "msg": "Invalid email address",
      "param": "email",
      "location": "body"
    },
    {
      "msg": "Password must be at least 6 characters long",
      "param": "password",
      "location": "body"
    }
  ]
}
```

**Error Response (400 - Invalid Credentials):**
```json
{
  "message": "Invalid email or password"
}
```

**Error Response (500):**
```json
{
  "message": "Internal server error"
}
```

#### GET /api/captains/profile
Get authenticated captain's profile information.

**Description:** Retrieves the current captain's profile data including vehicle information. Requires authentication token.

**Request URL:** `GET http://localhost:4000/api/captains/profile`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```
**OR**
```
Cookie: token=<token>
```

**Authentication:** Required (JWT token via Authorization header or cookie)

**Response Status Codes:**

| Status Code | Description |
|-------------|-------------|
| 200 | Profile retrieved successfully |
| 401 | Unauthorized - Invalid or missing token |
| 404 | Captain not found |
| 500 | Internal server error |

**Success Response (200):**
```json
{
  "message": "Captain profile fetched successfully",
  "captain": {
    "_id": "64f8b1c2d4e5f6a7b8c9d0e1",
    "fullName": {
      "firstName": "John",
      "lastName": "Smith"
    },
    "email": "captain@example.com",
    "status": "active",
    "vehicle": {
      "color": "red",
      "numberPlate": "UP32BF7655",
      "capacity": 4,
      "typeofVehicle": "car"
    },
    "location": {
      "latitude": null,
      "longitude": null
    },
    "createdAt": "2023-09-07T10:30:00.000Z",
    "updatedAt": "2023-09-07T10:30:00.000Z"
  }
}
```

**Error Response (401 - Unauthorized):**
```json
{
  "error": "Authentication token is required"
}
```

**Error Response (401 - Blacklisted Token):**
```json
{
  "error": "Token is blacklisted, please log in again"
}
```

**Error Response (404 - Captain Not Found):**
```json
{
  "error": "Captain not found"
}
```

**Error Response (500):**
```json
{
  "message": "Internal server error"
}
```

#### GET /api/captains/logout
Logout the authenticated captain.

**Description:** Logs out the current captain by clearing the authentication cookie and blacklisting the token.

**Request URL:** `GET http://localhost:4000/api/captains/logout`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```
**OR**
```
Cookie: token=<token>
```

**Authentication:** Required (JWT token via Authorization header or cookie)

**Response Status Codes:**

| Status Code | Description |
|-------------|-------------|
| 200 | Logout successful |
| 401 | Unauthorized - Invalid or missing token |
| 500 | Internal server error |

**Success Response (200):**
```json
{
  "message": "Captain logged out successfully"
}
```

**Error Response (401 - Unauthorized):**
```json
{
  "message": "Authentication token is required"
}
```

**Error Response (500):**
```json
{
  "message": "Internal server error"
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

### Captain Model
```javascript
{
  fullName: {
    firstName: String (required),
    lastName: String (optional)
  },
  email: String (required, unique, valid email),
  password: String (required, hashed),
  socketId: String (optional),
  status: String (enum: "active", "inactive", "banned", default: "active"),
  vehicle: {
    color: String (required),
    numberPlate: String (required, unique),
    capacity: Number (required),
    typeofVehicle: String (required, enum: "car", "bike", "truck")
  },
  location: {
    latitude: Number (optional),
    longitude: Number (optional)
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Ride Model
```javascript
{
  userId: ObjectId (required, ref: "User"),
  captainId: ObjectId (optional, ref: "Driver"),
  pickupLocation: String (required),
  dropoffLocation: String (required),
  fare: Number (required),
  status: String (enum: "pending", "in-progress", "completed", "cancelled", default: "pending"),
  duration: Number (optional),
  distance: Number (optional),
  paymentId: String (optional),
  orderId: String (optional),
  signature: String (optional),
  otp: String (required, excluded from queries by default),
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
| GOOGLE_MAPS_API_KEY | Google Maps API key for geocoding, distance matrix, and places API | your-google-maps-api-key |

## Testing with Postman

### User Authentication

#### Register User
1. Set method to `POST`
2. Set URL to `http://localhost:4000/api/users/register`
3. Set header: `Content-Type: application/json`
4. Set body to raw JSON with fullName, email, and password
5. Send the request

#### Login User
1. Set method to `POST`
2. Set URL to `http://localhost:4000/api/users/login`
3. Set header: `Content-Type: application/json`
4. Set body to raw JSON with email and password
5. Send the request

#### Get User Profile
1. Set method to `GET`
2. Set URL to `http://localhost:4000/api/users/profile`
3. Set header: `Authorization: Bearer <token>` (copy token from login response)
4. Send the request

#### Logout User
1. Set method to `GET`
2. Set URL to `http://localhost:4000/api/users/logout`
3. Set header: `Authorization: Bearer <token>`
4. Send the request

### Captain Authentication

#### Register Captain
1. Set method to `POST`
2. Set URL to `http://localhost:4000/api/captains/register`
3. Set header: `Content-Type: application/json`
4. Set body to raw JSON with fullName, email, password, and vehicle details
5. Send the request

#### Login Captain
1. Set method to `POST`
2. Set URL to `http://localhost:4000/api/captains/login`
3. Set header: `Content-Type: application/json`
4. Set body to raw JSON with email and password
5. Send the request

#### Get Captain Profile
1. Set method to `GET`
2. Set URL to `http://localhost:4000/api/captains/profile`
3. Set header: `Authorization: Bearer <token>` (copy token from login response)
4. Send the request

#### Logout Captain
1. Set method to `GET`
2. Set URL to `http://localhost:4000/api/captains/logout`
3. Set header: `Authorization: Bearer <token>`
4. Send the request

### Maps API Testing

#### Get Coordinates (Geocoding)
1. Set method to `GET`
2. Set URL to `http://localhost:4000/api/maps/geocode?address=Times Square, New York`
3. Set header: `Authorization: Bearer <token>` (use user or captain token)
4. Send the request

#### Get Distance and Time
1. Set method to `GET`
2. Set URL to `http://localhost:4000/api/maps/distance-time?origin=Times Square, New York&destination=Central Park, New York`
3. Set header: `Authorization: Bearer <token>` (use user or captain token)
4. Send the request

#### Get Place Suggestions
1. Set method to `GET`
2. Set URL to `http://localhost:4000/api/maps/suggestions?input=New York`
3. Set header: `Authorization: Bearer <token>` (use user or captain token)
4. Send the request

### Ride Management Testing

#### Create Ride
1. Set method to `POST`
2. Set URL to `http://localhost:4000/api/rides/create`
3. Set header: `Authorization: Bearer <token>` (use user token)
4. Set header: `Content-Type: application/json`
5. Set body to raw JSON:
   ```json
   {
     "pickup": "Times Square, New York, NY, USA",
     "dropoff": "Central Park, New York, NY, USA",
     "vehicleType": "car"
   }
   ```
6. Send the request

## API Usage Guidelines

### Google Maps API Integration
- All Maps API endpoints require user authentication to prevent unauthorized usage
- The application uses GoMaps.pro service (Google Maps API alternative)
- Ensure your API key has the following services enabled:
  - Geocoding API (for address to coordinates conversion)
  - Distance Matrix API (for distance and duration calculations)
  - Places API (for autocomplete suggestions)

### Rate Limiting Considerations
- Implement client-side caching for frequently requested locations
- Use debouncing for autocomplete suggestions to minimize API calls
- Consider implementing server-side caching for popular routes and locations

### Best Practices
- Always validate user input before making API calls
- Handle API errors gracefully and provide meaningful error messages
- Implement retry logic for transient API failures
- Monitor API usage and costs regularly

## Fare Calculation System

The ride service implements a dynamic fare calculation system based on distance, duration, and vehicle type. The system integrates with Google Maps API to get accurate distance and time estimates.

### Vehicle Types and Rates

| Vehicle Type | Base Fare (₹) | Per KM (₹) | Per Minute (₹) |
|--------------|---------------|------------|----------------|
| Auto | 25 | 12 | 2 |
| Car | 50 | 15 | 3 |
| Motorcycle/Bike | 20 | 8 | 1.5 |

### Fare Calculation Formula
```
Total Fare = Base Fare + (Distance in KM × Per KM Rate) + (Duration in Minutes × Per Minute Rate)
```

### Features
- Automatic distance and duration calculation using Google Maps Distance Matrix API
- Support for multiple distance units (km, m) and duration units (hours, minutes, seconds)
- Intelligent parsing of Google Maps API responses
- Fallback to default vehicle rates if invalid vehicle type is provided
- Fare rounded to 2 decimal places for accuracy

## Error Handling

The API uses consistent error response format:
- Validation errors return array of error objects
- Business logic errors return single error message
- All errors include appropriate HTTP status codes
- Authentication errors use 401 status code
