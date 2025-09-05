const mongoose = require('mongoose');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const fs = require('fs');
const path = require('path');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/care-connect';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Sample hospital data
const hospitals = [
    {
        name: 'City General Hospital',
        address: '123 Main Street, San Francisco, CA',
        city: 'San Francisco',
        state: 'CA',
        latitude: 37.7749,
        longitude: -122.4194,
        specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics'],
        rating: 4.5,
        phone: '(415) 555-1234',
        website: 'https://citygeneral.example.com',
        description: 'A comprehensive healthcare facility offering a wide range of medical services.',
        imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
        name: 'Mercy Medical Center',
        address: '456 Park Avenue, Los Angeles, CA',
        city: 'Los Angeles',
        state: 'CA',
        latitude: 34.0522,
        longitude: -118.2437,
        specialties: ['Cardiology', 'Dermatology', 'Psychiatry', 'Emergency Medicine'],
        rating: 4.3,
        phone: '(213) 555-5678',
        website: 'https://mercymedical.example.com',
        description: 'Providing compassionate care with state-of-the-art medical technology.',
        imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
        name: 'Hope Regional Hospital',
        address: '789 Oak Drive, Chicago, IL',
        city: 'Chicago',
        state: 'IL',
        latitude: 41.8781,
        longitude: -87.6298,
        specialties: ['Oncology', 'Cardiology', 'Neurology', 'Pediatrics'],
        rating: 4.7,
        phone: '(312) 555-9012',
        website: 'https://hoperegional.example.com',
        description: 'Dedicated to providing exceptional healthcare services to our community.',
        imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
        name: 'Unity Healthcare Center',
        address: '321 Maple Road, New York, NY',
        city: 'New York',
        state: 'NY',
        latitude: 40.7128,
        longitude: -74.0060,
        specialties: ['Cardiology', 'Orthopedics', 'Dermatology', 'Emergency Medicine'],
        rating: 4.2,
        phone: '(212) 555-3456',
        website: 'https://unityhealthcare.example.com',
        description: 'Committed to improving the health and well-being of our patients.',
        imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
        name: 'Trinity Medical Institute',
        address: '654 Washington Boulevard, Boston, MA',
        city: 'Boston',
        state: 'MA',
        latitude: 42.3601,
        longitude: -71.0589,
        specialties: ['Research', 'Cardiology', 'Neurology', 'Oncology'],
        rating: 4.8,
        phone: '(617) 555-7890',
        website: 'https://trinitymedical.example.com',
        description: 'Leading the way in medical research and patient care.',
        imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    }
];

// Sample doctor data
const doctors = [
    {
        name: 'Sarah Johnson',
        specialty: 'Cardiology',
        hospital: null, // Will be set after hospitals are created
        latitude: 37.7749,
        longitude: -122.4194,
        rating: 4.8,
        experience: 15,
        education: ['MD - Harvard Medical School', 'Residency - Johns Hopkins Hospital'],
        languages: ['English', 'Spanish'],
        phone: '(415) 555-1111',
        email: 'sarah.johnson@example.com',
        imageUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
        availability: {
            'Monday': ['9:00 AM - 5:00 PM'],
            'Wednesday': ['9:00 AM - 5:00 PM'],
            'Friday': ['9:00 AM - 5:00 PM']
        }
    },
    {
        name: 'Michael Chen',
        specialty: 'Neurology',
        hospital: null, // Will be set after hospitals are created
        latitude: 34.0522,
        longitude: -118.2437,
        rating: 4.6,
        experience: 12,
        education: ['MD - Stanford University', 'Residency - Mayo Clinic'],
        languages: ['English', 'Mandarin'],
        phone: '(213) 555-2222',
        email: 'michael.chen@example.com',
        imageUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
        availability: {
            'Tuesday': ['9:00 AM - 5:00 PM'],
            'Thursday': ['9:00 AM - 5:00 PM'],
            'Saturday': ['10:00 AM - 2:00 PM']
        }
    },
    {
        name: 'Emily Rodriguez',
        specialty: 'Pediatrics',
        hospital: null, // Will be set after hospitals are created
        latitude: 41.8781,
        longitude: -87.6298,
        rating: 4.9,
        experience: 8,
        education: ['MD - University of Chicago', 'Residency - Children\'s Hospital of Philadelphia'],
        languages: ['English', 'Spanish', 'French'],
        phone: '(312) 555-3333',
        email: 'emily.rodriguez@example.com',
        imageUrl: 'https://randomuser.me/api/portraits/women/3.jpg',
        availability: {
            'Monday': ['9:00 AM - 5:00 PM'],
            'Wednesday': ['9:00 AM - 5:00 PM'],
            'Friday': ['9:00 AM - 5:00 PM']
        }
    },
    {
        name: 'David Kim',
        specialty: 'Orthopedics',
        hospital: null, // Will be set after hospitals are created
        latitude: 40.7128,
        longitude: -74.0060,
        rating: 4.7,
        experience: 10,
        education: ['MD - Columbia University', 'Residency - NYU Langone Medical Center'],
        languages: ['English', 'Korean'],
        phone: '(212) 555-4444',
        email: 'david.kim@example.com',
        imageUrl: 'https://randomuser.me/api/portraits/men/4.jpg',
        availability: {
            'Tuesday': ['9:00 AM - 5:00 PM'],
            'Thursday': ['9:00 AM - 5:00 PM'],
            'Saturday': ['10:00 AM - 2:00 PM']
        }
    },
    {
        name: 'Jennifer Williams',
        specialty: 'Dermatology',
        hospital: null, // Will be set after hospitals are created
        latitude: 42.3601,
        longitude: -71.0589,
        rating: 4.5,
        experience: 7,
        education: ['MD - Boston University', 'Residency - Massachusetts General Hospital'],
        languages: ['English'],
        phone: '(617) 555-5555',
        email: 'jennifer.williams@example.com',
        imageUrl: 'https://randomuser.me/api/portraits/women/5.jpg',
        availability: {
            'Monday': ['9:00 AM - 5:00 PM'],
            'Wednesday': ['9:00 AM - 5:00 PM'],
            'Friday': ['9:00 AM - 5:00 PM']
        }
    }
];

// Function to seed the database
async function seedDatabase() {
    try {
        // Clear existing data
        await Hospital.deleteMany({});
        await Doctor.deleteMany({});
        console.log('Existing data cleared');

        // Insert hospitals
        const insertedHospitals = await Hospital.insertMany(hospitals);
        console.log(`${insertedHospitals.length} hospitals inserted`);

        // Update doctors with hospital references
        const updatedDoctors = doctors.map((doctor, index) => {
            return {
                ...doctor,
                hospital: insertedHospitals[index % insertedHospitals.length]._id
            };
        });

        // Insert doctors
        const insertedDoctors = await Doctor.insertMany(updatedDoctors);
        console.log(`${insertedDoctors.length} doctors inserted`);

        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seed function
seedDatabase(); 