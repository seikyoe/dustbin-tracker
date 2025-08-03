# Google Maps Setup Guide

## Overview
The Dustbin Tracker app uses Google Maps API to display dustbin locations on an interactive map. The app includes fallback functionality when Google Maps is unavailable.

## Current API Key
The app is currently configured with the API key: `AIzaSyDzep9Vx5ujii94g10cHt6nkdF_fRupFNs`

## Features
- Interactive Google Maps with custom styling
- User location detection and centering
- Dustbin markers with color-coded status
- Fallback list view when maps are unavailable
- Retry mechanism for failed loads

## How It Works

### 1. Script Loading
The app dynamically loads the Google Maps JavaScript API when the user logs in:
```javascript
const script = document.createElement("script")
script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&callback=initGoogleMap`
```

### 2. Map Initialization
Once loaded, the map is initialized with:
- Custom styling for better visual appeal
- NYC as default center (40.7128, -74.006)
- Zoom level 13
- Disabled unnecessary controls

### 3. User Location
The app requests user location and:
- Centers the map on user's location
- Adds a blue marker for user position
- Falls back to NYC if location access is denied

### 4. Dustbin Markers
Dustbins are displayed as colored circles:
- Green: Empty
- Yellow: Half-full
- Orange: Full
- Red: Damaged/Missing

### 5. Fallback System
If Google Maps fails to load:
- Shows a list view of dustbins
- Provides retry functionality
- Maintains all app functionality

## Testing the API Key

### Method 1: Use the Test File
1. Open `test-google-maps.html` in a web browser
2. Check if the map loads successfully
3. Look for success/error messages

### Method 2: Check Browser Console
1. Open the app in browser
2. Open Developer Tools (F12)
3. Look for Google Maps related messages in the console

## Common Issues

### 1. "Maps Unavailable" Message
- Check if the API key is valid
- Verify billing is enabled for the Google Cloud project
- Check if the Maps JavaScript API is enabled

### 2. "Location Access Denied"
- The app will use NYC as default location
- This doesn't affect core functionality

### 3. Slow Loading
- The app has a 10-second timeout
- After timeout, it falls back to list view
- Users can retry loading maps

## API Key Security
⚠️ **Important**: The current API key is exposed in the client-side code. For production use:
1. Restrict the API key to specific domains
2. Set up proper billing alerts
3. Consider using environment variables
4. Implement server-side API key management

## Environment Variables (Recommended)
For better security, you can use environment variables:

1. Create a `.env.local` file:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

2. Update the script loading:
```javascript
script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMap`
```

## Troubleshooting

### If Maps Don't Load:
1. Check browser console for errors
2. Verify internet connection
3. Test with the provided test file
4. Check API key restrictions

### If Location Doesn't Work:
1. Ensure HTTPS is used (required for geolocation)
2. Check browser permissions
3. The app will work with default location

### Performance Issues:
1. The app includes loading states
2. Fallback system ensures functionality
3. Consider implementing map clustering for many markers

## Support
If you encounter issues:
1. Check the browser console for error messages
2. Test with the provided test file
3. Verify your Google Cloud Console settings
4. Ensure the API key has proper permissions 