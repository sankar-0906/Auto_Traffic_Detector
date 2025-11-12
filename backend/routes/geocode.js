const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticate } = require('../middlewares/auth');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Geocode an address
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status !== 'OK') {
      return res.status(400).json({
        success: false,
        message: `Geocoding failed: ${response.data.status}`
      });
    }

    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      const location = result.geometry.location;

      res.json({
        success: true,
        data: {
          lat: location.lat,
          lng: location.lng,
          address: result.formatted_address,
          placeId: result.place_id
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'No results found for this address'
      });
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({
      success: false,
      message: 'Error geocoding address',
      error: error.message
    });
  }
});

module.exports = router;

