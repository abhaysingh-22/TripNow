# TripNow Frontend 

## Overview
TripNow Frontend is the user interface for the TripNow ride-hailing application, built with React and modern web technologies. It provides an intuitive, responsive experience for users and captains to manage rides, track locations in real-time, and handle payments seamlessly.

## Features
- **Responsive Design**: Mobile-first UI optimized for all devices using Tailwind CSS
- **Real-Time Updates**: Socket.io integration for live ride status and location tracking
- **Interactive Maps**: Google Maps integration for location selection and live tracking
- **Smooth Animations**: Framer Motion for enhanced user experience
- **Authentication**: Secure login/signup for users and captains
- **Ride Management**: Complete ride lifecycle from booking to completion
- **Payment Integration**: Razorpay gateway for secure UPI payments
- **Notifications**: React Hot Toast for user feedback

## Tech Stack
- **React** (v19.1.0) - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router DOM** - Client-side routing
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Notification system
- **@react-google-maps/api** - Google Maps integration
- **@heroicons/react** - Icon library

## Project Structure
```
Frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── AppHeader.jsx     # Navigation header
│   │   ├── LiveTracking.jsx  # Real-time map tracking
│   │   ├── PaymentGateway.jsx # Razorpay integration
│   │   ├── VehiclePanel.jsx  # Vehicle selection
│   │   └── ... (other components)
│   ├── pages/               # Page components
│   │   ├── Home.jsx         # Main ride booking page
│   │   ├── UserLogin.jsx    # User authentication
│   │   ├── CaptainHome.jsx  # Captain dashboard
│   │   └── ... (other pages)
│   ├── context/             # React context providers
│   │   ├── UserContext.jsx  # User state management
│   │   ├── CaptainContext.jsx # Captain state management
│   │   └── SocketContext.jsx # Socket.io connection
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js       # Authentication logic
│   │   ├── useSuggestions.js # Location suggestions
│   │   └── useRideManagement.js # Ride state management
│   ├── assets/              # Static assets (images, icons)
│   ├── App.jsx              # Main app component with routing
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles
├── public/                  # Public assets
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
└── tailwind.config.js       # Tailwind CSS configuration
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend server running (see Backend README)

### Installation
1. Navigate to Frontend directory: `cd Frontend`
2. Install dependencies: `npm install`
3. Create `.env` file with required variables (see Environment Variables section)
4. Start development server: `npm run dev`

### Environment Variables
Create `Frontend/.env`:
```env
VITE_BASE_URL=http://localhost:4000
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## Scripts
- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Usage

### User Flow
1. **Start Page**: Landing page with app introduction
2. **Authentication**: User/Captain login and signup
3. **Home**: Ride booking interface with location selection
4. **Ride Flow**: Real-time tracking and status updates
5. **Payment**: Secure payment processing

### Key Features Usage

#### Location Selection
- Use `LocationSearchPanel` for pickup/dropoff selection
- `useSuggestions` hook provides autocomplete via Google Places API
- Real-time validation and error handling

#### Real-Time Tracking
- `LiveTracking` component shows captain location
- Socket.io handles live updates
- `SocketContext` manages connection state

#### Payment Processing
- `PaymentGateway` component integrates Razorpay
- Secure UPI payment flow
- Payment verification and confirmation

## Key Components

### Core Components
- **AppHeader**: Navigation and user actions
- **LiveTracking**: Real-time map with captain location
- **VehiclePanel**: Vehicle selection and fare calculation
- **PaymentGateway**: Razorpay integration
- **ConfirmRide**: Ride confirmation dialog

### Context Providers
- **UserContext**: Manages user authentication and profile
- **CaptainContext**: Handles captain-specific state
- **SocketContext**: Real-time communication management

### Custom Hooks
- **useAuth**: Authentication logic and token management
- **useFareCalculation**: Dynamic fare computation
- **useRideManagement**: Ride lifecycle management
- **useSuggestions**: Location autocomplete functionality

## Dependencies
```json
{
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.6.3",
    "socket.io-client": "^4.8.1",
    "axios": "^1.10.0",
    "framer-motion": "^12.23.6",
    "react-hot-toast": "^2.5.2",
    "@heroicons/react": "^2.2.0",
    "@react-google-maps/api": "^2.20.7"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.6.0",
    "tailwindcss": "^4.1.11",
    "eslint": "^9.9.0"
  }
}
```

## Development Workflow

### Component Development
1. Create component in appropriate directory
2. Use Tailwind CSS for styling
3. Implement responsive design
4. Add proper TypeScript types (if using TS)
5. Test component functionality

### State Management
- Use React Context for global state
- Custom hooks for complex logic
- Socket.io for real-time data
- Local storage for persistence

### API Integration
- Axios for HTTP requests
- Proper error handling
- Loading states management
- Authentication headers

## Best Practices

### Code Quality
- Follow React best practices
- Use functional components with hooks
- Implement proper error boundaries
- Write clean, readable code

### Performance
- Lazy load components
- Optimize images and assets
- Minimize bundle size
- Use React.memo for expensive components

### Security
- Validate user inputs
- Secure API key handling
- Implement proper authentication
- Sanitize data before rendering

## Testing
- Test components with React Testing Library
- Mock API calls for unit tests
- Test user interactions
- Validate responsive design

## Deployment
1. Build production bundle: `npm run build`
2. Deploy to hosting service (Vercel, Netlify, etc.)
3. Configure environment variables
4. Set up CI/CD pipeline

## Contributing
1. Follow React best practices
2. Use Tailwind CSS for styling
3. Implement responsive design
4. Test components thoroughly
5. Update documentation for new features
6. Follow conventional commit messages

## Troubleshooting

### Common Issues
- **Build Errors**: Clear node_modules and reinstall
- **API Connection**: Check backend server status
- **Google Maps**: Verify API key and billing
- **Socket Connection**: Check network and backend socket setup

### Performance Tips
- Use React DevTools for debugging
- Monitor bundle size with `npm run build`
- Optimize images and assets
- Implement code splitting

## License
For educational purposes. Ensure compliance with external API terms of service.
