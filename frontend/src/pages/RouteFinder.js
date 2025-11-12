import React, { useState, useRef, useEffect } from 'react';
import axios from '../services/api';
import { GoogleMap, DirectionsRenderer, TrafficLayer, Marker } from '@react-google-maps/api';
import { useGoogleMaps } from '../context/GoogleMapsContext';
import AutocompleteInput from '../components/AutocompleteInput';
import { centerMapOnPlace, addMarkerToMap, clearMarkers, fitMapToPlaces } from '../utils/mapSync';

const mapContainerStyle = {
  width: '100%',
  height: '600px'
};

const RouteFinder = () => {
  const [source, setSource] = useState({ lat: null, lng: null, address: '' });
  const [destination, setDestination] = useState({ lat: null, lng: null, address: '' });
  const [directions, setDirections] = useState(null);
  const [alternateRoutes, setAlternateRoutes] = useState([]);
  const [trafficData, setTrafficData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [avoidTraffic, setAvoidTraffic] = useState(false);
  const mapRef = useRef(null);
  const sourceMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);

  const { isLoaded, loadError, googleMapsApiKey } = useGoogleMaps();

  // Handle source selection
  const handleSourceSelect = (place) => {
    const newSource = {
      lat: place.lat,
      lng: place.lng,
      address: place.formattedAddress || place.name
    };
    setSource(newSource);

    // Sync with map
    if (mapRef.current) {
      centerMapOnPlace(mapRef.current, newSource, 14);
      
      // Remove old marker
      if (sourceMarkerRef.current) {
        clearMarkers([sourceMarkerRef.current]);
      }
      
      // Add new marker
      sourceMarkerRef.current = addMarkerToMap(mapRef.current, { ...newSource, title: 'Source' }, 'S');
      
      // Fit map to show both source and destination if destination exists
      if (destination.lat && destination.lng) {
        fitMapToPlaces(mapRef.current, [newSource, destination], { padding: 50 });
      }
    }
  };

  // Handle destination selection
  const handleDestinationSelect = (place) => {
    const newDestination = {
      lat: place.lat,
      lng: place.lng,
      address: place.formattedAddress || place.name
    };
    setDestination(newDestination);

    // Sync with map
    if (mapRef.current) {
      centerMapOnPlace(mapRef.current, newDestination, 14);
      
      // Remove old marker
      if (destMarkerRef.current) {
        clearMarkers([destMarkerRef.current]);
      }
      
      // Add new marker
      destMarkerRef.current = addMarkerToMap(mapRef.current, { ...newDestination, title: 'Destination' }, 'D');
      
      // Fit map to show both source and destination if source exists
      if (source.lat && source.lng) {
        fitMapToPlaces(mapRef.current, [source, newDestination], { padding: 50 });
      }
    }
  };

  // Handle source change (manual typing)
  const handleSourceChange = (value) => {
    setSource(prev => ({ ...prev, address: value }));
    if (!value) {
      setSource({ lat: null, lng: null, address: '' });
      if (sourceMarkerRef.current) {
        clearMarkers([sourceMarkerRef.current]);
        sourceMarkerRef.current = null;
      }
    }
  };

  // Handle destination change (manual typing)
  const handleDestinationChange = (value) => {
    setDestination(prev => ({ ...prev, address: value }));
    if (!value) {
      setDestination({ lat: null, lng: null, address: '' });
      if (destMarkerRef.current) {
        clearMarkers([destMarkerRef.current]);
        destMarkerRef.current = null;
      }
    }
  };

  // Map sync callback for source
  const handleSourceMapSync = (place) => {
    if (mapRef.current) {
      centerMapOnPlace(mapRef.current, place, 14);
      if (sourceMarkerRef.current) {
        clearMarkers([sourceMarkerRef.current]);
      }
      sourceMarkerRef.current = addMarkerToMap(mapRef.current, { ...place, title: 'Source' }, 'S');
    }
  };

  // Map sync callback for destination
  const handleDestMapSync = (place) => {
    if (mapRef.current) {
      centerMapOnPlace(mapRef.current, place, 14);
      if (destMarkerRef.current) {
        clearMarkers([destMarkerRef.current]);
      }
      destMarkerRef.current = addMarkerToMap(mapRef.current, { ...place, title: 'Destination' }, 'D');
    }
  };

  // Calculate traffic data from directions result
  const calculateTrafficData = (directionsResult) => {
    if (!directionsResult || !directionsResult.routes || directionsResult.routes.length === 0) {
      return null;
    }

    const primaryRoute = directionsResult.routes[0];
    const leg = primaryRoute.legs[0];
    
    if (!leg) {
      return null;
    }

    // Calculate congestion from duration difference
    const duration = leg.duration?.value || 0; // in seconds
    const durationInTraffic = leg.duration_in_traffic?.value || duration;
    const distance = leg.distance?.value / 1000 || 0; // in km
    
    // Calculate congestion by analyzing steps (similar to backend logic)
    let totalCongestionKm = 0;
    if (primaryRoute.legs && primaryRoute.legs.length > 0) {
      primaryRoute.legs.forEach(leg => {
        if (leg.steps) {
          leg.steps.forEach(step => {
            const stepDuration = step.duration?.value || 0;
            const stepDurationInTraffic = step.duration_in_traffic?.value || stepDuration;
            const stepDistance = step.distance?.value / 1000 || 0; // in km
            
            // Calculate congestion factor (if duration_in_traffic > duration, there's congestion)
            const congestionFactor = stepDuration > 0 ? stepDurationInTraffic / stepDuration : 1;
            
            // If 20% slower, consider it congestion
            if (congestionFactor > 1.2) {
              totalCongestionKm += stepDistance;
            }
          });
        }
      });
    }
    
    // Determine severity based on total congestion
    let severity = 'LOW';
    if (totalCongestionKm > 1) {
      severity = 'HIGH';
    } else if (totalCongestionKm > 0.5) {
      severity = 'MODERATE';
    }

    return {
      severity,
      congestionKm: totalCongestionKm,
      estimatedTime: leg.duration_in_traffic?.text || leg.duration?.text || 'N/A',
      distance: leg.distance?.text || 'N/A',
      duration: leg.duration?.text || 'N/A',
      durationInTraffic: leg.duration_in_traffic?.text || leg.duration?.text || 'N/A'
    };
  };

  const handleSearch = async () => {
    if (!source.lat || !destination.lat) {
      alert('Please enter valid source and destination');
      return;
    }

    setLoading(true);
    setTrafficData(null);
    setDirections(null);
    setAlternateRoutes([]);

    try {
      // Get directions first (this is required for displaying the route)
      const directionsService = new window.google.maps.DirectionsService();
      
      directionsService.route(
        {
          origin: { lat: source.lat, lng: source.lng },
          destination: { lat: destination.lat, lng: destination.lng },
          travelMode: window.google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: true,
          drivingOptions: {
            departureTime: new Date() // Current time for traffic data
          }
        },
        async (result, status) => {
          if (status === 'OK' && result) {
            // Set directions to display route on map
            // DirectionsRenderer expects the full result object
            setDirections(result);
            setAlternateRoutes(result.routes || []);
            
            // Calculate traffic data from directions
            const calculatedTraffic = calculateTrafficData(result);
            if (calculatedTraffic) {
              setTrafficData(calculatedTraffic);
            }
            
            // Try to get more detailed traffic data from backend
            try {
              const trafficResponse = await axios.post('/traffic/check', {
                sourceLat: source.lat,
                sourceLng: source.lng,
                destinationLat: destination.lat,
                destinationLng: destination.lng
              });
              
              // Merge backend data with calculated data (backend has more detailed analysis)
              if (trafficResponse.data.success && trafficResponse.data.data) {
                const backendData = trafficResponse.data.data;
                setTrafficData({
                  severity: backendData.severity || calculatedTraffic?.severity || 'LOW',
                  congestionKm: backendData.congestionKm || calculatedTraffic?.congestionKm || 0,
                  estimatedTime: backendData.estimatedTime || calculatedTraffic?.estimatedTime || 'N/A',
                  distance: calculatedTraffic?.distance || 'N/A',
                  duration: calculatedTraffic?.duration || 'N/A',
                  durationInTraffic: calculatedTraffic?.durationInTraffic || 'N/A'
                });
              }
            } catch (backendError) {
              console.warn('Backend traffic check failed, using calculated data:', backendError);
              // Use calculated data if backend fails
              if (calculatedTraffic) {
                setTrafficData(calculatedTraffic);
              }
            }
            
            // Fit map to show the route
            if (mapRef.current && result.routes && result.routes.length > 0) {
              const bounds = new window.google.maps.LatLngBounds();
              result.routes[0].legs.forEach(leg => {
                bounds.extend(leg.start_location);
                bounds.extend(leg.end_location);
              });
              mapRef.current.fitBounds(bounds, { padding: 50 });
            }
          } else {
            console.error('Directions error:', status);
            alert(`Failed to get directions: ${status}`);
          }
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error searching route:', error);
      alert('Error searching route. Please try again.');
      setLoading(false);
    }
  };

  const handleSaveRoute = async () => {
    if (!source.lat || !destination.lat) {
      alert('Please search for a route first');
      return;
    }

    try {
      await axios.post('/user/route', {
        sourceLat: source.lat,
        sourceLng: source.lng,
        destinationLat: destination.lat,
        destinationLng: destination.lng,
        sourceAddress: source.address,
        destAddress: destination.address,
        isDaily: false
      });
      alert('Route saved successfully!');
    } catch (error) {
      console.error('Error saving route:', error);
      alert('Failed to save route');
    }
  };

  // Cleanup markers on unmount
  useEffect(() => {
    return () => {
      if (sourceMarkerRef.current) {
        clearMarkers([sourceMarkerRef.current]);
      }
      if (destMarkerRef.current) {
        clearMarkers([destMarkerRef.current]);
      }
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  if (!googleMapsApiKey) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 max-w-2xl mx-4">
          <p className="text-yellow-800 font-semibold text-xl mb-4">⚠️ Google Maps API Key Not Set</p>
          <p className="text-yellow-700 mb-4">
            Please add REACT_APP_GOOGLE_MAPS_API_KEY to frontend/.env file
          </p>
          <div className="bg-yellow-100 p-4 rounded mb-4">
            <p className="text-yellow-800 font-mono text-sm">REACT_APP_GOOGLE_MAPS_API_KEY=your-api-key-here</p>
          </div>
          <p className="text-yellow-600 text-sm">
            See <span className="font-semibold">GOOGLE_MAPS_API_SETUP.md</span> for detailed setup instructions
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 max-w-2xl mx-4">
          <p className="text-red-800 font-semibold text-xl mb-4">❌ Google Maps API Error</p>
          <p className="text-red-700 mb-2">{loadError.message || 'Failed to load Google Maps'}</p>
          <p className="text-red-600 text-sm mb-4">Common issues:</p>
          <ul className="text-red-600 text-sm list-disc list-inside mb-4 space-y-1">
            <li>API key is invalid or incorrect</li>
            <li>Required APIs are not enabled (Maps JavaScript API, Places API)</li>
            <li>Billing is not enabled in Google Cloud Console</li>
            <li>API key restrictions block localhost:3000</li>
            <li>API key has reached quota limits</li>
          </ul>
          <p className="text-blue-600 text-sm underline cursor-pointer hover:text-blue-800" onClick={() => window.open('https://console.cloud.google.com/', '_blank')}>
            → Check Google Cloud Console
          </p>
          <p className="text-gray-600 text-xs mt-4">
            See GOOGLE_MAPS_API_SETUP.md for detailed solutions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Route Finder</h1>
        <p className="text-gray-600 mt-2">Find the best route with live traffic information</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <AutocompleteInput
            label="Source"
            value={source.address}
            onSelect={handleSourceSelect}
            onChange={handleSourceChange}
            onMapSync={handleSourceMapSync}
            placeholder="Type to search address..."
            showCoordinates={true}
          />
          <AutocompleteInput
            label="Destination"
            value={destination.address}
            onSelect={handleDestinationSelect}
            onChange={handleDestinationChange}
            onMapSync={handleDestMapSync}
            placeholder="Type to search address..."
            showCoordinates={true}
          />
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleSearch}
            disabled={loading || !source.lat || !destination.lat}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search Route'}
          </button>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={avoidTraffic}
              onChange={(e) => setAvoidTraffic(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Avoid heavy traffic</span>
          </label>
          {directions && (
            <button
              onClick={handleSaveRoute}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium"
            >
              Save Route
            </button>
          )}
        </div>
      </div>

      {/* Traffic Summary */}
      {trafficData && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Traffic Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Severity</p>
              <p className={`text-2xl font-bold ${
                trafficData.severity === 'HIGH' ? 'text-red-600' :
                trafficData.severity === 'MODERATE' ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {trafficData.severity || 'LOW'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Congestion</p>
              <p className="text-2xl font-bold text-gray-900">
                {typeof trafficData.congestionKm === 'number' 
                  ? trafficData.congestionKm.toFixed(2) 
                  : trafficData.congestionKm || '0.00'} km
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estimated Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {trafficData.estimatedTime || trafficData.durationInTraffic || 'N/A'}
              </p>
            </div>
          </div>
          {trafficData.distance && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Distance</p>
                  <p className="text-lg font-semibold text-gray-900">{trafficData.distance}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration (No Traffic)</p>
                  <p className="text-lg font-semibold text-gray-900">{trafficData.duration || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Map */}
      <div className="bg-white shadow rounded-lg p-6">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={source.lat ? { lat: source.lat, lng: source.lng } : { lat: 13.0827, lng: 80.2707 }}
          zoom={12}
          onLoad={(map) => {
            mapRef.current = map;
            // Add markers if source/destination already exist
            if (source.lat && source.lng) {
              sourceMarkerRef.current = addMarkerToMap(map, { ...source, title: 'Source' }, 'S');
            }
            if (destination.lat && destination.lng) {
              destMarkerRef.current = addMarkerToMap(map, { ...destination, title: 'Destination' }, 'D');
            }
          }}
        >
          <TrafficLayer />
          {directions && (
            <DirectionsRenderer 
              directions={directions}
              options={{
                polylineOptions: {
                  strokeColor: '#3B82F6',
                  strokeWeight: 6,
                  strokeOpacity: 0.8,
                  zIndex: 1
                },
                suppressMarkers: true,
                preserveViewport: false
              }}
            />
          )}
          {/* Source Marker */}
          {source.lat && source.lng && (
            <Marker 
              position={{ lat: source.lat, lng: source.lng }} 
              label={{ text: 'S', color: 'white', fontWeight: 'bold' }}
              title="Source"
            />
          )}
          {/* Destination Marker */}
          {destination.lat && destination.lng && (
            <Marker 
              position={{ lat: destination.lat, lng: destination.lng }} 
              label={{ text: 'D', color: 'white', fontWeight: 'bold' }}
              title="Destination"
            />
          )}
        </GoogleMap>
      </div>

      {/* Alternate Routes */}
      {alternateRoutes.length > 1 && (
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Alternate Routes</h2>
          <div className="space-y-4">
            {alternateRoutes.map((route, index) => {
              const leg = route.legs[0];
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Route {index + 1}</p>
                      <p className="text-sm text-gray-500">
                        {leg.distance?.text} • {leg.duration_in_traffic?.text || leg.duration?.text}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const newDirections = { ...directions, routes: [route] };
                        setDirections(newDirections);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      Select
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteFinder;
