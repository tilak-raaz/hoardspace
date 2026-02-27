# Google Maps API Setup Guide

This guide explains how to set up Google Maps APIs for location features in HoardSpace.

## Features Enabled

1. **Pincode Auto-Fill**: Enter a 6-digit Indian pincode and automatically populate city, state, and area
2. **Map Location Picker**: Click on an interactive map to select exact hoarding location and auto-fill all address fields

## Required APIs

You need to enable these APIs in Google Cloud Console:

- **Geocoding API** - For pincode to location conversion
- **Maps JavaScript API** - For interactive map display
- **Geolocation API** (Optional) - For "Use Current Location" feature

## Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter project name (e.g., "HoardSpace Maps")
4. Click **Create**

### 2. Enable Required APIs

1. In your project dashboard, navigate to **APIs & Services** → **Library**

2. **Enable Geocoding API**:
   - Search for "Geocoding API"
   - Click on it
   - Click **Enable**

3. **Enable Maps JavaScript API**:
   - Search for "Maps JavaScript API"
   - Click on it
   - Click **Enable**

4. **Enable Geolocation API** (Optional):
   - Search for "Geolocation API"
   - Click on it
   - Click **Enable**

### 3. Create API Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Your API key will be created
4. Click on the key to configure it

### 4. Restrict API Key (Recommended for Security)

#### Application Restrictions:

1. Select **HTTP referrers (web sites)**
2. Add these referrers:
   - Development: `http://localhost:3000/*`
   - Production: `https://yourdomain.com/*`

#### API Restrictions:

1. Select **Restrict key**
2. Choose these APIs:
   - Geocoding API
   - Maps JavaScript API
   - Geolocation API (if enabled)
3. Click **Save**

### 5. Add API Key to Environment Variables

Add this to your `.env.local` file:

```env
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Important**: The variable name **must** start with `NEXT_PUBLIC_` to be accessible in the browser.

### 6. Restart Development Server

```bash
npm run dev
```

## Usage

### Pincode Auto-Fill

1. Navigate to **Vendor Dashboard** → **Add Hoarding**
2. Scroll to the **Location** section
3. Enter a 6-digit Indian pincode (e.g., `400001`)
4. City, State, and Area fields will auto-populate

### Map Location Picker

1. In the same **Location** section
2. Click **"Pick on Map"** button
3. Interactive map will appear
4. Click **"Use Current Location"** or click anywhere on the map
5. All address fields will auto-fill based on the selected location

## How It Works

### Pincode Auto-Fill Flow

```
User enters pincode (e.g., 400001)
    ↓
Validates format (6 digits, starts with 1-9)
    ↓
Calls Google Geocoding API
    ↓
Returns: City, State, Area, Lat/Lng
    ↓
Auto-fills form fields
```

### Map Location Picker Flow

```
User clicks on map / Uses current location
    ↓
Gets Latitude & Longitude
    ↓
Calls Google Reverse Geocoding API
    ↓
Returns: Full Address, City, State, Area, Pincode
    ↓
Auto-fills all form fields
```

## API Usage & Pricing

### Free Tier (Monthly)

- **Geocoding API**: $200 free credit (~40,000 requests)
- **Maps JavaScript API**: $200 free credit (~28,000 map loads)

### After Free Tier

- **Geocoding**: $5 per 1,000 requests
- **Maps JavaScript**: $7 per 1,000 map loads

**Note**: Most small to medium apps stay within free tier limits.

## Troubleshooting

### "Failed to load Google Maps"

**Cause**: API key not configured or invalid

**Solution**:

1. Check `.env.local` has `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
2. Verify API key is correct
3. Restart development server: `npm run dev`

### Map shows but location doesn't work

**Cause**: Geocoding API not enabled

**Solution**:

1. Go to Google Cloud Console
2. Navigate to **APIs & Services** → **Library**
3. Search for "Geocoding API" and enable it

### "This API project is not authorized to use this API"

**Cause**: Required APIs not enabled for your project

**Solution**:

1. Enable all required APIs (see step 2 above)
2. Wait 1-2 minutes for changes to propagate
3. Refresh your browser

### Pincode auto-fill not working

**Cause**: Invalid pincode format or Geocoding API issue

**Solution**:

1. Ensure pincode is exactly 6 digits
2. Must be valid Indian pincode (starts with 1-9)
3. Check browser console for API errors
4. Verify Geocoding API is enabled

### "RefererNotAllowedMapError"

**Cause**: API key has domain restrictions that don't match your localhost

**Solution**:

1. Go to **APIs & Services** → **Credentials**
2. Click on your API key
3. Under **Application restrictions** → **HTTP referrers**
4. Add: `http://localhost:3000/*`
5. Click **Save**

## Production Deployment

### Before Deploying

1. **Update Environment Variable**:

   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

2. **Update API Key Restrictions**:
   - Add production domain to HTTP referrers
   - Example: `https://yourdomain.com/*`

3. **Enable Billing** (if exceeding free tier):
   - Go to **Billing** in Google Cloud Console
   - Add payment method
   - Set budget alerts

### Security Best Practices

✅ **DO**:

- Use API restrictions (limit to specific APIs)
- Use HTTP referrer restrictions (limit to your domains)
- Monitor usage in Google Cloud Console
- Set up billing alerts

❌ **DON'T**:

- Commit API keys to GitHub
- Use unrestricted API keys in production
- Share API keys publicly
- Disable all restrictions (security risk)

## Testing

### Test Pincode Auto-Fill

Try these pincodes:

- `400001` - Mumbai, Maharashtra
- `110001` - New Delhi, Delhi
- `560001` - Bangalore, Karnataka
- `700001` - Kolkata, West Bengal

### Test Map Picker

1. Click "Pick on Map"
2. Click "Use Current Location" (allow browser permission)
3. Or zoom in and click anywhere in India
4. Verify all fields populate correctly

## Files Modified

- `/src/lib/googleMaps.ts` - Geocoding utility functions
- `/src/components/MapLocationPicker.tsx` - Interactive map component
- `/src/app/vendor/add-hoarding/page.tsx` - Integrated location features

## Support

For Google Maps API issues:

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Geocoding API Guide](https://developers.google.com/maps/documentation/geocoding)
- [Maps JavaScript API Guide](https://developers.google.com/maps/documentation/javascript)

For HoardSpace-specific issues:

- Check browser console for error messages
- Verify all environment variables are set
- Ensure APIs are enabled in Google Cloud Console
