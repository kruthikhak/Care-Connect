const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        if (req.xhr) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        return res.redirect('/login');
    }
    next();
};

// Demo user for testing
const demoUser = {
    email: 'demo@example.com',
    password: 'password123',
    name: 'Demo User',
    profile: {
        fullName: 'Demo User',
        dateOfBirth: '1990-01-01',
        phoneNumber: '123-456-7890',
        gender: 'Other',
        medicalHistory: {
            allergies: ['Pollen', 'Penicillin'],
            chronicConditions: ['Asthma']
        },
        settings: {
            emailNotifications: true
        }
    },
    appointments: [
        {
            id: 1,
            type: 'General Check-up',
            doctor: 'Dr. Sarah Johnson',
            date: '2024-03-15',
            time: '10:00 AM',
            status: 'upcoming'
        },
        {
            id: 2,
            type: 'Dental Check-up',
            doctor: 'Dr. Michael Brown',
            date: '2024-02-20',
            time: '02:00 PM',
            status: 'completed'
        }
    ]
};

// Sample symptoms data
const symptoms = [
    { id: 1, name: "Fever" },
    { id: 2, name: "Cough" },
    { id: 3, name: "Headache" },
    { id: 4, name: "Fatigue" },
    { id: 5, name: "Shortness of breath" },
    { id: 6, name: "Sore throat" },
    { id: 7, name: "Body aches" },
    { id: 8, name: "Loss of taste or smell" }
];

// Sample suggestions data
const suggestions = {
    healthTips: [
        {
            icon: 'bi-heart-pulse',
            title: 'Monitor Your Asthma',
            description: 'Keep track of your peak flow readings and use your inhaler as prescribed. Avoid known triggers like pollen.'
        },
        {
            icon: 'bi-shield-check',
            title: 'Allergy Management',
            description: 'Check local pollen forecasts and plan outdoor activities accordingly. Keep windows closed during high pollen counts.'
        },
        {
            icon: 'bi-wind',
            title: 'Indoor Air Quality',
            description: 'Use air purifiers and maintain good ventilation to reduce exposure to allergens and asthma triggers.'
        }
    ],
    recommendations: [
        {
            icon: 'bi-calendar-check',
            title: 'Regular Check-ups',
            description: 'Schedule quarterly check-ups with your allergist to monitor your conditions and adjust treatment plans.'
        },
        {
            icon: 'bi-activity',
            title: 'Exercise Recommendations',
            description: 'Consider indoor exercises during high pollen days. Always have your rescue inhaler nearby during physical activity.'
        },
        {
            icon: 'bi-journal-medical',
            title: 'Medication Review',
            description: 'Review your medications with your healthcare provider every 6 months to ensure optimal treatment.'
        }
    ]
};

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(value) {
    return value * Math.PI / 180;
}

// Helper function to get city coordinates
function getCityCoordinates(city) {
    const cityCoordinates = {
        'Mumbai': { lat: 19.0760, lng: 72.8777 },
        'Delhi': { lat: 28.6139, lng: 77.2090 },
        'Bangalore': { lat: 12.9716, lng: 77.5946 },
        'Chennai': { lat: 13.0827, lng: 80.2707 },
        'Hyderabad': { lat: 17.3850, lng: 78.4867 },
        'Kolkata': { lat: 22.5726, lng: 88.3639 },
        'Pune': { lat: 18.5204, lng: 73.8567 },
        'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
        'Jaipur': { lat: 26.9124, lng: 75.7873 },
        'Lucknow': { lat: 26.8467, lng: 80.9462 },
        'Chandigarh': { lat: 30.7333, lng: 76.7794 },
        'Bhopal': { lat: 23.2599, lng: 77.4126 },
        'Indore': { lat: 22.7196, lng: 75.8577 },
        'Nagpur': { lat: 21.1458, lng: 79.0882 },
        'Kochi': { lat: 9.9312, lng: 76.2673 },
        'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
        'Bhubaneswar': { lat: 20.2961, lng: 85.8245 },
        'Guwahati': { lat: 26.1445, lng: 91.7362 }
    };

    // Case-insensitive city matching
    const cityKey = Object.keys(cityCoordinates).find(key => 
        key.toLowerCase() === city.toLowerCase()
    );

    if (cityKey) {
        return cityCoordinates[cityKey];
    }

    return null;
}

