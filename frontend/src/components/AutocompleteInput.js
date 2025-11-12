import React, { useState, useEffect, useRef } from 'react';
import { useGoogleMaps } from '../context/GoogleMapsContext';

/**
 * Universal Google Places Autocomplete Input Component
 * 
 * Features:
 * - Google Places Autocomplete widget integration (automatic dropdown)
 * - Automatic coordinate extraction on place selection
 * - Map synchronization support via onMapSync callback
 * - Fallback to manual input if API unavailable
 * - Error handling and loading states
 * - Consistent styling with TailwindCSS
 * 
 * @param {string} label - Label for the input field
 * @param {string} value - Current value of the input
 * @param {Function} onSelect - Callback when a place is selected: (place) => void
 * @param {Function} onChange - Optional callback for input changes: (value) => void
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Whether the field is required
 * @param {string} className - Additional CSS classes for wrapper
 * @param {Object} autocompleteOptions - Options for Autocomplete widget (types, componentRestrictions, etc.)
 * @param {Function} onMapSync - Optional callback to sync with map: (place) => void
 * @param {boolean} showCoordinates - Whether to show coordinates below input
 * @param {boolean} disabled - Whether the input is disabled
 */
const AutocompleteInput = ({
  label,
  value = '',
  onSelect,
  onChange,
  placeholder = 'Type to search address...',
  required = false,
  className = '',
  autocompleteOptions = {},
  onMapSync = null,
  showCoordinates = true,
  disabled = false
}) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [inputValue, setInputValue] = useState(value);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Default autocomplete options
  // Note: 'address' cannot be mixed with other types in Google Places API
  // Using 'geocode' instead which includes addresses and other location types
  const defaultOptions = {
    types: ['geocode'], // 'geocode' includes addresses, cities, regions, etc.
    fields: ['geometry', 'formatted_address', 'name', 'place_id', 'address_components', 'types'],
    ...autocompleteOptions
  };
  
  // If autocompleteOptions provides types, use those instead
  const finalTypes = autocompleteOptions.types || defaultOptions.types;

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Initialize Google Places Autocomplete widget
  useEffect(() => {
    if (!isLoaded || !inputRef.current || loadError || disabled) {
      return;
    }

    if (window.google && window.google.maps && window.google.maps.places) {
      try {
        // Create Autocomplete widget - this automatically shows dropdown suggestions
        // Note: 'address' type cannot be mixed with other types
        // Using 'geocode' as default which includes addresses and establishments
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: finalTypes,
            fields: defaultOptions.fields,
            ...(autocompleteOptions.componentRestrictions && {
              componentRestrictions: autocompleteOptions.componentRestrictions
            })
          }
        );

        // Listen for place selection from dropdown
        autocompleteRef.current.addListener('place_changed', () => {
          try {
            const place = autocompleteRef.current.getPlace();
            
            if (place.geometry && place.geometry.location) {
              const placeData = {
                placeId: place.place_id,
                name: place.name || place.formatted_address,
                formattedAddress: place.formatted_address,
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                geometry: place.geometry,
                addressComponents: place.address_components,
                types: place.types,
                place: place // Full place object for advanced usage
              };

              setSelectedPlace(placeData);
              setInputValue(place.formatted_address || place.name);

              // Call onSelect callback
              if (onSelect) {
                onSelect(placeData);
              }

              // Sync with map if callback provided
              if (onMapSync) {
                onMapSync(placeData);
              }
            }
          } catch (error) {
            console.error('Error processing place selection:', error);
          }
        });

        return () => {
          if (autocompleteRef.current) {
            try {
              window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
            } catch (error) {
              console.error('Error cleaning up autocomplete:', error);
            }
          }
        };
      } catch (error) {
        console.error('Error initializing autocomplete:', error);
      }
    }
  }, [isLoaded, loadError, disabled, onSelect, onMapSync, finalTypes, autocompleteOptions]);

  // Handle input change (manual typing)
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Clear selected place if input is cleared
    if (!newValue) {
      setSelectedPlace(null);
    }

    // Call onChange callback if provided
    if (onChange) {
      onChange(newValue);
    }
  };

  // Check if we have coordinates (for validation)
  const hasCoordinates = selectedPlace && selectedPlace.lat && selectedPlace.lng;

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled || (!isLoaded && !loadError)}
          autoComplete="off"
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            loadError ? 'border-yellow-300' : ''
          }`}
        />
      </div>

      {/* Coordinates Display */}
      {showCoordinates && hasCoordinates && (
        <p className="text-xs text-gray-500 mt-1">
          ✓ Coordinates: {selectedPlace.lat.toFixed(6)}, {selectedPlace.lng.toFixed(6)}
        </p>
      )}

      {/* Loading State */}
      {!isLoaded && !loadError && !disabled && (
        <p className="text-xs text-gray-400 mt-1">Loading address suggestions...</p>
      )}

      {/* Error State - Show warning but allow manual input */}
      {loadError && !disabled && (
        <p className="text-xs text-yellow-600 mt-1">
          ⚠️ Autocomplete unavailable. You can still type manually.
        </p>
      )}

      {/* Help Text */}
      {!hasCoordinates && inputValue && isLoaded && !loadError && (
        <p className="text-xs text-gray-400 mt-1">
          💡 Select a suggestion from the dropdown to set coordinates
        </p>
      )}
    </div>
  );
};

export default AutocompleteInput;
