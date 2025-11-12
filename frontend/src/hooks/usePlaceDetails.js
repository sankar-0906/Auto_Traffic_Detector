import { useState, useEffect, useCallback } from 'react';
import { useGoogleMaps } from '../context/GoogleMapsContext';

/**
 * Hook to fetch place details using Places API
 * @param {string} placeId - Google Places place ID
 * @returns {Object} - { placeDetails, loading, error, fetchPlaceDetails }
 */
export const usePlaceDetails = (placeId = null) => {
  const { isLoaded, placesService, createPlacesService, geocoder } = useGoogleMaps();
  const [placeDetails, setPlaceDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlaceDetails = useCallback((placeIdToFetch, mapElement = null) => {
    if (!isLoaded || !placeIdToFetch) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // If PlacesService doesn't exist, create it
      let service = placesService;
      if (!service && mapElement) {
        service = createPlacesService(mapElement);
      }

      // If we still don't have a service, use Geocoder as fallback
      if (!service && geocoder) {
        geocoder.geocode({ placeId: placeIdToFetch }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const result = results[0];
            setPlaceDetails({
              placeId: placeIdToFetch,
              name: result.formatted_address,
              formattedAddress: result.formatted_address,
              geometry: result.geometry,
              addressComponents: result.address_components,
              types: result.types
            });
            setLoading(false);
          } else {
            setError(new Error(`Geocoding failed: ${status}`));
            setLoading(false);
          }
        });
        return;
      }

      // Use PlacesService if available
      if (service) {
        const request = {
          placeId: placeIdToFetch,
          fields: [
            'name',
            'formatted_address',
            'geometry',
            'address_components',
            'place_id',
            'types',
            'rating',
            'photos',
            'opening_hours'
          ]
        };

        service.getDetails(request, (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            setPlaceDetails({
              placeId: place.place_id,
              name: place.name,
              formattedAddress: place.formatted_address,
              geometry: place.geometry,
              addressComponents: place.address_components,
              types: place.types,
              rating: place.rating,
              photos: place.photos,
              openingHours: place.opening_hours
            });
            setLoading(false);
          } else {
            setError(new Error(`Places service failed: ${status}`));
            setLoading(false);
          }
        });
      } else {
        setError(new Error('PlacesService not available'));
        setLoading(false);
      }
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }, [isLoaded, placesService, createPlacesService, geocoder]);

  // Auto-fetch if placeId is provided
  useEffect(() => {
    if (placeId && isLoaded) {
      fetchPlaceDetails(placeId);
    }
  }, [placeId, isLoaded, fetchPlaceDetails]);

  return {
    placeDetails,
    loading,
    error,
    fetchPlaceDetails
  };
};

