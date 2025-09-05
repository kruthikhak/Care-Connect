// API endpoints
const API_BASE_URL = '/api';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const locationInput = document.getElementById('locationInput');
const searchBtn = document.getElementById('searchBtn');
const resultsContainer = document.getElementById('resultsContainer');
const symptomForm = document.getElementById('symptomForm');
const loginBtn = document.getElementById('loginBtn');

// Authentication state
let isUserAuthenticated = false;
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// App initialization
async function initializeApp() {
    await checkAuthStatus();
    setupEventListeners();
    await loadSymptomForm();
}

// Event Listeners
function setupEventListeners() {
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    if (symptomForm) {
        loadSymptomOptions();
    }
}

// Authentication check
async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/status`);
        const data = await response.json();
        if (data.isAuthenticated) {
            isUserAuthenticated = true;
            currentUser = data.user;
            updateUIForAuthenticatedUser(data.user);
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        isUserAuthenticated = false;
        currentUser = null;
    }
}

// Update UI for authenticated user
function updateUIForAuthenticatedUser(user) {
    if (loginBtn) {
        loginBtn.innerHTML = `
            <div class="dropdown">
                <a class="nav-link dropdown-toggle text-white" href="#" role="button" data-bs-toggle="dropdown">
                    <i class="fas fa-user"></i> ${user.name}
                </a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="/profile">Profile</a></li>
                    <li><a class="dropdown-item" href="/appointments">My Appointments</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" onclick="logout()">Logout</a></li>
                </ul>
            </div>
        `;
    }
}

// Check if user is authenticated
function isAuthenticated() {
    return isUserAuthenticated;
}

// Logout function
async function logout() {
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
        isUserAuthenticated = false;
        currentUser = null;
        window.location.href = '/';
    } catch (error) {
        console.error('Logout failed:', error);
        showAlert('Logout failed. Please try again.');
    }
}

// Search functionality
async function handleSearch(event) {
    if (event) {
        event.preventDefault();
    }

    const searchInput = document.getElementById('searchInput');
    const locationInput = document.getElementById('locationInput');
    const specialtyFilter = document.getElementById('specialtyFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    const sortBy = document.getElementById('sortBy');
    const useLocation = document.getElementById('useLocation');
    const resultsContainer = document.getElementById('resultsContainer');

    const query = searchInput.value;
    const location = locationInput.value;
    const specialty = specialtyFilter.value;
    const rating = ratingFilter.value;
    const sort = sortBy.value;

    if (!query && !location && !specialty && !rating) {
        showAlert('Please enter at least one search criteria');
        return;
    }

    try {
        // Show loading state
        resultsContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';

        // Build search URL
        const params = new URLSearchParams();
        if (query) params.append('query', query);
        if (location) params.append('location', location);
        if (specialty) params.append('specialty', specialty);
        if (rating) params.append('rating', rating);
        if (sort) params.append('sortBy', sort);

        // Add user location if enabled
        if (useLocation.checked) {
            try {
                const position = await getCurrentPosition();
                params.append('userLat', position.coords.latitude);
                params.append('userLng', position.coords.longitude);
            } catch (error) {
                console.error('Error getting location:', error);
                showAlert('Could not get your location. Please enter it manually.');
            }
        }

        const response = await fetch(`${API_BASE_URL}/search?${params.toString()}`);
        const results = await response.json();
        displaySearchResults(results);
    } catch (error) {
        console.error('Search failed:', error);
        showAlert('Search failed. Please try again.');
    }
}

// Get current position
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

// Display search results
function displaySearchResults(results) {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '';
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    No results found. Try adjusting your search criteria.
                </div>
            </div>`;
        return;
    }

    results.forEach(result => {
        const resultCard = createResultCard(result);
        resultsContainer.appendChild(resultCard);
    });
}

// Create result card
function createResultCard(result) {
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4 mb-4';
    card.innerHTML = `
        <div class="card h-100">
            <img src="${result.imageUrl || '/images/default-hospital.jpg'}" class="card-img-top" alt="${result.name}">
            <div class="card-body">
                <h5 class="card-title">${result.name}</h5>
                <p class="card-text">${result.description || ''}</p>
                <div class="mb-2">
                    <small class="text-muted">
                        <i class="fas fa-map-marker-alt"></i> ${result.address}
                    </small>
                </div>
                <div class="mb-2">
                    <small class="text-muted">
                        <i class="fas fa-stethoscope"></i> ${result.specialties.join(', ')}
                    </small>
                </div>
                ${result.distance ? `
                <div class="mb-2">
                    <small class="text-muted">
                        <i class="fas fa-location-arrow"></i> ${result.distance.toFixed(1)} km away
                    </small>
                </div>
                ` : ''}
                <div class="d-flex justify-content-between align-items-center">
                    <div class="rating">
                        ${generateStarRating(result.rating)}
                        <small class="text-muted ms-1">(${result.rating})</small>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="bookAppointment('${result.id}')">
                        Book Appointment
                    </button>
                </div>
            </div>
        </div>
    `;
    return card;
}

