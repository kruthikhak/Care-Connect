const express = require('express');
const passport = require('passport');
const router = express.Router();
const bcrypt = require('bcrypt');
const session = require('express-session');

// @desc    Auth with Google
// @route   GET /auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

// @desc    Logout user
// @route   GET /auth/logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

// Demo user credentials (in a real application, this would be in a database)
const demoUser = {
    email: 'demo@example.com',
    password: 'password123',
    name: 'Demo User'
};

// Login route
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Check if the credentials match the demo user
    if (email === demoUser.email && password === demoUser.password) {
        // Set user data in session
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
router.post('/logout', (req, res) => {
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
router.get('/status', (req, res) => {
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

module.exports = router; 