// Sample major hospitals data for different cities
const majorHospitals = {
    'Delhi': [
        {
            name: 'AIIMS Delhi',
            address: 'Sri Aurobindo Marg, Ansari Nagar',
            specializations: ['General Medicine', 'Cardiology', 'Neurology', 'Oncology', 'Orthopedics'],
            rating: 4.8,
            website: 'https://www.aiims.edu'
        },
        {
            name: 'Fortis Escorts Heart Institute',
            address: 'Okhla Road, New Delhi',
            specializations: ['Cardiology', 'Cardiac Surgery', 'Vascular Surgery'],
            rating: 4.6,
            website: 'https://www.fortisescorts.in'
        },
        {
            name: 'Max Super Speciality Hospital',
            address: 'Press Enclave Road, Saket',
            specializations: ['Multi Specialty', 'Cardiology', 'Neurology', 'Oncology'],
            rating: 4.5,
            website: 'https://www.maxhealthcare.in'
        }
    ],
    'Mumbai': [
        {
            name: 'Lilavati Hospital',
            address: 'Bandra West, Mumbai',
            specializations: ['Multi Specialty', 'Cardiology', 'Neurosurgery', 'Oncology'],
            rating: 4.7,
            website: 'https://www.lilavatihospital.com'
        },
        {
            name: 'Kokilaben Dhirubhai Ambani Hospital',
            address: 'Four Bunglows, Andheri West',
            specializations: ['Multi Specialty', 'Robotic Surgery', 'Neuroscience', 'Cardiac Sciences'],
            rating: 4.8,
            website: 'https://www.kokilabenhospital.com'
        },
        {
            name: 'Breach Candy Hospital',
            address: 'Breach Candy, Mumbai',
            specializations: ['General Medicine', 'Cardiology', 'Orthopedics'],
            rating: 4.6,
            website: 'https://www.breachcandyhospital.org'
        }
    ],
    'Bangalore': [
        {
            name: 'Manipal Hospital Old Airport Road',
            address: '98, HAL Old Airport Road, Kodihalli, Bangalore - 560017',
            specializations: ['Multi Specialty', 'Cardiology', 'Neuroscience', 'Oncology', 'Orthopedics'],
            rating: 4.7,
            website: 'https://www.manipalhospitals.com',
            phone: '+91 80 2502 4444',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        },
        {
            name: 'Fortis Hospital Bannerghatta',
            address: '154/9, Bannerghatta Road, Opposite IIM Bangalore - 560076',
            specializations: ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology'],
            rating: 4.6,
            website: 'https://www.fortishealthcare.com',
            phone: '+91 80 6621 4444',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        },
        {
            name: 'Apollo Hospitals Bannerghatta Road',
            address: '154/11, Bannerghatta Road, Bangalore - 560076',
            specializations: ['Multi Specialty', 'Cardiology', 'Neurology', 'Orthopedics'],
            rating: 4.8,
            website: 'https://www.apollohospitals.com',
            phone: '+91 80 4030 4050',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        },
        {
            name: 'Narayana Health City',
            address: '258/A, Bommasandra Industrial Area, Hosur Road, Bangalore - 560099',
            specializations: ['Cardiac Sciences', 'Oncology', 'Neurosciences', 'Orthopedics'],
            rating: 4.7,
            website: 'https://www.narayanahealth.org',
            phone: '+91 80 7122 2222',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        },
        {
            name: 'Columbia Asia Hospital Whitefield',
            address: 'Whitefield, Bangalore - 560066',
            specializations: ['General Medicine', 'Pediatrics', 'Obstetrics', 'Gynecology'],
            rating: 4.5,
            website: 'https://www.columbiaindiahealthcare.com',
            phone: '+91 80 6165 6666',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        }
    ],
    'Hyderabad': [
        {
            name: 'Apollo Hospitals Jubilee Hills',
            address: 'Road No 72, Jubilee Hills, Hyderabad - 500033',
            specializations: ['Multi Specialty', 'Cardiology', 'Neurology', 'Oncology'],
            rating: 4.8,
            website: 'https://www.apollohospitals.com',
            phone: '+91 40 2360 7777',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        },
        {
            name: 'CARE Hospitals Banjara Hills',
            address: 'Road No. 1, Banjara Hills, Hyderabad - 500034',
            specializations: ['Cardiology', 'Orthopedics', 'Neurology', 'General Surgery'],
            rating: 4.6,
            website: 'https://www.carehospitals.com',
            phone: '+91 40 3041 7777',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        }
    ],
    'Kolkata': [
        {
            name: 'AMRI Hospitals Dhakuria',
            address: '230, Barakhola Lane, Purba Barisha, Kolkata - 700008',
            specializations: ['Multi Specialty', 'Cardiology', 'Oncology', 'Neurology'],
            rating: 4.7,
            website: 'https://www.amrihospitals.in',
            phone: '+91 33 6606 3800',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        },
        {
            name: 'Fortis Hospital Anandapur',
            address: '730, Eastern Metropolitan Bypass, Anandapur, Kolkata - 700107',
            specializations: ['Cardiology', 'Orthopedics', 'Neuroscience', 'Oncology'],
            rating: 4.6,
            website: 'https://www.fortishealthcare.com',
            phone: '+91 33 6628 4444',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        }
    ],
    'Pune': [
        {
            name: 'Ruby Hall Clinic',
            address: '40, Sassoon Road, Pune - 411001',
            specializations: ['Multi Specialty', 'Cardiology', 'Neurology', 'Oncology'],
            rating: 4.7,
            website: 'https://www.rubyhall.com',
            phone: '+91 20 6645 5555',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        },
        {
            name: 'Jehangir Hospital',
            address: '32, Sassoon Road, Pune - 411001',
            specializations: ['Multi Specialty', 'Orthopedics', 'Pediatrics', 'Cardiology'],
            rating: 4.6,
            website: 'https://www.jehangirhospital.com',
            phone: '+91 20 6681 9999',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        }
    ],
    'Ahmedabad': [
        {
            name: 'Sterling Hospital',
            address: 'Sterling Hospital Road, Memnagar, Ahmedabad - 380052',
            specializations: ['Multi Specialty', 'Cardiology', 'Neurology', 'Oncology'],
            rating: 4.7,
            website: 'https://www.sterlinghospitals.com',
            phone: '+91 79 4001 1111',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        },
        {
            name: 'Apollo Hospitals Ahmedabad',
            address: 'Plot No.1A, Bhat GIDC Estate, Ahmedabad - 382428',
            specializations: ['Multi Specialty', 'Cardiology', 'Orthopedics', 'Neurology'],
            rating: 4.8,
            website: 'https://www.apollohospitals.com',
            phone: '+91 79 6670 1800',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        }
    ],
    'Jaipur': [
        {
            name: 'Fortis Escorts Hospital',
            address: 'JLN Marg, Malviya Nagar, Jaipur - 302017',
            specializations: ['Cardiology', 'Orthopedics', 'Neurology', 'Oncology'],
            rating: 4.6,
            website: 'https://www.fortishealthcare.com',
            phone: '+91 141 254 7000',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        },
        {
            name: 'Narayana Multispeciality Hospital',
            address: 'Sector 28, Kumbha Marg, Jaipur - 302019',
            specializations: ['Multi Specialty', 'Cardiology', 'Neurology', 'Orthopedics'],
            rating: 4.7,
            website: 'https://www.narayanahealth.org',
            phone: '+91 141 457 1111',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        }
    ],
    'Lucknow': [
        {
            name: 'Medanta Hospital',
            address: 'Sector A, Pocket 1, Sushant Golf City, Lucknow - 226030',
            specializations: ['Multi Specialty', 'Cardiology', 'Neurology', 'Oncology'],
            rating: 4.7,
            website: 'https://www.medanta.org',
            phone: '+91 522 450 5050',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        },
        {
            name: 'Sahara Hospital',
            address: '19A, Viraj Khand, Gomti Nagar, Lucknow - 226010',
            specializations: ['Multi Specialty', 'Cardiology', 'Neurology', 'Orthopedics'],
            rating: 4.6,
            website: 'https://www.saharahospital.com',
            phone: '+91 522 672 2222',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        }
    ],
    'Chandigarh': [
        {
            name: 'Max Super Speciality Hospital',
            address: 'Phase 6, Mohali, Chandigarh - 160055',
            specializations: ['Multi Specialty', 'Cardiology', 'Neurology', 'Oncology'],
            rating: 4.7,
            website: 'https://www.maxhealthcare.in',
            phone: '+91 172 521 9000',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        },
        {
            name: 'Fortis Hospital Mohali',
            address: 'Sector 62, Phase VIII, Mohali, Chandigarh - 160062',
            specializations: ['Cardiology', 'Orthopedics', 'Neurology', 'Oncology'],
            rating: 4.8,
            website: 'https://www.fortishealthcare.com',
            phone: '+91 172 509 2222',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        }
    ],
    'Bhopal': [
        {
            name: 'Bansal Hospital',
            address: 'C-Sector, Shahpura, Bhopal - 462016',
            specializations: ['Multi Specialty', 'Cardiology', 'Neurology', 'Orthopedics'],
            rating: 4.6,
            website: 'https://www.bansalhospitalbhopal.com',
            phone: '+91 755 402 2222',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        },
        {
            name: 'Chirayu Medical College & Hospital',
            address: 'Bhainsakhedi, Bhopal-Indore Highway, Bhopal - 462030',
            specializations: ['Multi Specialty', 'Cardiology', 'Neurology', 'Emergency Medicine'],
            rating: 4.5,
            website: 'https://www.chirayuhospital.org',
            phone: '+91 755 297 2222',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        }
    ],
    'Indore': [
        {
            name: 'Bombay Hospital',
            address: '94/95, Tulsi Nagar, Indore - 452010',
            specializations: ['Multi Specialty', 'Cardiology', 'Neurology', 'Oncology'],
            rating: 4.7,
            website: 'https://www.bombayhospitalindore.com',
            phone: '+91 731 255 8888',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        },
        {
            name: 'Apollo Hospitals Indore',
            address: 'Scheme No. 74C, Sector D, Vijay Nagar, Indore - 452010',
            specializations: ['Multi Specialty', 'Cardiology', 'Orthopedics', 'Neurology'],
            rating: 4.8,
            website: 'https://www.apollohospitals.com',
            phone: '+91 731 471 7444',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        }
    ],
    'Nagpur': [
        {
            name: 'Orange City Hospital & Research Institute',
            address: '19, Pandey Layout, Veer Savarkar Square, Nagpur - 440015',
            specializations: ['Multi Specialty', 'Cardiology', 'Neurology', 'Orthopedics'],
            rating: 4.6,
            website: 'https://www.ochri.org',
            phone: '+91 712 669 7777',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        },
        {
            name: 'New Era Hospital',
            address: 'Central Bazar Road, Ramdaspeth, Nagpur - 440010',
            specializations: ['Multi Specialty', 'Cardiology', 'Neurology', 'Critical Care'],
            rating: 4.7,
            website: 'https://www.newerahospital.com',
            phone: '+91 712 222 7722',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        }
    ],
    'Kochi': [
        {
            name: 'Aster Medcity',
            address: 'Kuttisahib Road, Cheranalloor, Kochi - 682027',
            specializations: ['Multi Specialty', 'Cardiology', 'Neurology', 'Oncology'],
            rating: 4.8,
            website: 'https://www.astermedcity.com',
            phone: '+91 484 669 9999',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        },
        {
            name: 'Amrita Institute of Medical Sciences',
            address: 'Ponekkara, Edappally, Kochi - 682041',
            specializations: ['Multi Specialty', 'Cardiology', 'Neurology', 'Oncology'],
            rating: 4.9,
            website: 'https://www.amritahospitals.org',
            phone: '+91 484 285 1234',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        }
    ],
    'Visakhapatnam': [
        {
            name: 'CARE Hospitals',
            address: '15-1-12, Gopal Sadan, Ram Nagar, Visakhapatnam - 530002',
            specializations: ['Multi Specialty', 'Cardiology', 'Neurology', 'Orthopedics'],
            rating: 4.6,
            website: 'https://www.carehospitals.com',
            phone: '+91 891 282 7777',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        },
        {
            name: 'Apollo Hospitals',
            address: '15-1-12, Health City, Chinagadili, Visakhapatnam - 530040',
            specializations: ['Multi Specialty', 'Cardiology', 'Neurology', 'Oncology'],
            rating: 4.7,
            website: 'https://www.apollohospitals.com',
            phone: '+91 891 271 7777',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        }
    ],
    'Bhubaneswar': [
        {
            name: 'Apollo Hospitals',
            address: '251, Sainik School Road, Unit-15, Bhubaneswar - 751005',
            specializations: ['Multi Specialty', 'Cardiology', 'Neurology', 'Oncology'],
            rating: 4.7,
            website: 'https://www.apollohospitals.com',
            phone: '+91 674 661 0000',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        },
        {
            name: 'CARE Hospitals',
            address: 'Plot No-329/1929, Chandrasekharpur, Bhubaneswar - 751016',
            specializations: ['Multi Specialty', 'Cardiology', 'Orthopedics', 'Neurology'],
            rating: 4.6,
            website: 'https://www.carehospitals.com',
            phone: '+91 674 301 9999',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        }
    ],
    'Guwahati': [
        {
            name: 'GNRC Hospitals',
            address: 'Dispur, Guwahati - 781006',
            specializations: ['Multi Specialty', 'Cardiology', 'Neurology', 'Emergency Medicine'],
            rating: 4.6,
            website: 'https://www.gnrchospitals.com',
            phone: '+91 361 234 5678',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        },
        {
            name: 'Nemcare Hospital',
            address: 'GS Road, Bhangagarh, Guwahati - 781005',
            specializations: ['Multi Specialty', 'Cardiology', 'Orthopedics', 'Pediatrics'],
            rating: 4.5,
            website: 'https://www.nemcare.in',
            phone: '+91 361 252 4444',
            type: 'hospital',
            hours: '24/7',
            availability: 'Open'
        }
    ]
};

