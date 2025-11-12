import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLoadScript } from '@react-google-maps/api';

const GoogleMapsContext = createContext(null);

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error('useGoogleMaps must be used within GoogleMapsProvider');
  }
  return context;
};

export const GoogleMapsProvider = ({ children }) => {
  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleMapsApiKey || '',
    libraries: ['places']
  });

  const [autocompleteService, setAutocompleteService] = useState(null);
  const [placesService, setPlacesService] = useState(null);
  const [geocoder, setGeocoder] = useState(null);

  // Initialize Google Maps services when loaded
  useEffect(() => {
    if (isLoaded && window.google && window.google.maps) {
      // Initialize AutocompleteService for predictions
      const autocomplete = new window.google.maps.places.AutocompleteService();
      setAutocompleteService(autocomplete);

      // Initialize Geocoder for reverse geocoding
      const geocoderInstance = new window.google.maps.Geocoder();
      setGeocoder(geocoderInstance);

      // PlacesService will be initialized per map instance
      // We'll create it when needed since it requires a map element
    }
  }, [isLoaded]);

  const value = {
    isLoaded,
    loadError,
    autocompleteService,
    placesService,
    geocoder,
    googleMapsApiKey,
    // Helper function to create PlacesService for a map
    createPlacesService: (map) => {
      if (map && window.google && window.google.maps) {
        const service = new window.google.maps.places.PlacesService(map);
        setPlacesService(service);
        return service;
      }
      return null;
    }
  };

  return (
    <GoogleMapsContext.Provider value={value}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

