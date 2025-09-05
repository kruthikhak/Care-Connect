# Care Connect - Hospital Directory

A web application that provides information about hospitals across various cities and states. Users can search, filter, and view detailed information about hospitals. The application uses Clerk for authentication.

## Features

- User authentication with Clerk
- Hospital search and filtering
- User dashboard with favorites and history
- Mobile-responsive design with Bootstrap

## Prerequisites

- Node.js (v14+)
- Clerk account for authentication
- MongoDB (optional - application can run without it)

## Installation

1. Clone this repository:
```
git clone <repository-url>
cd care-connect
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file in the project root with the following variables:
```
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
SESSION_SECRET=some-random-session-secret
BASE_URL=http://localhost:3001
MONGO_URI=mongodb://localhost:27017/care-connect
```

4. To get Clerk credentials:
   - Sign up at [clerk.dev](https://clerk.dev/)
   - Create a new application
   - Go to API Keys in your dashboard
   - Copy the Publishable Key
   - Add it to your `.env` file

## Running the Application

1. Start the server:
```
npm start
```

2. For development (with auto-reload):
```
npm run dev
```

3. Access the application at `http://localhost:3001`

## User Flow

1. **Landing Page**: Users are greeted with a landing page that introduces the application and provides login/signup options.
2. **Authentication**: Users sign in or create an account using Clerk.
3. **Hospital Directory**: After authentication, users can browse, search, and filter hospitals.
4. **Dashboard**: Users can view their profile, favorites, and recently viewed hospitals.

## Data Structure

The application uses a JSON file (`hospital_data.json`) to store hospital information in the following format:

```json
{
  "hospitals": [
    {
      "hospital_id": "Hospital #1",
      "city": "Anantpur",
      "state": "Andhra Pradesh",
      "district": "Ananthapuramu",
      "density": 219.608,
      "location": {
        "latitude": 14.660634599686995,
        "longitude": 77.57934210631872
      },
      "rating": 4.9,
      "review_count": 19172
    },
    // More hospitals...
  ],
  "total_count": 2566
}
```

## Folder Structure

```
care-connect/
├── public/             # Static assets and HTML files
│   ├── index.html      # Landing page with login/signup
│   ├── hospitals.html  # Hospital listing page
│   ├── dashboard.html  # User dashboard
├── .env                # Environment variables
├── hospital_data.json  # JSON data with hospital information
├── package.json        # Node.js dependencies
├── server.js           # Express server setup
└── README.md           # Project documentation
```

## Authentication Implementation

The application uses Clerk for authentication, which provides:
- User registration and login
- Session management
- Profile management
- OAuth providers (Google, GitHub, etc.)

Authentication is implemented client-side using Clerk's JavaScript SDK.

## License

MIT 