// Helper function to get a realistic website URL for a hospital
function getHospitalWebsite(hospitalName, city) {
    // Known hospital chains with their actual websites
    const knownHospitals = {
        'Apollo': 'https://www.apollohospitals.com',
        'Fortis': 'https://www.fortishealthcare.com',
        'Max': 'https://www.maxhealthcare.in',
        'Manipal': 'https://www.manipalhospitals.com',
        'AIIMS': 'https://www.aiims.edu',
        'Medanta': 'https://www.medanta.org',
        'Narayana': 'https://www.narayanahealth.org',
        'Columbia Asia': 'https://www.columbiaindiahealthcare.com',
        'CARE': 'https://www.carehospitals.com',
        'Sterling': 'https://www.sterlinghospitals.com',
        'Lilavati': 'https://www.lilavatihospital.com',
        'Kokilaben': 'https://www.kokilabenhospital.com',
        'Ruby Hall': 'https://www.rubyhall.com',
        'Jehangir': 'https://www.jehangirhospital.com',
        'Aster': 'https://www.asterhospitals.in',
        'Amrita': 'https://www.amritahospitals.org'
    };

    // Check if the hospital name contains any known hospital chain name
    for (const [chainName, website] of Object.entries(knownHospitals)) {
        if (hospitalName.toLowerCase().includes(chainName.toLowerCase())) {
            return website;
        }
    }

    // For other hospitals, return a generic healthcare website
    return 'https://www.google.com/search?q=' + encodeURIComponent(`${hospitalName} ${city} hospital`);
}

