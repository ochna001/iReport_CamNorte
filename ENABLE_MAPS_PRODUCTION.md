# Enabling Maps in Production Builds

## Current Status
Maps are **temporarily disabled** in preview/production builds to prevent crashes while we verify the fix works.

---

## Testing Process

### Step 1: Build Development Version
```bash
eas build --profile development --platform android
```

### Step 2: Install and Test
1. Install the development APK on your device
2. Navigate to Camera screen
3. Take a photo
4. Expand the location card
5. Test the following:
   - [ ] Map loads without crashing
   - [ ] Map tiles appear (OpenStreetMap)
   - [ ] Can see marker at location
   - [ ] Can interact with map (zoom, pan)
   - [ ] No console errors
   - [ ] App remains stable

### Step 3: Verify Logs
Check the console for:
```
═══════════════════════════════════════
MAP LOAD ATTEMPT
═══════════════════════════════════════
Latitude: 14.1234
Longitude: 122.5678
═══════════════════════════════════════

✅ MAP LOADED SUCCESSFULLY
✅ Map rendered successfully
```

### Step 4: Stress Test
- [ ] Open/close map 10 times
- [ ] Test on different locations
- [ ] Test with poor network connection
- [ ] Leave map open for 5 minutes
- [ ] Switch between apps while map is open

---

## Enabling Maps in Production

Once all tests pass, follow these steps:

### 1. Update Feature Flag

**File:** `app/components/LocationCard.tsx`

**Change this:**
```typescript
// TODO: Set to true once maps are verified working in development build
const ENABLE_MAPS_IN_PRODUCTION = false;
```

**To this:**
```typescript
// Maps verified working in development build on [DATE]
const ENABLE_MAPS_IN_PRODUCTION = true;
```

### 2. Commit the Change
```bash
git add app/components/LocationCard.tsx
git commit -m "Enable maps in production builds - verified working"
git push
```

### 3. Build Preview Version
```bash
eas build --profile preview --platform android
```

### 4. Test Preview Build
- [ ] Install preview APK
- [ ] Test map functionality
- [ ] Verify no crashes
- [ ] Check performance

### 5. Build Production Version
```bash
# For Google Play Store
eas build --profile production --platform android
```

---

## Rollback Plan

If maps crash in production:

### Quick Fix
```typescript
// Temporarily disable until fix is found
const ENABLE_MAPS_IN_PRODUCTION = false;
```

### Rebuild
```bash
eas build --profile preview --platform android
```

---

## Known Issues & Solutions

### Issue: Map crashes on expand
**Solution:** Rebuild development build
```bash
eas build --profile development --platform android
```

### Issue: Map tiles don't load
**Solution:** Check internet connection, verify OSM server accessible

### Issue: Map shows blank
**Solution:** Check console logs, may need to wait for tiles to load

### Issue: App becomes slow
**Solution:** May be memory issue, test on device with more RAM

---

## Configuration Checklist

Before enabling in production, verify:

- [ ] `app.json` has correct permissions
  ```json
  "permissions": [
    "ACCESS_COARSE_LOCATION",
    "ACCESS_FINE_LOCATION"
  ]
  ```

- [ ] ErrorBoundary is in place
- [ ] Timeout protection is active (10 seconds)
- [ ] Fallback UI is implemented
- [ ] Loading state is shown
- [ ] Console logging is working (dev build)

---

## Performance Considerations

### Memory Usage
- Map tiles consume memory
- Test on devices with 2GB+ RAM
- Consider limiting tile cache

### Network Usage
- OSM tiles require internet
- Each tile is ~10-50 KB
- Consider offline fallback message

### Battery Usage
- GPS + Map rendering = battery drain
- Consider limiting map updates
- Add battery optimization tips for users

---

## Production Checklist

Before final production build:

- [ ] Maps tested in development build
- [ ] No crashes in 100+ test sessions
- [ ] Tested on multiple devices
- [ ] Tested on different Android versions
- [ ] Tested with poor network
- [ ] Tested with low memory
- [ ] Error logging verified
- [ ] Fallback UI works
- [ ] User experience is smooth
- [ ] Performance is acceptable

---

## Timeline

1. **Now:** Maps disabled in production (safe)
2. **After dev build test:** Enable if no issues found
3. **After preview test:** Deploy to production
4. **Monitor:** Watch for crash reports

---

## Support

If you encounter issues:

1. Check `MAP_DEBUGGING.md` for troubleshooting
2. Review console logs (development build only)
3. Copy JSON error logs
4. Test on different device
5. Rebuild if necessary

---

## Quick Commands

```bash
# Test in development
eas build --profile development --platform android

# Test in preview (production-like)
eas build --profile preview --platform android

# Deploy to production
eas build --profile production --platform android
```

---

**Last Updated:** November 6, 2025  
**Status:** Maps disabled in production (testing in progress)  
**Next Step:** Build and test development version
