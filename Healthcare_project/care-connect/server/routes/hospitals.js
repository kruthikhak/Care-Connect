const express = require('express');
const router = express.Router();

// Comprehensive hospital dataset with more locations and details
const hospitals = [
    {
        id: '1',
        name: 'City General Hospital',
        address: '123 Medical Center Dr, San Francisco, CA 94110',
        latitude: 37.7749,
        longitude: -122.4194,
        rating: 4.5,
        specialties: ['Emergency', 'Cardiology', 'Pediatrics'],
        services: ['24/7 Emergency', 'ICU', 'Laboratory'],
        phone: '(415) 555-1234',
        website: 'www.citygeneral.org',
        hours: '24/7'
    },
    {
        id: '2',
        name: 'St. Mary\'s Medical Center',
        address: '450 Stanyan St, San Francisco, CA 94117',
        latitude: 37.7682,
        longitude: -122.4534,
        rating: 4.8,
        specialties: ['Orthopedics', 'Neurology', 'Oncology'],
        services: ['Rehabilitation', 'Cancer Center', 'Research'],
        phone: '(415) 555-2345',
        website: 'www.stmarys.org',
        hours: '24/7'
    },
    {
        id: '3',
        name: 'Kaiser Permanente Medical Center',
        address: '2425 Geary Blvd, San Francisco, CA 94115',
        latitude: 37.7875,
        longitude: -122.4367,
        rating: 4.3,
        specialties: ['Family Medicine', 'Internal Medicine', 'Surgery'],
        services: ['Primary Care', 'Specialty Care', 'Pharmacy'],
        phone: '(415) 555-3456',
        website: 'www.kaiserpermanente.org',
        hours: '24/7'
    },
    {
        id: '4',
        name: 'UCSF Medical Center',
        address: '505 Parnassus Ave, San Francisco, CA 94143',
        latitude: 37.7629,
        longitude: -122.4576,
        rating: 4.9,
        specialties: ['Research', 'Transplant', 'Pediatrics'],
        services: ['Academic Medical Center', 'Research', 'Specialty Care'],
        phone: '(415) 555-4567',
        website: 'www.ucsfhealth.org',
        hours: '24/7'
    },
    {
        id: '5',
        name: 'California Pacific Medical Center',
        address: '2333 Buchanan St, San Francisco, CA 94115',
        latitude: 37.7909,
        longitude: -122.4327,
        rating: 4.6,
        specialties: ['Cardiology', 'Neurology', 'Orthopedics'],
        services: ['Emergency Care', 'Surgery', 'Rehabilitation'],
        phone: '(415) 555-5678',
        website: 'www.cpmc.org',
        hours: '24/7'
    },
    {
        id: '6',
        name: 'San Francisco General Hospital',
        address: '1001 Potrero Ave, San Francisco, CA 94110',
        latitude: 37.7558,
        longitude: -122.4067,
        rating: 4.2,
        specialties: ['Emergency', 'Trauma', 'Infectious Disease'],
        services: ['Trauma Center', 'Emergency Care', 'Public Health'],
        phone: '(415) 555-6789',
        website: 'www.sfgh.org',
        hours: '24/7'
    },
    {
        id: '7',
        name: 'Sutter Health CPMC',
        address: '1101 Van Ness Ave, San Francisco, CA 94109',
        latitude: 37.7935,
        longitude: -122.4197,
        rating: 4.7,
        specialties: ['Cardiology', 'Orthopedics', 'Oncology'],
        services: ['Cancer Care', 'Heart Center', 'Orthopedic Surgery'],
        phone: '(415) 555-7890',
        website: 'www.sutterhealth.org',
        hours: '24/7'
    },
    {
        id: '8',
        name: 'Chinese Hospital',
        address: '845 Jackson St, San Francisco, CA 94133',
        latitude: 37.7949,
        longitude: -122.4077,
        rating: 4.4,
        specialties: ['Family Medicine', 'Internal Medicine', 'Traditional Chinese Medicine'],
        services: ['Primary Care', 'Acupuncture', 'Herbal Medicine'],
        phone: '(415) 555-8901',
        website: 'www.chinesehospital-sf.org',
        hours: '24/7'
    },
    {
        id: '9',
        name: 'Saint Francis Memorial Hospital',
        address: '900 Hyde St, San Francisco, CA 94109',
        latitude: 37.7897,
        longitude: -122.4177,
        rating: 4.5,
        specialties: ['Emergency', 'Orthopedics', 'Rehabilitation'],
        services: ['Emergency Care', 'Orthopedic Surgery', 'Physical Therapy'],
        phone: '(415) 555-9012',
        website: 'www.saintfrancismemorial.org',
        hours: '24/7'
    },
    {
        id: '10',
        name: 'Zuckerberg San Francisco General Hospital',
        address: '1001 Potrero Ave, San Francisco, CA 94110',
        latitude: 37.7558,
        longitude: -122.4067,
        rating: 4.3,
        specialties: ['Emergency', 'Trauma', 'Public Health'],
        services: ['Trauma Center', 'Emergency Care', 'Public Health Services'],
        phone: '(415) 555-0123',
        website: 'www.zsfg.org',
        hours: '24/7'
    },
    {
        id: '11',
        name: 'Oakland Medical Center',
        address: '275 W MacArthur Blvd, Oakland, CA 94611',
        latitude: 37.8345,
        longitude: -122.2607,
        rating: 4.4,
        specialties: ['Emergency', 'Cardiology', 'Pediatrics'],
        services: ['Emergency Care', 'Heart Center', 'Children\'s Hospital'],
        phone: '(510) 555-1234',
        website: 'www.oaklandmedical.org',
        hours: '24/7'
    },
    {
        id: '12',
        name: 'Alta Bates Summit Medical Center',
        address: '2450 Ashby Ave, Berkeley, CA 94705',
        latitude: 37.8638,
        longitude: -122.2597,
        rating: 4.6,
        specialties: ['Maternity', 'Cardiology', 'Oncology'],
        services: ['Birth Center', 'Cancer Care', 'Heart Center'],
        phone: '(510) 555-2345',
        website: 'www.altabatessummit.org',
        hours: '24/7'
    },
    {
        id: '13',
        name: 'John Muir Medical Center',
        address: '1601 Ygnacio Valley Rd, Walnut Creek, CA 94598',
        latitude: 37.9061,
        longitude: -122.0647,
        rating: 4.7,
        specialties: ['Trauma', 'Cardiology', 'Orthopedics'],
        services: ['Trauma Center', 'Heart Center', 'Orthopedic Surgery'],
        phone: '(925) 555-3456',
        website: 'www.johnmuirhealth.com',
        hours: '24/7'
    },
    {
        id: '14',
        name: 'Eden Medical Center',
        address: '20103 Lake Chabot Rd, Castro Valley, CA 94546',
        latitude: 37.6947,
        longitude: -122.0864,
        rating: 4.3,
        specialties: ['Emergency', 'Family Medicine', 'Surgery'],
        services: ['Emergency Care', 'Primary Care', 'Surgical Services'],
        phone: '(510) 555-4567',
        website: 'www.edenmedicalcenter.org',
        hours: '24/7'
    },
    {
        id: '15',
        name: 'San Ramon Regional Medical Center',
        address: '6001 Norris Canyon Rd, San Ramon, CA 94583',
        latitude: 37.7629,
        longitude: -121.9354,
        rating: 4.5,
        specialties: ['Emergency', 'Cardiology', 'Orthopedics'],
        services: ['Emergency Care', 'Heart Center', 'Orthopedic Surgery'],
        phone: '(925) 555-5678',
        website: 'www.sanramonmed.com',
        hours: '24/7'
    }
];