// Helper function to generate random phone numbers
function generatePhoneNumber() {
    return `+91 ${Math.floor(Math.random() * 90000000 + 10000000)}`;
}

// Helper function to get random specializations
function getRandomSpecializations() {
    const allSpecializations = [
        'General Medicine', 'Cardiology', 'Orthopedics', 'Neurology',
        'Pediatrics', 'Gynecology', 'ENT', 'Ophthalmology',
        'Dermatology', 'Psychiatry', 'Oncology', 'Urology'
    ];
    
    const count = Math.floor(Math.random() * 4) + 2; // 2 to 5 specializations
    const specializations = new Set();
    
    while (specializations.size < count) {
        specializations.add(allSpecializations[Math.floor(Math.random() * allSpecializations.length)]);
    }
    
    return Array.from(specializations);
}

// Initialize hospitals array
const hospitals = [];

// Function to initialize the server
async function initializeServer() {
    try {
        // Load hospitals from CSV
        await new Promise((resolve, reject) => {
            // First, add the major hospitals data
            Object.entries(majorHospitals).forEach(([city, cityHospitals]) => {
                const coordinates = getCityCoordinates(city);
                if (coordinates) {
                    cityHospitals.forEach(hospital => {
                        hospitals.push({
                            id: hospitals.length + 1,
                            name: hospital.name,
                            type: 'hospital',
                            city: city,
                            address: hospital.address,
                            location: coordinates,
                            rating: hospital.rating,
                            phone: hospital.phone || generatePhoneNumber(),
                            hours: '24/7',
                            availability: 'Open',
                            specializations: hospital.specializations,
                            website: hospital.website
                        });
                    });
                }
            });

            // Then try to load from CSV if it exists
            const csvPath = path.join(__dirname, 'care-connect', 'Project', 'data', 'HospitalsInIndia (1).csv');
            if (fs.existsSync(csvPath)) {
                fs.createReadStream(csvPath)
                    .pipe(csv())
                    .on('data', (data) => {
                        const coordinates = getCityCoordinates(data.City);
                        if (coordinates) {
                            hospitals.push({
                                id: hospitals.length + 1,
                                name: data.Hospital,
                                type: 'hospital',
                                state: data.State,
                                city: data.City,
                                address: data.LocalAddress,
                                pincode: data.Pincode,
                                location: coordinates,
                                rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1),
                                phone: generatePhoneNumber(),
                                hours: '24/7',
                                availability: 'Open',
                                specializations: getRandomSpecializations(),
                                website: getHospitalWebsite(data.Hospital, data.City)
                            });
                        }
                    })
                    .on('end', () => {
                        console.log(`Loaded ${hospitals.length} hospitals`);
                        resolve();
                    })
                    .on('error', (error) => {
                        console.error('Error reading CSV file:', error);
                        resolve(); // Still resolve to continue with major hospitals
                    });
            } else {
                console.log('CSV file not found, continuing with major hospitals data');
                resolve();
            }
        });

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Total hospitals loaded: ${hospitals.length}`);
            // Log hospitals in Mumbai for debugging
            const mumbaiHospitals = hospitals.filter(h => h.city.toLowerCase() === 'mumbai');
            console.log(`Hospitals in Mumbai: ${mumbaiHospitals.length}`);
        }).on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use. Please try a different port.`);
                process.exit(1);
            } else {
                console.error('Server error:', error);
                process.exit(1);
            }
        });

    } catch (error) {
        console.error('Error initializing server:', error);
        process.exit(1);
    }
}

