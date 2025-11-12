import React, { useState, useEffect, useRef } from 'react';
import axios from '../services/api';
import { GoogleMap, TrafficLayer, Marker } from '@react-google-maps/api';
import { useGoogleMaps } from '../context/GoogleMapsContext';
import RegionForm from '../components/RegionForm';
import AlertPanel from '../components/AlertPanel';
import { centerMapOnPlace, addMarkerToMap, clearMarkers, fitMapToPlaces } from '../utils/mapSync';

const mapContainerStyle = {
  width: '100%',
  height: '500px'
};

const PoliceDashboard = () => {
  const [region, setRegion] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showRegionForm, setShowRegionForm] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 13.0827, lng: 80.2707 }); // Default: Chennai
  const [mapZoom, setMapZoom] = useState(12);
  const mapRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);

  const { isLoaded, loadError, googleMapsApiKey } = useGoogleMaps();

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchDashboardData, 120000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/police/dashboard');
      const data = response.data.data;
      
      setRegion(data.region);
      setAlerts(data.alerts || []);
      setStats(data.stats || {});

      if (data.region) {
        // Center map on region
        const centerLat = (data.region.startLat + data.region.endLat) / 2;
        const centerLng = (data.region.startLng + data.region.endLng) / 2;
        setMapCenter({ lat: centerLat, lng: centerLng });
        setMapZoom(13);

        // Update markers on map if map is loaded
        if (mapRef.current && isLoaded) {
          // Clear existing markers
          if (startMarkerRef.current) clearMarkers([startMarkerRef.current]);
          if (endMarkerRef.current) clearMarkers([endMarkerRef.current]);

          // Add new markers
          startMarkerRef.current = addMarkerToMap(
            mapRef.current,
            { lat: data.region.startLat, lng: data.region.startLng, title: 'Start' },
            'Start'
          );
          endMarkerRef.current = addMarkerToMap(
            mapRef.current,
            { lat: data.region.endLat, lng: data.region.endLng, title: 'End' },
            'End'
          );

          // Fit map to show both markers
          fitMapToPlaces(
            mapRef.current,
            [
              { lat: data.region.startLat, lng: data.region.startLng },
              { lat: data.region.endLat, lng: data.region.endLng }
            ],
            { padding: 50 }
          );
        }
      }

      setShowRegionForm(!data.region);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegionSaved = () => {
    setShowRegionForm(false);
    fetchDashboardData();
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await axios.patch(`/notifications/alerts/${alertId}/resolve`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error resolving alert:', error);
      alert('Failed to resolve alert');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Police Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor traffic in your assigned region</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Alerts</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAlerts || 0}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Pending</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingAlerts || 0}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Resolved</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolvedAlerts || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {region ? region.name : 'Region Map'}
              </h2>
              {!showRegionForm && (
                <button
                  onClick={() => setShowRegionForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Edit Region
                </button>
              )}
            </div>

            {showRegionForm ? (
              <RegionForm
                region={region}
                onRegionSaved={handleRegionSaved}
                onCancel={() => setShowRegionForm(false)}
              />
            ) : (
              <div className="rounded-lg overflow-hidden">
                {!googleMapsApiKey ? (
                  <div className="bg-yellow-50 border-2 border-yellow-200 h-96 flex flex-col items-center justify-center p-4">
                    <p className="text-yellow-800 font-semibold text-lg mb-2">⚠️ Google Maps API Key Not Set</p>
                    <p className="text-yellow-700 text-center mb-4">
                      Please add REACT_APP_GOOGLE_MAPS_API_KEY to frontend/.env file
                    </p>
                    <p className="text-yellow-600 text-sm text-center">
                      See GOOGLE_MAPS_API_SETUP.md for detailed setup instructions
                    </p>
                  </div>
                ) : loadError ? (
                  <div className="bg-red-50 border-2 border-red-200 h-96 flex flex-col items-center justify-center p-4">
                    <p className="text-red-800 font-semibold text-lg mb-2">❌ Google Maps API Error</p>
                    <p className="text-red-700 text-center mb-2">
                      {loadError.message || 'Failed to load Google Maps'}
                    </p>
                    <p className="text-red-600 text-sm text-center mb-4">
                      Common issues:
                    </p>
                    <ul className="text-red-600 text-sm text-left list-disc list-inside mb-4">
                      <li>API key is invalid</li>
                      <li>Required APIs are not enabled</li>
                      <li>Billing is not enabled</li>
                      <li>API key restrictions block localhost</li>
                    </ul>
                    <p className="text-blue-600 text-sm underline cursor-pointer" onClick={() => window.open('https://console.cloud.google.com/', '_blank')}>
                      Check Google Cloud Console
                    </p>
                  </div>
                ) : !isLoaded ? (
                  <div className="bg-gray-100 h-96 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading Google Maps...</p>
                    </div>
                  </div>
                ) : (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={mapZoom}
                    onLoad={(map) => {
                      mapRef.current = map;
                      // Add markers if region exists
                      if (region) {
                        startMarkerRef.current = addMarkerToMap(
                          map,
                          { lat: region.startLat, lng: region.startLng, title: 'Start' },
                          'Start'
                        );
                        endMarkerRef.current = addMarkerToMap(
                          map,
                          { lat: region.endLat, lng: region.endLng, title: 'End' },
                          'End'
                        );
                        // Fit map to show both markers
                        fitMapToPlaces(
                          map,
                          [
                            { lat: region.startLat, lng: region.startLng },
                            { lat: region.endLat, lng: region.endLng }
                          ],
                          { padding: 50 }
                        );
                      }
                    }}
                  >
                    <TrafficLayer />
                    {/* Fallback markers if ref markers don't exist */}
                    {region && !startMarkerRef.current && !endMarkerRef.current && (
                      <>
                        <Marker
                          position={{ lat: region.startLat, lng: region.startLng }}
                          label="Start"
                        />
                        <Marker
                          position={{ lat: region.endLat, lng: region.endLng }}
                          label="End"
                        />
                      </>
                    )}
                  </GoogleMap>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Alerts Sidebar */}
        <div className="lg:col-span-1">
          <AlertPanel alerts={alerts} onResolve={handleResolveAlert} />
        </div>
      </div>
    </div>
  );
};

export default PoliceDashboard;

