# Venue Reservation System - Frontend

A modern React + TypeScript web application for browsing venues, managing bookings, and reserving event spaces.

## Overview

This frontend provides:

- **Venue Discovery**: Browse and search venues
- **Detailed Information**: View venue details, services, images, and ratings
- **User Authentication**: Sign up and login functionality
- **Booking Management**: Create and manage venue reservations
- **Owner Dashboard**: Manage venues, services, and bookings (for venue owners)
- **Payment Integration**: Secure bookings with Khalti payment gateway
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API & Hooks
- **HTTP Client**: Fetch API
- **Linting**: ESLint

## Project Structure

```
Frontend/
├── src/
│   ├── main.tsx              # Application entry point
│   ├── App.tsx               # Root component
│   ├── index.css             # Global styles
│   ├── components/
│   │   ├── pages/            # Page components (routes)
│   │   ├── BookingModal.tsx  # Shared booking modal
│   │   └── ...               # Other reusable components
│   ├── context/              # React context (Auth, etc.)
│   ├── types/                # TypeScript type definitions
│   └── data/                 # Static data and constants
├── public/                   # Static assets
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── vite.config.ts            # Vite configuration
└── index.html                # HTML entry point
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Available Scripts

- **`npm run dev`** - Start development server with hot reload
- **`npm run build`** - Build for production
- **`npm run preview`** - Preview production build locally
- **`npm run lint`** - Run ESLint to check code quality

## Environment Setup

Create a `.env.local` file in the Frontend folder (if needed):

```
VITE_API_URL=http://localhost:8000/api
```

By default, the app connects to `http://localhost:8000/api` for backend endpoints.

## Key Features

### Authentication

- User signup and login via email/phone
- Token-based authentication with context management
- Protected routes for authenticated users

### Venue Browsing

- Search and filter venues
- View detailed venue information, services, and images
- Check ratings and reviews

### Booking System

- Reserve venues through an intuitive booking modal
- Manage active and past reservations
- Payment integration with Khalti

### Owner Dashboard

- Add and manage venues
- Manage services, catering, and images
- Track reservations and bookings
- Manage event types

## Component Patterns

### Controlled Components

Forms use React state for controlled inputs:

```tsx
const [formData, setFormData] = useState({ name: '', ... });
const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
```

### API Calls

Async data fetching with error handling:

```tsx
const res = await fetch(`/api/venues/`, {
  headers: { Authorization: `Token ${token}` },
});
if (!res.ok) {
  alert("Error");
}
const data = await res.json();
```

### Custom Hooks

Use authentication context:

```tsx
const { token, user, logout } = useAuth();
```

## Styling

- Uses Tailwind CSS utility classes
- Custom color theme defined in `tailwind.config.js`
- Responsive design with mobile-first approach

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a new branch for features
2. Follow the existing code structure and patterns
3. Test your changes in development mode
4. Submit a pull request

## Troubleshooting

### Backend Connection Issues

- Ensure backend is running on `http://localhost:8000`
- Check CORS settings in Django backend
- Verify `VITE_API_URL` if using custom API endpoint

### Build Issues

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf dist`

## License

MIT License - see LICENSE file for details