// Facilities search endpoint
app.get('/api/facilities/search', requireAuth, (req, res) => {
    try {
        const { lat, lng, type = 'all', specialization = 'all', city } = req.query;
        console.log('Search params:', { lat, lng, type, specialization, city });
        console.log('Total hospitals before filtering:', hospitals.length);

        // Filter facilities
        let results = hospitals;

        // Filter by city if provided
        if (city) {
            results = results.filter(facility => {
                const facilityCity = facility.city || '';
                const searchCity = city.toLowerCase();
                return facilityCity.toLowerCase() === searchCity;
            });
            console.log('After city filter:', results.length);
        }

        // Filter by type
        if (type !== 'all') {
            results = results.filter(facility => facility.type === type);
            console.log('After type filter:', results.length);
        }

        // Filter by specialization
        if (specialization !== 'all') {
            results = results.filter(facility => 
                facility.specializations && 
                facility.specializations.some(spec => 
                    spec.toLowerCase() === specialization.toLowerCase()
                )
            );
            console.log('After specialization filter:', results.length);
        }

        // Add distance if coordinates are provided
        if (lat && lng) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);

            if (!isNaN(userLat) && !isNaN(userLng) && 
                userLat >= -90 && userLat <= 90 && 
                userLng >= -180 && userLng <= 180) {
                
                results = results.map(facility => ({
                    ...facility,
                    distance: calculateDistance(
                        userLat,
                        userLng,
                        facility.location.lat,
                        facility.location.lng
                    )
                })).sort((a, b) => a.distance - b.distance);
            }
        }

        // Limit results to 50 facilities
        const limitedResults = results.slice(0, 50);

        console.log(`Returning ${limitedResults.length} facilities for ${city || 'all cities'}`);

        return res.json({
            success: true,
            results: limitedResults,
            count: results.length,
            total: hospitals.length
        });

    } catch (error) {
        console.error('Error in facilities search:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Get all specializations
app.get('/api/facilities/specializations', requireAuth, (req, res) => {
    try {
        const allSpecializations = [...new Set(
            hospitals.flatMap(facility => facility.specializations || [])
        )].sort();

        res.json({
            success: true,
            specializations: allSpecializations
        });
    } catch (error) {
        console.error('Error fetching specializations:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Facility types metadata endpoint
app.get('/api/facilities/metadata', requireAuth, (req, res) => {
    try {
        const types = [...new Set(hospitals.map(f => f.type))];
        
        res.json({
            success: true,
            types: types
        });
    } catch (error) {
        console.error('Error fetching metadata:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Get facility details endpoint
app.get('/api/facilities/:id', requireAuth, (req, res) => {
    try {
        const facilityId = parseInt(req.params.id);
        const facility = hospitals.find(f => f.id === facilityId);

        if (!facility) {
            return res.status(404).json({
                success: false,
                error: 'Facility not found'
            });
        }

        res.json({
            success: true,
            facility
        });
    } catch (error) {
        console.error('Error getting facility details:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred while fetching facility details'
        });
    }
});

// Login route
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (email === demoUser.email && password === demoUser.password) {
        req.session.user = {
            email: demoUser.email,
            name: demoUser.name
        };
        
        res.json({ 
            success: true, 
            message: 'Login successful',
            user: {
                email: demoUser.email,
                name: demoUser.name
            }
        });
    } else {
        res.status(401).json({ 
            success: false, 
            message: 'Invalid email or password' 
        });
    }
});

// Logout route
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Error logging out' 
            });
        }
        res.json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    });
});

