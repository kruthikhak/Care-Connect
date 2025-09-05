const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    specialty: {
        type: String,
        required: true
    },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
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
    rating: {
        type: Number,
        default: 0
    },
    experience: {
        type: Number
    },
    education: [{
        type: String
    }],
    languages: [{
        type: String
    }],
    phone: {
        type: String
    },
    email: {
        type: String
    },
    imageUrl: {
        type: String
    },
    availability: {
        type: Map,
        of: [{
            type: String
        }]
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema); 