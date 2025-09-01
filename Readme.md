# TripNow - Ride-Hailing Application

TripNow is a full-stack ride-hailing application inspired by other Riding apps, built with modern web technologies. It allows users to book rides, captains to accept and manage rides, and includes real-time tracking, payment integration, and location services.

## Features

- **User Management**: Registration, login, profile management for users and captains
- **Ride Booking**: Search locations, select vehicles, calculate fares, book rides
- **Real-Time Communication**: Socket.io integration for live updates between users and captains
- **Location Services**: Google Maps integration for geocoding, distance calculation, and place suggestions
- **Payment Processing**: Razorpay integration for secure UPI payments
- **Live Tracking**: Real-time captain location updates during rides
- **OTP Verification**: Secure ride start with OTP sharing
- **Responsive Design**: Mobile-first UI with Tailwind CSS

## Tech Stack

### Frontend
- **React** (v19.1.0) - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router DOM** - Client-side routing
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Hot Toast** - Notification system

### Backend
- **Node.js** with **Express** (v5.1.0) - Server framework
- **MongoDB** with **Mongoose** (v8.16.1) - Database and ODM
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Express Validator** - Input validation
- **Razorpay** - Payment gateway integration

## Project Structure

```
TripNow/
├── Frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context providers
│   │   ├── hooks/           # Custom React hooks
│   │   └── assets/          # Static assets
│   ├── package.json
│   └── vite.config.js
├── Backend/                  # Node.js backend API
│   ├── controllers/         # Route handlers
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API routes
│   ├── services/            # Business logic services
│   ├── middlewares/         # Express middlewares
│   ├── db/                  # Database connection
│   ├── package.json
│   └── server.js
├── .gitignore
└── Readme.md               # This file
```

## External APIs

- **Google Maps API**: Used for location services including:
  - Geocoding (address to coordinates)
  - Distance Matrix (distance and duration calculation)
  - Places API (autocomplete suggestions)
- **Razorpay API**: Payment processing for UPI transactions

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd TripNow
   ```

2. **Setup Backend**:
   ```bash
   cd Backend
   npm install
   ```

3. **Setup Frontend**:
   ```bash
   cd ../Frontend
   npm install
   ```

### Environment Configuration

Create `.env` files in both `Backend` and `Frontend` directories.

#### `Backend/.env`
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/tripnow
JWT_SECRET=your-jwt-secret-key
FRONTEND_URL=http://localhost:5173
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

#### `Frontend/.env`
```env
VITE_BASE_URL=http://localhost:3000
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Database Setup
- Ensure MongoDB is running locally or update `MONGODB_URI` for Atlas
- The application will automatically create collections on first run

### Running the Application

1. **Start Backend**:
   ```bash
   cd Backend
   npm run dev
   ```
   Server will run on `http://localhost:3000`

2. **Start Frontend**:
   ```bash
   cd Frontend
   npm run dev
   ```
   Application will run on `http://localhost:5173`

### API Testing
Use tools like Postman to test backend endpoints. Refer to `Backend/README.md` for detailed API documentation.

## Dependencies

### Backend Dependencies
- express: ^5.1.0
- mongoose: ^8.16.1
- bcrypt: ^6.0.0
- jsonwebtoken: ^9.0.2
- socket.io: ^4.8.1
- axios: ^1.11.0
- razorpay: ^2.9.6
- express-validator: ^7.2.1
- cors: ^2.8.5
- cookie-parser: ^1.4.7
- dotenv: ^17.0.1

### Frontend Dependencies
- react: ^19.1.0
- react-dom: ^19.1.0
- @vitejs/plugin-react: ^4.6.0
- tailwindcss: ^4.1.11
- framer-motion: ^12.23.6
- react-router-dom: ^7.6.3
- socket.io-client: ^4.8.1
- axios: ^1.10.0
- react-hot-toast: ^2.5.2
- @heroicons/react: ^2.2.0

## Usage

1. **User Registration/Login**: Users can sign up as riders or captains
2. **Ride Booking**: Enter pickup/dropoff locations, select vehicle type, confirm ride
3. **Captain Acceptance**: Nearby captains receive ride requests and can accept
4. **Real-Time Tracking**: Live location updates during the ride
5. **Payment**: Secure UPI payment via Razorpay at ride completion
6. **OTP Verification**: Share OTP with captain to start the ride

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request

## License

This project is for educational purposes. Please ensure compliance with external API terms of service.