// Check authentication status
app.get('/api/auth/status', (req, res) => {
    if (req.session.user) {
        res.json({ 
            authenticated: true, 
            user: req.session.user 
        });
    } else {
        res.json({ 
            authenticated: false 
        });
    }
});

// Get symptoms
app.get('/api/symptoms', requireAuth, (req, res) => {
    res.json(symptoms);
});

// Symptom checker endpoint
app.post('/api/symptom-check', requireAuth, (req, res) => {
    const { symptoms, duration } = req.body;
    
    let urgency = 'low';
    if (symptoms.length > 3 || duration > 3) {
        urgency = 'high';
    } else if (symptoms.length > 1 || duration > 1) {
        urgency = 'medium';
    }

    let recommendations = [];
    let specialists = [];

    if (urgency === 'high') {
        recommendations = [
            'Seek immediate medical attention',
            'Contact your healthcare provider',
            'Monitor your symptoms closely'
        ];
        specialists = [
            'Emergency Medicine Physician',
            'Primary Care Physician'
        ];
    } else if (urgency === 'medium') {
        recommendations = [
            'Schedule an appointment with your doctor',
            'Rest and stay hydrated',
            'Monitor your symptoms'
        ];
        specialists = [
            'Primary Care Physician',
            'General Practitioner'
        ];
    } else {
        recommendations = [
            'Rest and monitor your symptoms',
            'Stay hydrated',
            'Over-the-counter medications may help'
        ];
        specialists = [
            'Primary Care Physician'
        ];
    }

    res.json({
        urgency,
        recommendations,
        specialists
    });
});

