const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
};

const deg2rad = (deg) => {
    return deg * (Math.PI/180);
};

const findKNearest = (userLocation, locations, k = 5) => {
    // Add distance to each location
    const locationsWithDistance = locations.map(location => ({
        ...location,
        distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            location.latitude,
            location.longitude
        )
    }));

    // Sort by distance
    locationsWithDistance.sort((a, b) => a.distance - b.distance);

    // Return k nearest locations
    return locationsWithDistance.slice(0, k);
};

module.exports = {
    findKNearest,
    calculateDistance
}; 