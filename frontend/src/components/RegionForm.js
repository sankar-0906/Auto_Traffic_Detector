import React, { useState, useEffect } from 'react';
import axios from '../services/api';
import AutocompleteInput from './AutocompleteInput';
import { useGoogleMaps } from '../context/GoogleMapsContext';

const RegionForm = ({ region, onRegionSaved, onCancel }) => {
  const [formData, setFormData] = useState({
    name: region?.name || '',
    startAddress: '',
    startLat: region?.startLat || '',
    startLng: region?.startLng || '',
    endAddress: '',
    endLat: region?.endLat || '',
    endLng: region?.endLng || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  
  const { isLoaded, geocoder } = useGoogleMaps();

  // Reverse geocode coordinates to get addresses when editing existing region
  useEffect(() => {
    const reverseGeocode = async (lat, lng, type) => {
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;
      
      setIsLoadingAddresses(true);
      try {
        // Try using Geocoder from context first
        if (isLoaded && geocoder) {
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const address = results[0].formatted_address;
              if (type === 'start') {
                setFormData(prev => ({ ...prev, startAddress: address }));
              } else {
                setFormData(prev => ({ ...prev, endAddress: address }));
              }
              setIsLoadingAddresses(false);
            } else {
              // Fallback to backend API
              reverseGeocodeViaAPI(lat, lng, type);
            }
          });
        } else {
          // Fallback to backend API
          reverseGeocodeViaAPI(lat, lng, type);
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        setIsLoadingAddresses(false);
      }
    };

    const reverseGeocodeViaAPI = async (lat, lng, type) => {
      try {
        const response = await axios.post('/geocode', { 
          address: `${lat},${lng}` 
        });
        if (response.data.success) {
          if (type === 'start') {
            setFormData(prev => ({ ...prev, startAddress: response.data.data.address }));
          } else {
            setFormData(prev => ({ ...prev, endAddress: response.data.data.address }));
          }
        }
      } catch (error) {
        console.error('Reverse geocoding API error:', error);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    // Only reverse geocode if we have coordinates but no addresses
    if (region?.startLat && region?.startLng && !formData.startAddress) {
      reverseGeocode(region.startLat, region.startLng, 'start');
    }
    if (region?.endLat && region?.endLng && !formData.endAddress) {
      reverseGeocode(region.endLat, region.endLng, 'end');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, isLoaded, geocoder]);

  // Handle start location selection
  const handleStartLocationSelect = (place) => {
    setFormData(prev => ({
      ...prev,
      startAddress: place.formattedAddress || place.name,
      startLat: place.lat,
      startLng: place.lng
    }));
  };

  // Handle end location selection
  const handleEndLocationSelect = (place) => {
    setFormData(prev => ({
      ...prev,
      endAddress: place.formattedAddress || place.name,
      endLat: place.lat,
      endLng: place.lng
    }));
  };

  // Handle start address change (manual typing)
  const handleStartAddressChange = (value) => {
    setFormData(prev => ({ ...prev, startAddress: value }));
    // Clear coordinates if address is cleared
    if (!value) {
      setFormData(prev => ({ ...prev, startLat: '', startLng: '' }));
    }
  };

  // Handle end address change (manual typing)
  const handleEndAddressChange = (value) => {
    setFormData(prev => ({ ...prev, endAddress: value }));
    // Clear coordinates if address is cleared
    if (!value) {
      setFormData(prev => ({ ...prev, endLat: '', endLng: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.startLat || !formData.endLat) {
      setError('Please enter valid start and end locations');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/police/region', {
        name: formData.name,
        startLat: formData.startLat,
        startLng: formData.startLng,
        endLat: formData.endLat,
        endLng: formData.endLng
      });
      onRegionSaved();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save region');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Region Name</label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Chennai Central to Guindy"
          required
        />
      </div>

      <AutocompleteInput
        label="Start Location"
        value={formData.startAddress}
        onSelect={handleStartLocationSelect}
        onChange={handleStartAddressChange}
        placeholder="Type to search address..."
        required
        showCoordinates={true}
      />

      <AutocompleteInput
        label="End Location"
        value={formData.endAddress}
        onSelect={handleEndLocationSelect}
        onChange={handleEndAddressChange}
        placeholder="Type to search address..."
        required
        showCoordinates={true}
      />

      {isLoadingAddresses && (
        <p className="text-xs text-gray-400">Loading addresses...</p>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Region'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default RegionForm;
