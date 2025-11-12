import React, { useState } from 'react';
import axios from '../services/api';
import AutocompleteInput from './AutocompleteInput';

const RouteForm = ({ onRouteAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    sourceAddress: '',
    sourceLat: '',
    sourceLng: '',
    destAddress: '',
    destinationLat: '',
    destinationLng: '',
    isDaily: false,
    alertTimeStart: '',
    alertTimeEnd: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle source location selection
  const handleSourceSelect = (place) => {
    setFormData(prev => ({
      ...prev,
      sourceAddress: place.formattedAddress || place.name,
      sourceLat: place.lat,
      sourceLng: place.lng
    }));
  };

  // Handle destination selection
  const handleDestSelect = (place) => {
    setFormData(prev => ({
      ...prev,
      destAddress: place.formattedAddress || place.name,
      destinationLat: place.lat,
      destinationLng: place.lng
    }));
  };

  // Handle source address change (manual typing)
  const handleSourceChange = (value) => {
    setFormData(prev => ({ ...prev, sourceAddress: value }));
    if (!value) {
      setFormData(prev => ({ ...prev, sourceLat: '', sourceLng: '' }));
    }
  };

  // Handle destination address change (manual typing)
  const handleDestChange = (value) => {
    setFormData(prev => ({ ...prev, destAddress: value }));
    if (!value) {
      setFormData(prev => ({ ...prev, destinationLat: '', destinationLng: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.sourceLat || !formData.destinationLat) {
      setError('Please enter valid source and destination addresses');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/user/route', formData);
      onRouteAdded();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save route');
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Route Name (Optional)</label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Home to Office"
        />
      </div>

      <AutocompleteInput
        label="Source Address"
        value={formData.sourceAddress}
        onSelect={handleSourceSelect}
        onChange={handleSourceChange}
        placeholder="Type to search address..."
        required
        showCoordinates={true}
      />

      <AutocompleteInput
        label="Destination Address"
        value={formData.destAddress}
        onSelect={handleDestSelect}
        onChange={handleDestChange}
        placeholder="Type to search address..."
        required
        showCoordinates={true}
      />

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isDaily"
          checked={formData.isDaily}
          onChange={(e) => setFormData(prev => ({ ...prev, isDaily: e.target.checked }))}
          className="mr-2"
        />
        <label htmlFor="isDaily" className="text-sm text-gray-700">
          Daily Route (receive alerts for this route)
        </label>
      </div>

      {formData.isDaily && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alert Time Start</label>
            <input
              type="time"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.alertTimeStart}
              onChange={(e) => setFormData(prev => ({ ...prev, alertTimeStart: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alert Time End</label>
            <input
              type="time"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.alertTimeEnd}
              onChange={(e) => setFormData(prev => ({ ...prev, alertTimeEnd: e.target.value }))}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Route'}
      </button>
    </form>
  );
};

export default RouteForm;
