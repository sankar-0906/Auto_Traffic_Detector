/**
 * Google Maps Service
 * Handles all Google Maps API interactions
 */

const axios = require('axios');
const logger = require('../config/logger');

class GoogleMapsService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
  }

  /**
   * Get directions between two points
   */
  async getDirections(origin, destination, options = {}) {
    try {
      const params = {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        key: this.apiKey,
        alternatives: options.alternatives || true,
        traffic_model: options.trafficModel || 'best_guess',
        departure_time: options.departureTime || 'now',
      };

      const response = await axios.get(`${this.baseUrl}/directions/json`, {
        params,
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      return response.data;
    } catch (error) {
      logger.error('Get directions error:', error);
      throw error;
    }
  }

  /**
   * Get distance matrix between multiple points
   */
  async getDistanceMatrix(origins, destinations, options = {}) {
    try {
      const params = {
        origins: origins.map((o) => `${o.lat},${o.lng}`).join('|'),
        destinations: destinations.map((d) => `${d.lat},${d.lng}`).join('|'),
        key: this.apiKey,
        traffic_model: options.trafficModel || 'best_guess',
        departure_time: options.departureTime || 'now',
      };

      const response = await axios.get(`${this.baseUrl}/distancematrix/json`, {
        params,
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      return response.data;
    } catch (error) {
      logger.error('Get distance matrix error:', error);
      throw error;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(lat, lng) {
    try {
      const params = {
        latlng: `${lat},${lng}`,
        key: this.apiKey,
      };

      const response = await axios.get(`${this.baseUrl}/geocode/json`, {
        params,
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      return response.data.results[0]?.formatted_address || null;
    } catch (error) {
      logger.error('Reverse geocode error:', error);
      throw error;
    }
  }

  /**
   * Geocode address to coordinates
   */
  async geocode(address) {
    try {
      const params = {
        address,
        key: this.apiKey,
      };

      const response = await axios.get(`${this.baseUrl}/geocode/json`, {
        params,
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      const location = response.data.results[0]?.geometry?.location;
      return location ? { lat: location.lat, lng: location.lng } : null;
    } catch (error) {
      logger.error('Geocode error:', error);
      throw error;
    }
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  /**
   * Convert degrees to radians
   */
  toRad(degrees) {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Analyze traffic congestion from directions data
   */
  analyzeTrafficCongestion(directionsData) {
    try {
      const routes = directionsData.routes || [];
      const congestionData = [];

      routes.forEach((route, index) => {
        const legs = route.legs || [];
        let totalDistance = 0;
        let totalDuration = 0;
        let totalDurationInTraffic = 0;
        let congestedSegments = [];

        legs.forEach((leg) => {
          totalDistance += leg.distance?.value || 0; // in meters
          totalDuration += leg.duration?.value || 0; // in seconds
          totalDurationInTraffic += leg.duration_in_traffic?.value || leg.duration?.value || 0;

          // Analyze steps for congestion
          const steps = leg.steps || [];
          steps.forEach((step) => {
            const stepDistance = step.distance?.value || 0; // in meters
            const stepDuration = step.duration?.value || 0;
            const stepDurationInTraffic = step.duration_in_traffic?.value || stepDuration;

            // Calculate congestion factor
            const congestionFactor = stepDurationInTraffic / stepDuration;
            if (congestionFactor > 1.2) {
              // More than 20% delay indicates congestion
              congestedSegments.push({
                distance: stepDistance / 1000, // convert to km
                congestionFactor,
                startLocation: step.start_location,
                endLocation: step.end_location,
              });
            }
          });
        });

        // Calculate total congestion length
        const congestionLength = congestedSegments.reduce(
          (sum, seg) => sum + seg.distance,
          0
        );

        congestionData.push({
          routeIndex: index,
          totalDistance: totalDistance / 1000, // convert to km
          totalDuration: totalDuration,
          totalDurationInTraffic: totalDurationInTraffic,
          congestionLength,
          congestedSegments,
          summary: route.summary,
        });
      });

      return congestionData;
    } catch (error) {
      logger.error('Analyze traffic congestion error:', error);
      throw error;
    }
  }
}

module.exports = new GoogleMapsService();

