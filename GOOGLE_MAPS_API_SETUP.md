# Google Maps API Key Setup Guide

## Error: InvalidKeyMapError

If you're seeing this error, it means your Google Maps API key is either missing, invalid, or not properly configured.

## Step-by-Step Fix

### 1. Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing (Google provides $200 free credit per month)
4. Navigate to **APIs & Services** > **Library**
5. Enable the following APIs:
   - ✅ **Maps JavaScript API** (Required for maps and autocomplete)
   - ✅ **Places API** (Required for address autocomplete)
   - ✅ **Geocoding API** (Required for address to coordinates conversion)
   - ✅ **Directions API** (Required for route finding)
   - ✅ **Distance Matrix API** (Required for traffic checking)

### 2. Create API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy your API key

### 3. Configure API Key Restrictions (Important for Security)

**For Development (localhost):**

1. Click on your API key to edit it
2. Under **Application restrictions**, select **HTTP referrers (web sites)**
3. Add these referrers:
   ```
   http://localhost:3000/*
   http://127.0.0.1:3000/*
   ```
4. Under **API restrictions**, select **Restrict key**
5. Select only the APIs you enabled:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API
   - Distance Matrix API
6. Click **Save**

**For Production:**
- Add your production domain (e.g., `https://yourdomain.com/*`)
- Keep the same API restrictions

### 4. Set Environment Variable

Create or update `frontend/.env` file:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your-actual-api-key-here
```

**Important:**
- The variable name MUST start with `REACT_APP_` for Create React App
- Do NOT include quotes around the API key
- Do NOT commit this file to git (it should be in `.gitignore`)

### 5. Restart Development Server

After setting the environment variable:

```bash
# Stop the current server (Ctrl+C)
# Then restart
cd frontend
npm start
```

**Note:** You MUST restart the development server after changing `.env` files. React doesn't reload environment variables automatically.

### 6. Verify API Key is Loaded

Open browser console and check:
```javascript
console.log(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
```

If it shows `undefined`, the environment variable is not set correctly.

## Common Issues and Solutions

### Issue 1: API Key Not Found
**Error:** `InvalidKeyMapError` or key is undefined

**Solutions:**
- ✅ Check that `.env` file is in the `frontend/` directory
- ✅ Verify the variable name is exactly `REACT_APP_GOOGLE_MAPS_API_KEY`
- ✅ Make sure you restarted the development server
- ✅ Check for typos in the API key

### Issue 2: API Not Enabled
**Error:** `This API project is not authorized to use this API`

**Solutions:**
- ✅ Go to Google Cloud Console > APIs & Services > Library
- ✅ Enable all required APIs (listed above)
- ✅ Wait a few minutes for changes to propagate

### Issue 3: Billing Not Enabled
**Error:** `This API requires billing to be enabled`

**Solutions:**
- ✅ Go to Google Cloud Console > Billing
- ✅ Enable billing for your project
- ✅ Google provides $200 free credit per month (usually enough for development)

### Issue 4: Referrer Restrictions
**Error:** `RefererNotAllowedMapError`

**Solutions:**
- ✅ Check API key restrictions in Google Cloud Console
- ✅ Make sure `http://localhost:3000/*` is added to allowed referrers
- ✅ For development, you can temporarily set restrictions to "None" (not recommended for production)

### Issue 5: Quota Exceeded
**Error:** `OverQueryLimit` or quota exceeded

**Solutions:**
- ✅ Check your usage in Google Cloud Console
- ✅ Increase quota limits if needed
- ✅ Wait for quota to reset (usually daily)

## Testing Your API Key

### Test 1: Check if API Key is Valid
Visit this URL in your browser (replace `YOUR_API_KEY` with your key):
```
https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places
```

If you see JavaScript code, the key is valid. If you see an error, check the error message.

### Test 2: Test in Browser Console
After loading your app, open browser console and type:
```javascript
console.log(window.google);
```

If you see the Google Maps object, the API is loaded correctly.

## Security Best Practices

1. **Never commit API keys to git**
   - Make sure `.env` is in `.gitignore`
   - Use environment variables in production

2. **Use API key restrictions**
   - Restrict by HTTP referrer for web apps
   - Restrict by IP for server-side APIs
   - Limit to only necessary APIs

3. **Monitor usage**
   - Set up billing alerts in Google Cloud Console
   - Monitor API usage regularly
   - Set up quota limits

4. **Rotate keys if compromised**
   - If a key is exposed, delete it and create a new one
   - Update all applications using the key

## Environment Variable Template

Create `frontend/.env`:

```env
# Google Maps API Key
REACT_APP_GOOGLE_MAPS_API_KEY=your-api-key-here

# Backend API URL (if different from default)
REACT_APP_API_URL=http://localhost:5000/api
```

## Quick Checklist

- [ ] Created Google Cloud Project
- [ ] Enabled billing
- [ ] Enabled all required APIs (5 APIs)
- [ ] Created API key
- [ ] Configured API key restrictions (for security)
- [ ] Created `frontend/.env` file
- [ ] Added `REACT_APP_GOOGLE_MAPS_API_KEY` to `.env`
- [ ] Restarted development server
- [ ] Verified API key is loaded (check console)
- [ ] Tested the application

## Still Having Issues?

1. Check the browser console for detailed error messages
2. Verify API key in Google Cloud Console > Credentials
3. Check API usage and quotas in Google Cloud Console
4. Make sure all required APIs are enabled
5. Verify billing is enabled
6. Check that `.env` file is in the correct location (`frontend/.env`)
7. Restart the development server after changing `.env`

## Additional Resources

- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Google Cloud Console](https://console.cloud.google.com/)
- [API Error Messages](https://developers.google.com/maps/documentation/javascript/error-messages)