// Get user profile
app.get('/api/profile', requireAuth, (req, res) => {
    res.json({
        success: true,
        profile: demoUser.profile
    });
});

// Update user profile
app.put('/api/profile', requireAuth, (req, res) => {
    try {
        const updates = req.body;
        
        // Validate required fields
        if (updates.fullName && typeof updates.fullName !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Full name must be a string'
            });
        }

        if (updates.phoneNumber && !/^\d{10}$/.test(updates.phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Phone number must be 10 digits'
            });
        }

        if (updates.dateOfBirth) {
            const dob = new Date(updates.dateOfBirth);
            if (isNaN(dob.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date of birth'
                });
            }
        }

        // Validate medical history if provided
        if (updates.medicalHistory) {
            const { height, weight } = updates.medicalHistory;
            if (height && (isNaN(height) || height <= 0 || height > 300)) {
                return res.status(400).json({
                    success: false,
                    message: 'Height must be between 1 and 300 cm'
                });
            }
            if (weight && (isNaN(weight) || weight <= 0 || weight > 500)) {
                return res.status(400).json({
                    success: false,
                    message: 'Weight must be between 1 and 500 kg'
                });
            }

            // Validate arrays
            ['medications', 'allergies', 'conditions'].forEach(field => {
                if (updates.medicalHistory[field] && !Array.isArray(updates.medicalHistory[field])) {
                    return res.status(400).json({
                        success: false,
                        message: `${field} must be an array`
                    });
                }
            });
        }

        // Validate settings if provided
        if (updates.settings) {
            const validBooleanFields = [
                'emailNotifications',
                'appointmentReminders',
                'medicationReminders',
                'profileVisibility',
                'shareHealthData'
            ];

            for (const field of validBooleanFields) {
                if (updates.settings[field] !== undefined && typeof updates.settings[field] !== 'boolean') {
                    return res.status(400).json({
                        success: false,
                        message: `${field} must be a boolean value`
                    });
                }
            }
        }

        // Sanitize and update the profile
        const sanitizedUpdates = {
            ...updates,
            lastUpdated: new Date().toISOString()
        };

        // In a real application, you would update the database
        // For now, we're updating the demo user
        demoUser.profile = {
            ...demoUser.profile,
            ...sanitizedUpdates
        };

        // Return success response
        res.json({
            success: true,
            message: 'Profile updated successfully',
            profile: demoUser.profile
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
});

