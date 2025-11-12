# Troubleshooting: InvalidKeyMapError

## Your API Key is Valid! ✅

The diagnostic test confirms your API key is working. If you're still seeing `InvalidKeyMapError` in the browser, follow these steps:

## Step 1: Restart Development Server

**⚠️ CRITICAL: You MUST restart the server after creating/editing .env file**

1. **Stop the server:**
   - Find the terminal running `npm start`
   - Press `Ctrl+C` to stop it

2. **Start it again:**
   ```bash
   cd frontend
   npm start
   ```

3. **Wait for compilation to complete**
   - Look for "Compiled successfully!" message
   - The browser should automatically refresh

## Step 2: Clear Browser Cache

1. **Hard refresh the browser:**
   - **Chrome/Edge:** Press `Ctrl+Shift+R` or `Ctrl+F5`
   - **Firefox:** Press `Ctrl+Shift+R`
   - **Safari:** Press `Cmd+Shift+R`

2. **Or clear cache manually:**
   - Press `F12` to open Developer Tools
   - Right-click the refresh button
   - Select "Empty Cache and Hard Reload"

## Step 3: Check API Key Restrictions

Even though the API key is valid, restrictions might block it in the browser:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your API key
4. Under **Application restrictions**, check:
   - If set to "HTTP referrers", make sure these are added:
     ```
     http://localhost:3000/*
     http://127.0.0.1:3000/*
     ```
   - If set to "None", that's fine for development
5. Click **Save**
6. Wait 1-2 minutes for changes to propagate

## Step 4: Verify Environment Variable in Browser

1. Open your app in the browser
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Type this and press Enter:
   ```javascript
   console.log(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
   ```

**Expected result:** Should show your API key (or at least part of it)

**If it shows `undefined`:**
- The environment variable is not being loaded
- Make sure `.env` file is in the `frontend/` directory
- Make sure variable name is exactly `REACT_APP_GOOGLE_MAPS_API_KEY`
- Restart the development server

## Step 5: Check Browser Console for Errors

1. Open Developer Tools (`F12`)
2. Go to **Console** tab
3. Look for error messages
4. Check the **Network** tab for failed API requests

Common errors:
- `InvalidKeyMapError` - API key issue (but we know it's valid, so likely cache/restart issue)
- `RefererNotAllowedMapError` - API key restrictions blocking the request
- `REQUEST_DENIED` - API not enabled or billing issue

## Step 6: Verify All APIs are Enabled

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Library**
3. Search for and enable these APIs:
   - ✅ **Maps JavaScript API** (Required)
   - ✅ **Places API** (Required for autocomplete)
   - ✅ **Geocoding API** (Required)
   - ✅ **Directions API** (Required)
   - ✅ **Distance Matrix API** (Required)

## Step 7: Check Billing

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Billing**
3. Make sure billing is enabled for your project
4. Google provides $200 free credit per month

## Step 8: Test in Incognito/Private Window

1. Open a new incognito/private window
2. Navigate to `http://localhost:3000`
3. Check if the error still occurs

This helps rule out browser extensions or cache issues.

## Step 9: Verify .env File Location

Make sure the `.env` file is in the correct location:

```
Auto_Traffic_Detector/
  ├── frontend/
  │   ├── .env          ← Should be here
  │   ├── package.json
  │   └── src/
  └── backend/
```

**Not here:**
- ❌ Root directory (`Auto_Traffic_Detector/.env`)
- ❌ `backend/.env` (different key for backend)

## Step 10: Check .env File Format

Open `frontend/.env` and verify:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyDWO9zkTWtFOZqo...
```

**Important:**
- ✅ No quotes around the API key
- ✅ No spaces around the `=`
- ✅ Variable name starts with `REACT_APP_`
- ✅ No extra spaces or characters

## Still Not Working?

### Option 1: Temporarily Remove API Key Restrictions

1. Go to Google Cloud Console > Credentials
2. Click on your API key
3. Under **Application restrictions**, select **None**
4. Click **Save**
5. Restart development server
6. Test again

**⚠️ Warning:** Only do this for development. Re-enable restrictions for production.

### Option 2: Create a New API Key

1. Go to Google Cloud Console > Credentials
2. Create a new API key
3. Enable all required APIs
4. Set restrictions (or None for development)
5. Update `frontend/.env` with the new key
6. Restart development server

### Option 3: Check for Typos

1. Copy the API key from Google Cloud Console
2. Paste it directly into `.env` file
3. Make sure no characters were changed
4. Save the file
5. Restart development server

## Quick Diagnostic Commands

Run these to verify setup:

```bash
# Check if .env file exists and is configured
cd frontend
node verify-env.js

# Test API key validity
node test-api-key.js
```

## Common Solutions Summary

| Issue | Solution |
|-------|----------|
| API key not loaded | Restart development server |
| Browser cache | Hard refresh (Ctrl+Shift+R) |
| API restrictions | Add localhost:3000 to allowed referrers |
| APIs not enabled | Enable all 5 required APIs |
| Billing not enabled | Enable billing in Google Cloud Console |
| Wrong .env location | Move .env to frontend/ directory |
| Typo in API key | Copy API key directly from Google Cloud Console |

## Need More Help?

1. Check the browser console for specific error messages
2. Verify API key in Google Cloud Console
3. Check API usage and quotas
4. Review [GOOGLE_MAPS_API_SETUP.md](./GOOGLE_MAPS_API_SETUP.md) for detailed setup

## Verification Checklist

- [ ] `.env` file exists in `frontend/` directory
- [ ] API key is set in `.env` file
- [ ] Development server was restarted after setting `.env`
- [ ] Browser cache was cleared
- [ ] All 5 required APIs are enabled
- [ ] Billing is enabled
- [ ] API key restrictions allow localhost:3000
- [ ] Browser console shows API key is loaded (not undefined)
- [ ] Test script confirms API key is valid

If all items are checked and it's still not working, the issue might be:
- Browser extensions interfering
- Corporate firewall/proxy
- Network connectivity issues
- React app configuration issue

