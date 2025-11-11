/**
 * Traffic Map Component
 * Google Maps integration with traffic layer
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { GoogleMap, LoadScript, TrafficLayer, Marker, DirectionsRenderer } from '@react-google-maps/api';
import api from '../../config/api';
import './Map.css';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090, // New Delhi
};

const TrafficMap = ({ origin, destination, onTrafficDetected }) => {
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [trafficAlerts, setTrafficAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Get directions when origin/destination changes
  useEffect(() => {
    if (origin && destination && map) {
      fetchDirections();
    }
  }, [origin, destination, map]);

  // Fetch nearby traffic alerts
  useEffect(() => {
    if (map) {
      const center = map.getCenter();
      if (center) {
        fetchTrafficAlerts(center.lat(), center.lng());
      }
    }
  }, [map]);

  const fetchDirections = async () => {
    if (!origin || !destination) return;

    // Check if Google Maps API is loaded
    if (!window.google || !window.google.maps) {
      console.error('Google Maps API is not loaded');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/traffic/directions', {
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
      });

      const { directions, congestion } = response.data.data;

      // Use first route for display
      if (directions.routes && directions.routes.length > 0) {
        const directionsService = new window.google.maps.DirectionsService();
        const directionsRenderer = new window.google.maps.DirectionsRenderer({
          map: mapRef.current,
          suppressMarkers: false,
        });

        directionsService.route(
          {
            origin: { lat: origin.lat, lng: origin.lng },
            destination: { lat: destination.lat, lng: destination.lng },
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === 'OK') {
              directionsRenderer.setDirections(result);
              setDirections(result);

              // Check for congestion
              const worstRoute = congestion.reduce((prev, current) =>
                current.congestionLength > prev.congestionLength ? current : prev
              );

              if (worstRoute.congestionLength > 1.0 && onTrafficDetected) {
                onTrafficDetected(worstRoute);
              }
            } else {
              console.error('Directions request failed:', status);
            }
          }
        );
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrafficAlerts = async (lat, lng) => {
    try {
      const response = await api.get('/traffic/data', {
        params: { lat, lng },
      });

      setTrafficAlerts(response.data.data.alerts || []);
    } catch (error) {
      console.error('Error fetching traffic alerts:', error);
    }
  };

  const getMarkerColor = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'red';
      case 'HIGH':
        return 'orange';
      case 'MEDIUM':
        return 'yellow';
      default:
        return 'green';
    }
  };

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // Show error if API key is missing
  if (!apiKey || apiKey === 'your-google-maps-api-key') {
    return (
      <div className="map-container">
        <div className="map-error">
          <h3>Google Maps API Key Missing</h3>
          <p>Please set REACT_APP_GOOGLE_MAPS_API_KEY in your .env file</p>
        </div>
      </div>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      loadingElement={<div className="map-loading">Loading Google Maps...</div>}
      onError={(error) => {
        console.error('Error loading Google Maps:', error);
      }}
    >
      <div className="map-container">
        {loading && <div className="map-loading">Loading directions...</div>}
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={origin || defaultCenter}
          zoom={origin ? 12 : 10}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
          }}
        >
          <TrafficLayer />

          {/* Origin Marker */}
          {origin && (
            <Marker
              position={{ lat: origin.lat, lng: origin.lng }}
              label="O"
              title="Origin"
            />
          )}

          {/* Destination Marker */}
          {destination && (
            <Marker
              position={{ lat: destination.lat, lng: destination.lng }}
              label="D"
              title="Destination"
            />
          )}

          {/* Traffic Alert Markers */}
          {trafficAlerts.map((alert) => {
            // Only render marker if Google Maps is loaded
            if (!window.google || !window.google.maps) return null;
            
            return (
              <Marker
                key={alert.id}
                position={{ lat: alert.startLat, lng: alert.startLng }}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: getMarkerColor(alert.severity),
                  fillOpacity: 0.8,
                  strokeColor: '#fff',
                  strokeWeight: 2,
                }}
                title={`Traffic Alert: ${alert.congestionLength.toFixed(2)}km`}
              />
            );
          })}

          {/* Directions Renderer */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  strokeColor: '#667eea',
                  strokeWeight: 5,
                },
              }}
            />
          )}
        </GoogleMap>
      </div>
    </LoadScript>
  );
};

export default TrafficMap;

