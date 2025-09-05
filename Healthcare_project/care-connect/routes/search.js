const express = require('express');
const router = express.Router();
const { findKNearest } = require('../utils/knn');
const Hospital = require('../models/hospital');
const Doctor = require('../models/doctor');

// Get nearby hospitals using KNN
router.get('/nearby-hospitals', async (req, res) => {
    try {
        const { latitude, longitude, k = 5 } = req.query;
        
        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        const userLocation = {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
        };

        // Get all hospitals from database
        const hospitals = await Hospital.find({}, 'name latitude longitude address specialties rating');
        
        // Find k nearest hospitals
        const nearestHospitals = findKNearest(userLocation, hospitals, parseInt(k));

        res.json(nearestHospitals);
    } catch (error) {
        console.error('Error finding nearby hospitals:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get nearby doctors using KNN
router.get('/nearby-doctors', async (req, res) => {
    try {
        const { latitude, longitude, specialty, k = 5 } = req.query;
        
        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        const userLocation = {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
        };

        // Build query based on specialty if provided
        const query = specialty ? { specialty } : {};
        
        // Get all doctors from database
        const doctors = await Doctor.find(query, 'name latitude longitude specialty hospital rating');
        
        // Find k nearest doctors
        const nearestDoctors = findKNearest(userLocation, doctors, parseInt(k));

        res.json(nearestDoctors);
    } catch (error) {
        console.error('Error finding nearby doctors:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 