// Generate star rating
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star text-warning"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt text-warning"></i>';
        } else {
            stars += '<i class="far fa-star text-warning"></i>';
        }
    }
    
    return stars;
}

// Book appointment
async function bookAppointment(providerId) {
    if (!isAuthenticated()) {
        showLoginPrompt();
        return;
    }

    try {
        // Get available slots for today
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`${API_BASE_URL}/appointments/available/${providerId}?date=${today}`);
        const availableSlots = await response.json();

        if (!availableSlots || availableSlots.length === 0) {
            showAlert('No available slots for today. Please try another day.');
            return;
        }

        showBookingModal(providerId, availableSlots);
    } catch (error) {
        console.error('Failed to get available slots:', error);
        showAlert('Failed to load available appointment slots. Please try again.');
    }
}

// Show booking modal
function showBookingModal(providerId, availableSlots) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'bookingModal';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Book Appointment</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="bookingForm">
                        <div class="mb-3">
                            <label class="form-label">Select Date</label>
                            <input type="date" class="form-control" id="appointmentDate" 
                                min="${new Date().toISOString().split('T')[0]}" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Select Time</label>
                            <select class="form-select" id="appointmentTime" required>
                                ${availableSlots.map(slot => 
                                    `<option value="${slot}">${slot}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Notes (Optional)</label>
                            <textarea class="form-control" id="appointmentNotes" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="confirmBooking('${providerId}')">
                        Book Appointment
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bookingModal = new bootstrap.Modal(modal);
    bookingModal.show();

    // Add date change listener
    document.getElementById('appointmentDate').addEventListener('change', async (e) => {
        const date = e.target.value;
        const response = await fetch(`${API_BASE_URL}/appointments/available/${providerId}?date=${date}`);
        const slots = await response.json();
        
        const timeSelect = document.getElementById('appointmentTime');
        timeSelect.innerHTML = slots.map(slot => 
            `<option value="${slot}">${slot}</option>`
        ).join('');
    });
}

// Confirm booking
async function confirmBooking(providerId) {
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const notes = document.getElementById('appointmentNotes').value;

    if (!date || !time) {
        showAlert('Please select both date and time');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                providerId,
                userId: currentUser.id,
                date,
                time,
                notes
            })
        });

        const data = await response.json();
        if (data.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
            modal.hide();
            showAlert('Appointment booked successfully!', 'success');
            
            // Redirect to appointments page
            window.location.href = '/appointments';
        } else {
            showAlert(data.error || 'Failed to book appointment');
        }
    } catch (error) {
        console.error('Booking failed:', error);
        showAlert('Failed to book appointment. Please try again.');
    }
}

// Get user appointments
async function getUserAppointments() {
    if (!isAuthenticated()) {
        return [];
    }

    try {
        const response = await fetch(`${API_BASE_URL}/appointments/user/${currentUser.id}`);
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch appointments:', error);
        showAlert('Failed to load appointments');
        return [];
    }
}

// Display appointments
function displayAppointments(appointments) {
    const container = document.getElementById('appointmentsContainer');
    if (!container) return;

    if (appointments.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                You have no upcoming appointments.
                <a href="/" class="alert-link">Book an appointment</a>
            </div>
        `;
        return;
    }

    container.innerHTML = appointments.map(apt => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">${apt.hospitalName}</h5>
                    <span class="badge bg-${getStatusBadgeColor(apt.status)}">${apt.status}</span>
                </div>
                <p class="card-text">
                    <small class="text-muted">
                        <i class="fas fa-calendar"></i> ${apt.date} at ${apt.time}
                    </small>
                </p>
                ${apt.notes ? `
                    <p class="card-text">
                        <small class="text-muted">
                            <i class="fas fa-notes-medical"></i> ${apt.notes}
                        </small>
                    </p>
                ` : ''}
                <div class="mt-2">
                    ${apt.status === 'scheduled' ? `
                        <button class="btn btn-sm btn-danger" onclick="cancelAppointment('${apt.id}')">
                            Cancel Appointment
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Get status badge color
function getStatusBadgeColor(status) {
    switch (status) {
        case 'scheduled':
            return 'primary';
        case 'completed':
            return 'success';
        case 'cancelled':
            return 'danger';
        default:
            return 'secondary';
    }
}

// Cancel appointment
async function cancelAppointment(appointmentId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: 'cancelled'
            })
        });

        const data = await response.json();
        if (data.success) {
            showAlert('Appointment cancelled successfully', 'success');
            // Refresh appointments list
            const appointments = await getUserAppointments();
            displayAppointments(appointments);
        } else {
            showAlert(data.error || 'Failed to cancel appointment');
        }
    } catch (error) {
        console.error('Failed to cancel appointment:', error);
        showAlert('Failed to cancel appointment. Please try again.');
    }
}

// Load symptom form
async function loadSymptomForm() {
    if (!symptomForm) return;

    try {
        const response = await fetch(`${API_BASE_URL}/symptoms`);
        const symptoms = await response.json();
        
        symptomForm.innerHTML = `
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <h3 class="card-title mb-4">Symptom Checker</h3>
                        <form id="symptoms" onsubmit="handleSymptomCheck(event)">
                            <div class="mb-3">
                                <label class="form-label">Select your symptoms:</label>
                                <div class="symptom-checkboxes">
                                    ${symptoms.map(symptom => `
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" value="${symptom.id}" id="symptom${symptom.id}">
                                            <label class="form-check-label" for="symptom${symptom.id}">
                                                ${symptom.name}
                                            </label>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">How long have you been experiencing these symptoms?</label>
                                <select class="form-select" id="duration" required>
                                    <option value="">Select duration</option>
                                    <option value="1">Less than 24 hours</option>
                                    <option value="2">1-3 days</option>
                                    <option value="3">3-7 days</option>
                                    <option value="4">More than a week</option>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-primary">Check Symptoms</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Failed to load symptoms:', error);
        symptomForm.innerHTML = '<div class="col-12 text-center">Failed to load symptom checker. Please try again later.</div>';
    }
}

// Load symptom options
async function loadSymptomOptions() {
    try {
        const response = await fetch(`${API_BASE_URL}/symptoms`);
        const symptoms = await response.json();
        
        const symptomsContainer = document.querySelector('.symptom-checkboxes');
        symptomsContainer.innerHTML = symptoms.map(symptom => `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${symptom.id}" id="symptom${symptom.id}">
                <label class="form-check-label" for="symptom${symptom.id}">
                    ${symptom.name}
                </label>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load symptoms:', error);
    }
}

// Handle symptom check
async function handleSymptomCheck(event) {
    event.preventDefault();
    
    const selectedSymptoms = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .map(checkbox => parseInt(checkbox.value));
    
    const duration = document.getElementById('duration').value;

    if (selectedSymptoms.length === 0) {
        showAlert('Please select at least one symptom');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/symptom-check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                symptoms: selectedSymptoms,
                duration: parseInt(duration)
            })
        });

        const data = await response.json();
        displayRecommendations(data);
    } catch (error) {
        console.error('Symptom check failed:', error);
        showAlert('Failed to process symptoms. Please try again.');
    }
}

