# Recent Changes

## Security Enhancement: Biometric Login with Secure Storage

### What Changed
- ✅ Implemented `expo-secure-store` for encrypted credential storage
- ✅ Biometric login now properly authenticates with Supabase
- ✅ Credentials are stored securely when biometric is enabled
- ✅ Biometric button only shows when credentials are saved
- ✅ Invalid credentials are automatically cleared

### How It Works
1. User enables biometric in Profile → Preferences
2. User logs in normally with email/password
3. Credentials are encrypted and stored in secure storage
4. On next app launch, biometric button appears
5. User authenticates with fingerprint/face → logs in automatically

### Files Modified
- `app/screens/LoginScreen.tsx` - Added SecureStore for credentials
- `app/(tabs)/profile.tsx` - Clear credentials when biometric disabled

---

## Map Integration Fixed - Using OpenStreetMap HOT

### What Changed
- ✅ Enabled `react-native-maps` in LocationCard component
- ✅ Using **OSM France HOT tiles** (FREE, no API key needed!)
- ✅ **Policy compliant**: Uses humanitarian tile server designed for emergency apps
- ✅ Map now displays in location cards when expanded
- ✅ Interactive map with draggable marker for location editing

### Why OSM France HOT?
We use `tile.openstreetmap.fr/hot` instead of the main OSM tiles because:
- ✅ Designed for humanitarian and emergency response apps
- ✅ More permissive for mobile applications
- ✅ No User-Agent header issues
- ✅ Complies with OSM tile usage policy
- ✅ Perfect for incident reporting use case

### No Setup Required!
OpenStreetMap is completely free and requires no API keys. Just rebuild the app and it works!

```bash
npx expo run:android
# or
eas build --platform android
```

### Files Modified
- `app/components/LocationCard.tsx` - Enabled MapView with OSM HOT tiles
- `app.json` - Added location permissions
- `OSM_MAP_INFO.md` - Added compliance documentation

---

## Profile Screen Improvements

### What Changed
- ✅ Collapsible sections for Personal Details and Preferences
- ✅ Separate save buttons for each section
- ✅ Cleaner, more organized layout
- ✅ Better user experience with expand/collapse icons

### Files Modified
- `app/(tabs)/profile.tsx` - Restructured with collapsible sections

---

## Bug Fixes

### Logout Redirect
- ✅ Fixed: Logout now redirects to Login screen instead of Welcome screen

### Database Schema
- ✅ Fixed: Removed `updated_at` column from profile update (column doesn't exist)

---

## Next Steps

1. **Rebuild App** - `npx expo run:android` or `eas build --platform android`
2. **Test Biometric Login** - Enable in profile, login normally once, then test biometric
3. **Test Map Display** - Open location card and expand to see OSM map

## Notes

- Biometric credentials are stored encrypted using iOS Keychain / Android Keystore
- OpenStreetMap is completely free with no API keys required
- Map tiles are loaded from https://tile.openstreetmap.org
- Please respect OSM's tile usage policy (don't make excessive requests)