// Get user appointments
app.get('/api/appointments', requireAuth, (req, res) => {
    res.json({
        success: true,
        appointments: demoUser.appointments
    });
});

// Get personalized suggestions
app.get('/api/suggestions', requireAuth, (req, res) => {
    res.json(suggestions);
});

// Book new appointment
app.post('/api/appointments', requireAuth, (req, res) => {
    const { type, doctor, date, time, notes } = req.body;
    
    const newAppointment = {
        id: demoUser.appointments.length + 1,
        type,
        doctor,
        date,
        time,
        notes,
        status: 'upcoming'
    };

    demoUser.appointments.push(newAppointment);

    res.json({
        success: true,
        message: 'Appointment booked successfully',
        appointment: newAppointment
    });
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/symptom-checker', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'symptom-checker.html'));
});

app.get('/appointments', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'appointments.html'));
});

app.get('/profile', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

// Serve suggestions page
app.get('/suggestions', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'suggestions.html'));
});

// Serve reviews page
app.get('/reviews', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reviews.html'));
});

// Serve facilities page
app.get('/facilities', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'facilities.html'));
});

// Review and Feedback Storage
const reviews = [];
const feedback = [];

// Review endpoints
app.post('/api/reviews', requireAuth, (req, res) => {
    try {
        const { facilityId, rating, comment } = req.body;
        const userId = req.session.user.email;

        if (!facilityId || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                error: 'Invalid review data'
            });
        }

        const review = {
            id: Date.now(),
            facilityId,
            rating,
            comment,
            userId,
            timestamp: new Date()
        };
        reviews.push(review);

        res.json({
            success: true,
            review
        });
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit review'
        });
    }
});

app.get('/api/reviews/:facilityId', requireAuth, (req, res) => {
    try {
        const facilityReviews = reviews.filter(r => r.facilityId === req.params.facilityId);
        res.json({
            success: true,
            reviews: facilityReviews
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch reviews'
        });
    }
});

// Feedback endpoint
app.post('/api/feedback', requireAuth, (req, res) => {
    try {
        const { type, message } = req.body;
        const userId = req.session.user.email;

        if (!type || !message) {
            return res.status(400).json({
                success: false,
                error: 'Invalid feedback data'
            });
        }

        const feedbackEntry = {
            id: Date.now(),
            type,
            message,
            userId,
            timestamp: new Date()
        };
        feedback.push(feedbackEntry);

        res.json({
            success: true,
            feedback: feedbackEntry
        });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit feedback'
        });
    }
});

// Get all reviews with filters
app.get('/api/reviews', requireAuth, (req, res) => {
    try {
        const { rating, type, sort } = req.query;
        
        let filteredReviews = reviews.map(review => {
            const facility = hospitals.find(h => h.id === parseInt(review.facilityId));
            return {
                ...review,
                facilityName: facility ? facility.name : 'Unknown Facility',
                facilityType: facility ? facility.type : 'unknown'
            };
        });

        // Apply filters
        if (rating && rating !== 'all') {
            filteredReviews = filteredReviews.filter(review => 
                rating === '5' ? review.rating === 5 :
                rating === '4' ? review.rating >= 4 :
                rating === '3' ? review.rating >= 3 : true
            );
        }

        if (type && type !== 'all') {
            filteredReviews = filteredReviews.filter(review => 
                review.facilityType === type
            );
        }

        // Apply sorting
        if (sort) {
            switch (sort) {
                case 'recent':
                    filteredReviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    break;
                case 'rating-high':
                    filteredReviews.sort((a, b) => b.rating - a.rating);
                    break;
                case 'rating-low':
                    filteredReviews.sort((a, b) => a.rating - b.rating);
                    break;
            }
        }

        res.json({
            success: true,
            reviews: filteredReviews
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch reviews'
        });
    }
});

// Initialize the server
initializeServer().catch(error => {
    console.error('Failed to initialize server:', error);
    process.exit(1);
});