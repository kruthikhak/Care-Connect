# Care Connect - Healthcare Facility Finder

A comprehensive healthcare facility finder application that helps users locate and connect with healthcare providers across India.

#Note: This project showcases a healthcare recommendation system with features like location-based search, filtering, and recommendation algorithms. The dataset includes demo and synthetic data, so some hospital–specialization details may not exactly match real-world information.


## Features

### 1. User Authentication
- Secure login/logout functionality
- Session management
- Protected routes for authenticated users
- Demo user account for testing

### 2. Healthcare Facility Search
- Search facilities by city, type, and specialization
- Interactive map integration using Leaflet.js
- Distance-based facility sorting
- Detailed facility information including:
  - Contact details
  - Specializations
  - Ratings
  - Operating hours
  - Website links
  - Directions

### 3. Symptom Checker
- Dynamic symptom selection
- Duration input
- Urgency level assessment
- Specialist recommendations
- Action suggestions based on symptoms

### 4. User Profile Management
- Personal information management
- Medical history tracking
- Settings preferences
- Profile updates with validation
- Appointment history

### 5. Review System
- Facility ratings and reviews
- Review filtering by rating and facility type
- Sort reviews by recency and rating
- User-specific review history

### 6. Appointment Management
- Book new appointments
- View upcoming appointments
- Appointment history tracking
- Status updates

### 7. Hospital Database
- Comprehensive database of hospitals across major Indian cities
- Detailed facility information
- Real-time availability status
- Specialization tracking
- Rating system

### 8. Additional Features
- Feedback system
- Personalized health suggestions
- Emergency contact information
- Interactive UI components
- Toast notifications
- Loading indicators
- Form validations

## Technical Implementation

### Frontend
- HTML5, CSS3, JavaScript
- Bootstrap for responsive design
- Leaflet.js for map integration
- Interactive UI components
- Client-side validation
- Toast notifications

### Backend (Node.js/Express)
- RESTful API architecture
- Session-based authentication
- Static file serving
- CORS handling
- Error management
- Data validation
- Rate limiting

### API Endpoints

#### Authentication
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/status

#### Facilities
- GET /api/facilities/search
- GET /api/facilities/specializations
- GET /api/facilities/metadata
- GET /api/facilities/:id

#### Profile Management
- GET /api/profile
- PUT /api/profile

#### Reviews
- POST /api/reviews
- GET /api/reviews/:facilityId
- GET /api/reviews

#### Appointments
- GET /api/appointments
- POST /api/appointments

#### Symptom Checker
- GET /api/symptoms
- POST /api/symptom-check

#### Feedback
- POST /api/feedback

### Data Management
- In-memory data storage
- Hospital database with major cities coverage
- User profile management
- Review and feedback storage
- Appointment tracking

## Setup Instructions

1. Clone the repository
```bash
git clone [repository-url]
```

2. Install dependencies
```bash
npm install
```

3. Start the server
```bash
node server.js
```

4. Access the application
```
http://localhost:3000
```

## Environment Variables
- PORT (default: 3000)
- NODE_ENV (development/production)

## Dependencies
- express
- express-session
- cors
- path
- fs
- csv-parser

## Cities with Hospital Database
- Mumbai
- Delhi
- Bangalore
- Chennai
- Hyderabad
- Kolkata
- Pune
- Ahmedabad
- Jaipur
- Lucknow
- Chandigarh
- Bhopal
- Indore
- Nagpur
- Kochi
- Visakhapatnam
- Bhubaneswar
- Guwahati

## Future Enhancements
1. Database Integration (MongoDB/PostgreSQL)
2. Real-time Notifications
3. Video Consultation Feature
4. Mobile App Development
5. Payment Integration
6. Advanced Analytics
7. Unit Tests
8. CI/CD Implementation

## Security Features
- Session Management
- Protected Routes
- Input Validation
- Error Handling
- Rate Limiting
- XSS Prevention

## Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details 