// Get all hospitals
router.get('/', (req, res) => {
    res.json(hospitals);
});

// Get hospital by ID
router.get('/:id', (req, res) => {
    const hospital = hospitals.find(h => h.id === req.params.id);
    if (!hospital) {
        return res.status(404).json({ error: 'Hospital not found' });
    }
    res.json(hospital);
});

// Get hospitals by specialty
router.get('/specialty/:specialty', (req, res) => {
    const specialty = req.params.specialty.toLowerCase();
    const filteredHospitals = hospitals.filter(h => 
        h.specialties.some(s => s.toLowerCase() === specialty)
    );
    res.json(filteredHospitals);
});

// Get hospitals by location (latitude, longitude, radius in km)
router.get('/nearby/:lat/:lng/:radius', (req, res) => {
    const lat = parseFloat(req.params.lat);
    const lng = parseFloat(req.params.lng);
    const radius = parseFloat(req.params.radius) || 10; // Default 10km radius
    
    if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
        return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    // Calculate distance for each hospital
    const hospitalsWithDistance = hospitals.map(hospital => {
        const distance = calculateDistance(lat, lng, hospital.latitude, hospital.longitude);
        return { ...hospital, distance };
    });
    
    // Filter hospitals within radius and sort by distance
    const nearbyHospitals = hospitalsWithDistance
        .filter(hospital => hospital.distance <= radius)
        .sort((a, b) => a.distance - b.distance);
    
    res.json(nearbyHospitals);
});

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

module.exports = router; 