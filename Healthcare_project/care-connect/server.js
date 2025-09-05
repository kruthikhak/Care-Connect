const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const HOSPITALS_FILE = path.join(DATA_DIR, 'hospitals.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const APPOINTMENTS_FILE = path.join(DATA_DIR, 'appointments.json');
const SYMPTOMS_FILE = path.join(DATA_DIR, 'symptoms.json');

// Ensure data directory and files exist
async function initializeDataFiles() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        
        // Initialize hospitals data
        try {
            await fs.access(HOSPITALS_FILE);
        } catch {
            await fs.writeFile(HOSPITALS_FILE, JSON.stringify([]));
        }

        // Initialize users data
        try {
            await fs.access(USERS_FILE);
        } catch {
            await fs.writeFile(USERS_FILE, JSON.stringify([]));
        }

        // Initialize appointments data
        try {
            await fs.access(APPOINTMENTS_FILE);
        } catch {
            await fs.writeFile(APPOINTMENTS_FILE, JSON.stringify([]));
        }

        // Initialize symptoms data
        try {
            await fs.access(SYMPTOMS_FILE);
        } catch {
            await fs.writeFile(SYMPTOMS_FILE, JSON.stringify([
                { id: 1, name: "Fever" },
                { id: 2, name: "Cough" },
                { id: 3, name: "Headache" },
                { id: 4, name: "Fatigue" },
                { id: 5, name: "Shortness of breath" }
            ]));
        }
    } catch (error) {
        console.error('Error initializing data files:', error);
    }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Helper functions
async function readJsonFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
}

