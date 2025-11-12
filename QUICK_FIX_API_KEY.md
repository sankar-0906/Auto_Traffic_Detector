# Quick Fix: InvalidKeyMapError

## Immediate Steps to Fix

### Step 1: Check if .env file exists

**Windows (PowerShell):**
```powershell
cd frontend
Test-Path .env
```

**Linux/Mac:**
```bash
cd frontend
ls -la .env
```

If it returns `False` or file doesn't exist, create it.

### Step 2: Create/Edit frontend/.env file

Create a file named `.env` in the `frontend` folder with this content:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your-actual-api-key-here
```

**⚠️ Important:**
- Replace `your-actual-api-key-here` with your real API key from Google Cloud Console
- Do NOT use quotes around the API key
- Make sure there are no spaces before or after the `=`
- The variable name MUST be exactly `REACT_APP_GOOGLE_MAPS_API_KEY`

### Step 3: Get Your API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Go to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **API Key**
5. Copy the API key
6. **Enable these APIs** (go to APIs & Services > Library):
   - ✅ Maps JavaScript API
   - ✅ Places API
   - ✅ Geocoding API
   - ✅ Directions API
   - ✅ Distance Matrix API

### Step 4: Configure API Key Restrictions (Important!)

1. Click on your API key to edit it
2. Under **Application restrictions**, select **HTTP referrers (web sites)**
3. Add these referrers:
   ```
   http://localhost:3000/*
   http://127.0.0.1:3000/*
   ```
4. Under **API restrictions**, select **Restrict key**
5. Select only the APIs listed above
6. Click **Save**

### Step 5: Enable Billing

1. Go to **Billing** in Google Cloud Console
2. Enable billing for your project
3. Google provides $200 free credit per month (usually enough for development)

### Step 6: Restart Development Server

**⚠️ CRITICAL: You MUST restart the server after changing .env file**

1. Stop the current server (Press `Ctrl+C` in the terminal)
2. Start it again:
   ```bash
   cd frontend
   npm start
   ```

### Step 7: Verify API Key is Loaded

Open browser console (F12) and type:
```javascript
console.log(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
```

If it shows `undefined`, the environment variable is not set correctly.

## Common Issues

### Issue 1: API Key Not Found
- ✅ Check that `.env` file is in `frontend/` directory (not root)
- ✅ Verify variable name is exactly `REACT_APP_GOOGLE_MAPS_API_KEY`
- ✅ Make sure you restarted the server after creating `.env`
- ✅ Check for typos in the API key

### Issue 2: API Not Enabled
- ✅ Go to Google Cloud Console > APIs & Services > Library
- ✅ Enable all 5 required APIs
- ✅ Wait a few minutes for changes to propagate

### Issue 3: Billing Not Enabled
- ✅ Go to Google Cloud Console > Billing
- ✅ Enable billing for your project
- ✅ Google provides $200 free credit per month

### Issue 4: Referrer Restrictions
- ✅ Check API key restrictions in Google Cloud Console
- ✅ Make sure `http://localhost:3000/*` is in allowed referrers
- ✅ For development, you can temporarily set to "None" (not recommended for production)

### Issue 5: Wrong API Key
- ✅ Verify the API key in Google Cloud Console
- ✅ Make sure you copied the entire key (no missing characters)
- ✅ Check that the key is for the correct project

## Test Your API Key

Visit this URL in your browser (replace `YOUR_API_KEY`):
```
https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places
```

If you see JavaScript code, the key is valid. If you see an error, check the error message.

## Still Not Working?

1. **Check browser console** for detailed error messages
2. **Verify API key** in Google Cloud Console > Credentials
3. **Check API usage** in Google Cloud Console > APIs & Services > Dashboard
4. **Verify billing** is enabled
5. **Check API key restrictions** - make sure localhost is allowed
6. **Restart the server** after any changes to .env file

## Need More Help?

See [GOOGLE_MAPS_API_SETUP.md](./GOOGLE_MAPS_API_SETUP.md) for detailed setup instructions.

