# Map Debugging Guide

## Overview
This guide helps diagnose and fix map crashes in the iReport app.

---

## Error Logging System

The app now includes comprehensive error logging for map issues:

### 1. **Automatic Error Capture**
When the map crashes, you'll see detailed logs in the console:

```
═══════════════════════════════════════
MAP CRASH ERROR LOG
═══════════════════════════════════════
Timestamp: 2025-11-06T10:15:30.123Z
Platform: android
Platform Version: 34
Error Name: TypeError
Error Message: Cannot read property 'x' of undefined
Error Stack: [full stack trace]
Component Stack: [component hierarchy]
═══════════════════════════════════════
💡 SUGGESTED SOLUTION: [automatic suggestion]
═══════════════════════════════════════
JSON Error Log: {...}
```

### 2. **Map Load Tracking**
The app logs every map load attempt:

```
═══════════════════════════════════════
MAP LOAD ATTEMPT
═══════════════════════════════════════
Latitude: 14.1234
Longitude: 122.5678
Timestamp: 2025-11-06T10:15:30.123Z
═══════════════════════════════════════
```

### 3. **Success Confirmation**
When maps load successfully:

```
✅ MAP LOADED SUCCESSFULLY
✅ Map rendered successfully
```

---

## Common Issues & Solutions

### Issue 1: Map Crashes on Expand
**Symptoms:**
- App crashes when expanding location card
- Error: "Native module not found" or "undefined is not an object"

**Solution:**
```bash
# Rebuild the development build
eas build --profile development --platform android

# Install the new APK on your device
```

**Why:** Development builds need to be rebuilt when native modules (like react-native-maps) are added or updated.

---

### Issue 2: Map Shows "Temporarily Unavailable"
**Symptoms:**
- Map doesn't crash but shows fallback UI
- ErrorBoundary caught an error

**Solution:**
1. Check the console logs for the exact error
2. Copy the JSON Error Log
3. Look at the "SUGGESTED SOLUTION" in the logs
4. Follow the suggested fix

---

### Issue 3: Network Request Failed (OSM Tiles)
**Symptoms:**
- Error: "Network request failed"
- Map loads but tiles don't appear

**Solution:**
1. Check internet connection
2. Verify OSM tile server is accessible:
   ```
   https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png
   ```
3. Try on a different network (WiFi vs Mobile Data)

---

### Issue 4: Memory Issues
**Symptoms:**
- App crashes with "Out of memory" error
- Device becomes slow

**Solution:**
1. Close other apps
2. Restart the device
3. Use a device with more RAM (minimum 2GB recommended)

---

## Debugging Steps

### Step 1: Enable Debug Logs
The app automatically logs all map-related events. Just open the console:

**In Expo Dev Client:**
```bash
# Start the app
npm start

# Press 'j' to open debugger
# Or shake device → "Debug Remote JS"
```

### Step 2: Reproduce the Issue
1. Open the app
2. Navigate to a screen with location (e.g., Camera screen)
3. Expand the location card
4. Watch the console for logs

### Step 3: Analyze the Logs
Look for these log sections:
- `MAP DIAGNOSTICS` - System information
- `MAP LOAD ATTEMPT` - When map loading starts
- `MAP CRASH ERROR LOG` - If map crashes
- `✅ MAP LOADED SUCCESSFULLY` - If map loads fine

### Step 4: Copy Error Logs
If the map crashes:
1. Find the `JSON Error Log` in the console
2. Copy the entire JSON object
3. Save it to a file or share with developers

---

## Prevention Checklist

Before building for production:

- [ ] Test map on physical device (not emulator)
- [ ] Test with different network conditions
- [ ] Test with low memory conditions
- [ ] Check console for any warnings
- [ ] Verify OSM tiles load correctly
- [ ] Test expand/collapse multiple times

---

## Configuration Files

### app.json
```json
{
  "android": {
    "permissions": [
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION"
    ],
    "config": {
      "googleMaps": {
        "apiKey": ""  // Empty - we use OpenStreetMap
      }
    }
  }
}
```

### package.json
```json
{
  "dependencies": {
    "react-native-maps": "1.20.1",
    "expo-location": "^19.0.7"
  }
}
```

---

## Map Implementation Details

### Provider
- **Android:** Uses default Android MapView
- **iOS:** Uses Apple Maps
- **Tiles:** OpenStreetMap France HOT server

### Features
- ✅ No API keys required
- ✅ Free and open-source
- ✅ Offline fallback (shows coordinates)
- ✅ Error boundary protection
- ✅ Comprehensive logging

---

## When to Rebuild

You MUST rebuild the development build if:
1. ✅ Added new native dependencies
2. ✅ Changed app.json configuration
3. ✅ Updated react-native-maps version
4. ✅ Changed Android permissions

```bash
# Rebuild command
eas build --profile development --platform android
```

---

## Support

If issues persist after following this guide:

1. **Check Logs:** Copy the JSON Error Log from console
2. **Device Info:** Note device model and Android version
3. **Network:** Test on different networks
4. **Rebuild:** Try rebuilding the development build
5. **Report:** Create an issue with all the above information

---

## Quick Reference

### View Logs
```bash
# Start dev server
npm start

# Open debugger
Press 'j' in terminal
```

### Rebuild App
```bash
# Development build
eas build --profile development --platform android

# Preview build (for testing)
eas build --profile preview --platform android
```

### Test Map
1. Open app
2. Go to Camera screen
3. Take photo
4. Expand location card
5. Check console logs

---

**Last Updated:** November 6, 2025
