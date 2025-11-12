/**
 * Map Synchronization Utilities
 * Helper functions to sync map view with selected places
 */

/**
 * Center map on a place
 * @param {Object} map - Google Maps map instance
 * @param {Object} place - Place object with lat, lng, and optional zoom
 * @param {number} defaultZoom - Default zoom level if not provided in place
 */
export const centerMapOnPlace = (map, place, defaultZoom = 15) => {
  if (!map || !place || !place.lat || !place.lng) {
    return;
  }

  const position = {
    lat: place.lat,
    lng: place.lng
  };

  map.setCenter(position);
  map.setZoom(place.zoom || defaultZoom);
};

/**
 * Add marker to map
 * @param {Object} map - Google Maps map instance
 * @param {Object} place - Place object with lat, lng, and optional label
 * @returns {Object} - Marker instance
 */
export const addMarkerToMap = (map, place, label = null) => {
  if (!map || !place || !place.lat || !place.lng) {
    return null;
  }

  if (!window.google || !window.google.maps) {
    return null;
  }

  const markerOptions = {
    position: {
      lat: place.lat,
      lng: place.lng
    },
    map: map
  };

  if (label) {
    markerOptions.label = label;
  }

  if (place.title) {
    markerOptions.title = place.title;
  }

  return new window.google.maps.Marker(markerOptions);
};

/**
 * Clear all markers from map
 * @param {Array} markers - Array of marker instances
 */
export const clearMarkers = (markers) => {
  if (!markers || !Array.isArray(markers)) {
    return;
  }

  markers.forEach(marker => {
    if (marker && marker.setMap) {
      marker.setMap(null);
    }
  });
};

/**
 * Fit map to show multiple places
 * @param {Object} map - Google Maps map instance
 * @param {Array} places - Array of place objects with lat, lng
 * @param {Object} options - Options for bounds (padding, etc.)
 */
export const fitMapToPlaces = (map, places, options = {}) => {
  if (!map || !places || !Array.isArray(places) || places.length === 0) {
    return;
  }

  if (!window.google || !window.google.maps) {
    return;
  }

  const bounds = new window.google.maps.LatLngBounds();
  
  places.forEach(place => {
    if (place && place.lat && place.lng) {
      bounds.extend({
        lat: place.lat,
        lng: place.lng
      });
    }
  });

  const padding = options.padding || 50;
  map.fitBounds(bounds, { padding });
};

