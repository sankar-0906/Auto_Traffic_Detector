# Google Maps API Setup Guide

## Error: "Cannot read properties of undefined (reading 'DJ')"

This error occurs when the Google Maps API is not properly configured or loaded.

## Quick Fix Steps

### 1. Check Your .env File

Make sure you have a `.env` file in the `frontend-web` directory with:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your-actual-api-key-here
```

**Important:** 
- The variable name MUST start with `REACT_APP_`
- Replace `your-actual-api-key-here` with your actual Google Maps API key
- No quotes needed around the value

### 2. Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API** (required for web maps)
   - **Directions API** (for route directions)
   - **Distance Matrix API** (for traffic data)
   - **Geocoding API** (for address conversion)

4. Create credentials (API Key):
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key

5. (Recommended) Restrict the API key:
   - Click on the API key to edit it
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domain (e.g., `http://localhost:3000/*` for development)
   - Under "API restrictions", select "Restrict key" and choose the APIs you enabled

### 3. Update .env File

```env
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyYourActualKeyHere
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4. Restart Development Server

After updating `.env`, you MUST restart your React development server:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm start
```

**Note:** React doesn't reload environment variables automatically. You must restart the server.

### 5. Verify the API Key

Check the browser console. You should see:
- No errors about Google Maps API
- The map should load properly

If you still see errors:
- Check that the API key is correct
- Verify all required APIs are enabled
- Check API key restrictions (make sure localhost is allowed for development)
- Check your Google Cloud billing (some APIs require billing to be enabled)

## Common Issues

### Issue: "This API key is not authorized"
**Solution:** Enable the required APIs in Google Cloud Console

### Issue: "RefererNotAllowedMapError"
**Solution:** Add your domain to the API key restrictions (or remove restrictions for testing)

### Issue: "Billing not enabled"
**Solution:** Enable billing in Google Cloud Console (free tier available with $200 credit)

### Issue: API key works but map doesn't load
**Solution:** 
- Check browser console for specific errors
- Verify the API key has the correct permissions
- Make sure you're using the correct API (Maps JavaScript API, not Maps Embed API)

## Testing

After setup, you should be able to:
1. See the map load on the dashboard
2. See traffic layer overlay
3. Get directions between points
4. See markers for traffic alerts

## Production Setup

For production:
1. Create a separate API key for production
2. Restrict it to your production domain
3. Set up proper API quotas and limits
4. Monitor usage in Google Cloud Console

