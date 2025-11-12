const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Get traffic data from Google Maps Directions API
 * Returns route with traffic information
 */
const getTrafficData = async (startLat, startLng, endLat, endLng) => {
  try {
    const origin = `${startLat},${startLng}`;
    const destination = `${endLat},${endLng}`;

    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin,
        destination,
        key: GOOGLE_MAPS_API_KEY,
        departure_time: 'now',
        traffic_model: 'best_guess',
        alternatives: true
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${response.data.status}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching traffic data:', error.message);
    throw error;
  }
};

/**
 * Analyze traffic congestion from route data
 * Returns congestion segments with severity and length
 */
const analyzeTrafficCongestion = (route) => {
  const congestionSegments = [];
  let totalCongestionKm = 0;

  if (!route.legs || route.legs.length === 0) {
    return { congestionSegments, totalCongestionKm, severity: 'LOW' };
  }

  route.legs.forEach(leg => {
    if (leg.steps) {
      leg.steps.forEach(step => {
        // Check if step has traffic speed limit or congestion data
        // Google Maps API provides duration_in_traffic vs duration
        const duration = step.duration?.value || 0;
        const durationInTraffic = step.duration_in_traffic?.value || duration;
        
        // Calculate congestion factor (if duration_in_traffic > duration, there's congestion)
        const congestionFactor = durationInTraffic / duration;
        const distance = step.distance?.value / 1000 || 0; // Convert to km

        if (congestionFactor > 1.2) { // 20% slower indicates congestion
          const severity = congestionFactor > 2 ? 'HIGH' : 'MODERATE';
          congestionSegments.push({
            start: step.start_location,
            end: step.end_location,
            distance,
            severity,
            congestionFactor
          });
          totalCongestionKm += distance;
        }
      });
    }
  });

  // Determine overall severity
  let severity = 'LOW';
  if (totalCongestionKm > 1) {
    severity = 'HIGH';
  } else if (totalCongestionKm > 0.5) {
    severity = 'MODERATE';
  }

  return { congestionSegments, totalCongestionKm, severity };
};

/**
 * Detect traffic congestion for a region
 * Returns alert data if congestion > 1km
 */
const detectRegionTraffic = async (region) => {
  try {
    // Get traffic data for the region
    const trafficData = await getTrafficData(
      region.startLat,
      region.startLng,
      region.endLat,
      region.endLng
    );

    if (!trafficData.routes || trafficData.routes.length === 0) {
      return null;
    }

    // Analyze the primary route
    const primaryRoute = trafficData.routes[0];
    const analysis = analyzeTrafficCongestion(primaryRoute);

    // Check if congestion exceeds 1km threshold
    if (analysis.totalCongestionKm > 1) {
      return {
        regionId: region.id,
        trafficLevel: analysis.severity,
        lengthKm: analysis.totalCongestionKm,
        message: `Heavy traffic detected: ${analysis.totalCongestionKm.toFixed(2)} km of congestion in ${region.name}`,
        congestionSegments: analysis.congestionSegments,
        routeData: primaryRoute
      };
    }

    return null;
  } catch (error) {
    console.error(`Error detecting traffic for region ${region.id}:`, error.message);
    return null;
  }
};

/**
 * Detect traffic for a user route
 */
const detectRouteTraffic = async (route) => {
  try {
    const trafficData = await getTrafficData(
      route.sourceLat,
      route.sourceLng,
      route.destinationLat,
      route.destinationLng
    );

    if (!trafficData.routes || trafficData.routes.length === 0) {
      return {
        hasTraffic: false,
        severity: 'LOW',
        congestionKm: 0
      };
    }

    const primaryRoute = trafficData.routes[0];
    const analysis = analyzeTrafficCongestion(primaryRoute);

    return {
      hasTraffic: analysis.totalCongestionKm > 0.5,
      severity: analysis.severity,
      congestionKm: analysis.totalCongestionKm,
      estimatedTime: primaryRoute.legs[0]?.duration_in_traffic?.text || primaryRoute.legs[0]?.duration?.text,
      distance: primaryRoute.legs[0]?.distance?.text,
      route: primaryRoute
    };
  } catch (error) {
    console.error(`Error detecting traffic for route ${route.id}:`, error.message);
    return {
      hasTraffic: false,
      severity: 'LOW',
      congestionKm: 0,
      error: error.message
    };
  }
};

/**
 * Get alternate routes with traffic information
 */
const getAlternateRoutes = async (startLat, startLng, endLat, endLng) => {
  try {
    const trafficData = await getTrafficData(startLat, startLng, endLat, endLng);

    if (!trafficData.routes || trafficData.routes.length === 0) {
      return [];
    }

    return trafficData.routes.map((route, index) => {
      const analysis = analyzeTrafficCongestion(route);
      const leg = route.legs[0];
      
      return {
        routeIndex: index,
        distance: leg.distance?.text,
        duration: leg.duration?.text,
        durationInTraffic: leg.duration_in_traffic?.text || leg.duration?.text,
        severity: analysis.severity,
        congestionKm: analysis.totalCongestionKm,
        overviewPolyline: route.overview_polyline,
        steps: route.legs[0]?.steps || []
      };
    });
  } catch (error) {
    console.error('Error getting alternate routes:', error.message);
    return [];
  }
};

module.exports = {
  detectRegionTraffic,
  detectRouteTraffic,
  getAlternateRoutes,
  getTrafficData,
  calculateDistance
};

