import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
from hospitals.models import Hospital, Doctor
from math import radians, sin, cos, sqrt, atan2

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate the distance between two points on Earth using the Haversine formula."""
    R = 6371  # Earth's radius in kilometers
    
    lat1, lon1, lat2, lon2 = map(radians, [float(lat1), float(lon1), float(lat2), float(lon2)])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    distance = R * c
    
    return distance

class HealthcareRecommender:
    def __init__(self):
        self.scaler = StandardScaler()
    
    def get_hospital_features(self, hospital):
        """Extract relevant features from a hospital for recommendation."""
        return [
            float(hospital.average_rating),
            float(hospital.success_rate),
            hospital.total_reviews,
            1 if hospital.emergency_services else 0,
            len(hospital.facilities),
            hospital.doctors.count()
        ]
    
    def get_doctor_features(self, doctor):
        """Extract relevant features from a doctor for recommendation."""
        return [
            float(doctor.average_rating),
            float(doctor.success_rate),
            doctor.total_reviews,
            doctor.years_of_experience,
            len(doctor.education),
            len(doctor.certifications),
            doctor.specialties.count(),
            float(doctor.consultation_fee)
        ]
    
    def recommend_hospitals(self, user_location, max_distance=50, hospital_type=None, min_rating=0):
        """
        Recommend hospitals based on user preferences and location.
        
        Args:
            user_location: tuple of (latitude, longitude)
            max_distance: maximum distance in kilometers
            hospital_type: type of hospital to filter by
            min_rating: minimum average rating to consider
        
        Returns:
            List of recommended hospitals with similarity scores
        """
        # Filter hospitals by basic criteria
        hospitals = Hospital.objects.filter(average_rating__gte=min_rating)
        if hospital_type:
            hospitals = hospitals.filter(hospital_type=hospital_type)
        
        if not hospitals.exists():
            return []
        
        # Filter by distance
        user_lat, user_lon = user_location
        hospitals_in_range = []
        
        for hospital in hospitals:
            distance = haversine_distance(
                user_lat, user_lon,
                float(hospital.latitude), float(hospital.longitude)
            )
            if distance <= max_distance:
                hospitals_in_range.append((hospital, distance))
        
        if not hospitals_in_range:
            return []
        
        # Extract features for similarity calculation
        hospital_features = [self.get_hospital_features(h[0]) for h in hospitals_in_range]
        
        # Normalize features
        normalized_features = self.scaler.fit_transform(hospital_features)
        
        # Calculate similarity scores
        similarity_matrix = cosine_similarity(normalized_features)
        
        # Combine similarity scores with distance penalty
        recommendations = []
        for i, (hospital, distance) in enumerate(hospitals_in_range):
            # Calculate distance penalty (1 at distance=0, 0.5 at max_distance)
            distance_penalty = 1 - (distance / (2 * max_distance))
            
            # Average similarity with other hospitals
            avg_similarity = np.mean(similarity_matrix[i])
            
            # Final score combining similarity and distance
            final_score = avg_similarity * distance_penalty
            
            recommendations.append({
                'hospital': hospital,
                'score': final_score,
                'distance': distance
            })
        
        # Sort by score
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        
        return recommendations
    
    def recommend_doctors(self, specialties=None, hospital=None, min_rating=0, max_fee=None):
        """
        Recommend doctors based on user preferences.
        
        Args:
            specialties: list of specialty names to filter by
            hospital: specific hospital to filter by
            min_rating: minimum average rating to consider
            max_fee: maximum consultation fee
        
        Returns:
            List of recommended doctors with similarity scores
        """
        # Filter doctors by basic criteria
        doctors = Doctor.objects.filter(average_rating__gte=min_rating)
        
        if specialties:
            doctors = doctors.filter(specialties__name__in=specialties).distinct()
        
        if hospital:
            doctors = doctors.filter(hospitals=hospital)
            
        if max_fee is not None:
            doctors = doctors.filter(consultation_fee__lte=max_fee)
        
        if not doctors.exists():
            return []
        
        # Extract features for similarity calculation
        doctor_features = [self.get_doctor_features(d) for d in doctors]
        
        # Normalize features
        normalized_features = self.scaler.fit_transform(doctor_features)
        
        # Calculate similarity scores
        similarity_matrix = cosine_similarity(normalized_features)
        
        # Prepare recommendations
        recommendations = []
        for i, doctor in enumerate(doctors):
            # Average similarity with other doctors
            avg_similarity = np.mean(similarity_matrix[i])
            
            recommendations.append({
                'doctor': doctor,
                'score': avg_similarity
            })
        
        # Sort by score
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        
        return recommendations 