async function writeJsonFile(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error writing to ${filePath}:`, error);
        throw error;
    }
}

// Rate limiting middleware
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: { error: 'Too many login attempts. Please try again later.' }
});

// Routes
app.get('/api/hospitals', async (req, res) => {
    try {
        const hospitals = await readJsonFile(HOSPITALS_FILE);
        res.json(hospitals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch hospitals' });
    }
});

app.get('/api/search', async (req, res) => {
    try {
        const { query, location, specialty, rating, sortBy } = req.query;
        const hospitals = await readJsonFile(HOSPITALS_FILE);
        
        let results = hospitals.filter(hospital => {
            const matchesQuery = !query || 
                hospital.name.toLowerCase().includes(query.toLowerCase()) ||
                hospital.specialties.some(s => s.toLowerCase().includes(query.toLowerCase()));
            
            const matchesLocation = !location || 
                hospital.city.toLowerCase().includes(location.toLowerCase()) ||
                hospital.state.toLowerCase().includes(location.toLowerCase());
            
            const matchesSpecialty = !specialty || 
                hospital.specialties.some(s => s.toLowerCase() === specialty.toLowerCase());
            
            const matchesRating = !rating || hospital.rating >= parseFloat(rating);
            
            return matchesQuery && matchesLocation && matchesSpecialty && matchesRating;
        });

        // Sort results
        if (sortBy) {
            switch (sortBy) {
                case 'rating':
                    results.sort((a, b) => b.rating - a.rating);
                    break;
                case 'name':
                    results.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'distance':
                    // If user location is provided, sort by distance
                    if (req.query.userLat && req.query.userLng) {
                        const userLat = parseFloat(req.query.userLat);
                        const userLng = parseFloat(req.query.userLng);
                        results.forEach(hospital => {
                            hospital.distance = calculateDistance(
                                userLat, 
                                userLng, 
                                hospital.latitude, 
                                hospital.longitude
        );
      });
                        results.sort((a, b) => a.distance - b.distance);
                    }
                    break;
            }
        }
        
        res.json(results);
    } catch (error) {
        console.error('Search failed:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

app.get('/api/symptoms', async (req, res) => {
    try {
        const symptoms = await readJsonFile(SYMPTOMS_FILE);
        res.json(symptoms);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch symptoms' });
    }
});

app.post('/api/symptom-check', async (req, res) => {
    try {
        const { symptoms, duration } = req.body;
        // Simple recommendation logic
        const urgency = symptoms.length > 3 || duration > 3 ? 'high' : 'medium';
        const recommendations = [
            'Schedule an appointment with a healthcare provider',
            'Monitor your symptoms',
            'Stay hydrated and rest'
        ];
        const specialists = [
            'General Physician',
            'Internal Medicine Specialist'
        ];
        
        res.json({ urgency, recommendations, specialists });
    } catch (error) {
        res.status(500).json({ error: 'Symptom check failed' });
    }
});

app.post('/api/appointments', async (req, res) => {
    try {
        const { providerId, userId, date, time, notes } = req.body;
        
        // Validate required fields
        if (!providerId || !userId || !date || !time) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const appointments = await readJsonFile(APPOINTMENTS_FILE);
        const hospitals = await readJsonFile(HOSPITALS_FILE);
        
        // Validate provider exists
        const hospital = hospitals.find(h => h.id === providerId);
        if (!hospital) {
            return res.status(404).json({ error: 'Provider not found' });
        }

        // Check for conflicting appointments
        const hasConflict = appointments.some(apt => 
            apt.providerId === providerId && 
            apt.date === date && 
            apt.time === time &&
            apt.status !== 'cancelled'
        );

        if (hasConflict) {
            return res.status(409).json({ error: 'This time slot is already booked' });
        }

        const newAppointment = {
            id: Date.now().toString(),
            providerId,
            userId,
            hospitalName: hospital.name,
            date,
            time,
            notes: notes || '',
            status: 'scheduled',
            createdAt: new Date().toISOString()
        };
        
        appointments.push(newAppointment);
        await writeJsonFile(APPOINTMENTS_FILE, appointments);
        
        res.json({ success: true, appointment: newAppointment });
    } catch (error) {
        console.error('Failed to book appointment:', error);
        res.status(500).json({ error: 'Failed to book appointment' });
    }
});

app.get('/api/appointments/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const appointments = await readJsonFile(APPOINTMENTS_FILE);
        
        const userAppointments = appointments
            .filter(apt => apt.userId === userId)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        res.json(userAppointments);
    } catch (error) {
        console.error('Failed to fetch appointments:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

app.put('/api/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, date, time, notes } = req.body;
        
        const appointments = await readJsonFile(APPOINTMENTS_FILE);
        const appointmentIndex = appointments.findIndex(apt => apt.id === id);
        
        if (appointmentIndex === -1) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Update appointment
        appointments[appointmentIndex] = {
            ...appointments[appointmentIndex],
            ...(status && { status }),
            ...(date && { date }),
            ...(time && { time }),
            ...(notes && { notes }),
        updatedAt: new Date().toISOString()
        };

        await writeJsonFile(APPOINTMENTS_FILE, appointments);
        res.json({ success: true, appointment: appointments[appointmentIndex] });
    } catch (error) {
        console.error('Failed to update appointment:', error);
        res.status(500).json({ error: 'Failed to update appointment' });
    }
});

app.get('/api/appointments/available/:providerId', async (req, res) => {
    try {
        const { providerId } = req.params;
        const { date } = req.query;
        
        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        const appointments = await readJsonFile(APPOINTMENTS_FILE);
        const hospitals = await readJsonFile(HOSPITALS_FILE);
        
        // Find provider
        const hospital = hospitals.find(h => h.id === providerId);
        if (!hospital) {
            return res.status(404).json({ error: 'Provider not found' });
        }

        // Get booked time slots for the date
        const bookedSlots = appointments
            .filter(apt => apt.providerId === providerId && apt.date === date && apt.status !== 'cancelled')
            .map(apt => apt.time);

        // Generate available time slots (9 AM to 5 PM, 30-minute intervals)
        const availableSlots = [];
        const startHour = 9;
        const endHour = 17;
        
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                if (!bookedSlots.includes(timeSlot)) {
                    availableSlots.push(timeSlot);
                }
            }
        }

        res.json(availableSlots);
    } catch (error) {
        console.error('Failed to fetch available slots:', error);
        res.status(500).json({ error: 'Failed to fetch available slots' });
    }
});

// Authentication routes
app.post('/api/auth/login', loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (!email.includes('@') || !email.includes('.')) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const users = await readJsonFile(USERS_FILE);
        const user = users.find(u => u.email === email);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare password with hashed password
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Set session
        req.session.user = { 
            id: user.id, 
            name: user.name, 
            email: user.email,
            role: user.role || 'user'
        };

        // Update last login
        user.lastLogin = new Date().toISOString();
        await writeJsonFile(USERS_FILE, users);

        res.json({ 
            success: true, 
            user: req.session.user,
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed. Please try again later.' });
    }
});

app.get('/api/auth/status', (req, res) => {
    if (req.session.user) {
        res.json({ 
            isAuthenticated: true, 
            user: req.session.user,
            sessionExpiry: req.session.cookie.maxAge
        });
    } else {
        res.json({ isAuthenticated: false });
    }
});

app.post('/api/auth/logout', (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
                return res.status(500).json({ error: 'Logout failed' });
            }
            res.clearCookie('connect.sid');
            res.json({ success: true, message: 'Logged out successfully' });
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

// Routes
app.use('/api/auth', authRoutes);

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/symptom-checker', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'symptom-checker.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Initialize data and start server
initializeDataFiles().then(() => {
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    });
});
