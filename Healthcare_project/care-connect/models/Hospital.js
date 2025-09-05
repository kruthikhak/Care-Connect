const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    specialties: [{
        type: String
    }],
    rating: {
        type: Number,
        default: 0
    },
    phone: {
        type: String
    },
    website: {
        type: String
    },
    description: {
        type: String
    },
    imageUrl: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Hospital', hospitalSchema); 