// Display recommendations
function displayRecommendations(data) {
    const symptomForm = document.getElementById('symptomForm');
    const recommendationsHtml = `
        <div class="col-md-8">
            <div class="card">
                <div class="card-body">
                    <h3 class="card-title mb-4">Recommendations</h3>
                    <div class="alert alert-${data.urgency === 'high' ? 'danger' : 'warning'}">
                        Urgency Level: ${data.urgency.toUpperCase()}
                    </div>
                    <h5>Recommended Actions:</h5>
                    <ul class="list-group mb-3">
                        ${data.recommendations.map(rec => `
                            <li class="list-group-item">${rec}</li>
                        `).join('')}
                    </ul>
                    <h5>Recommended Specialists:</h5>
                    <ul class="list-group">
                        ${data.specialists.map(spec => `
                            <li class="list-group-item">${spec}</li>
                        `).join('')}
                    </ul>
                    <div class="mt-4">
                        <button class="btn btn-primary" onclick="loadSymptomForm()">Check Another Symptom</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    symptomForm.innerHTML = recommendationsHtml;
}

// Utility functions
function showAlert(message, type = 'error') {
    const toast = document.getElementById('alertToast');
    const toastBody = toast.querySelector('.toast-body');
    
    toastBody.textContent = message;
    toast.classList.remove('bg-success', 'bg-danger');
    toast.classList.add(type === 'success' ? 'bg-success' : 'bg-danger');
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

function showLoginPrompt() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'loginModal';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Login Required</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>Please login to book appointments.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" onclick="window.location.href='/login'">Login</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    new bootstrap.Modal(modal).show();
} 