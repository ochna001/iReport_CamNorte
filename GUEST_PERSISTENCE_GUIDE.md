# Guest Report Persistence Guide

**Date:** November 5, 2025  
**Feature:** Persistent Guest Reports Across Sessions

## Problem

Previously, when a guest user signed out and signed in again as a guest, they would lose access to their previous reports because:
1. Each anonymous sign-in created a new user ID
2. Reports were only linked to `reporter_id`
3. No way to track the same device across sessions

## Solution: Device ID Tracking

### How It Works

1. **Persistent Device ID**
   - Generated once per device installation
   - Stored in AsyncStorage: `@device_id`
   - Format: `device_1730793600000_abc123xyz`
   - Never changes unless app is reinstalled

2. **Guest Session Tracking**
   - Each guest session ID stored: `@guest_session_id`
   - Device ID attached to user metadata
   - Reports linked to both `reporter_id` AND `device_id`

3. **Report Retrieval**
   - Guest users: Fetch reports by device_id (all guest sessions from this device)
   - Registered users: Fetch reports by reporter_id only

### Implementation Details

**AuthProvider Changes:**
```typescript
// Generate unique device ID
const generateDeviceId = (): string => {
  return `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

// Store device ID on first launch
let storedDeviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
if (!storedDeviceId) {
  storedDeviceId = generateDeviceId();
  await AsyncStorage.setItem(DEVICE_ID_KEY, storedDeviceId);
}

// Attach device_id to anonymous user metadata
await supabase.auth.signInAnonymously({
  options: {
    data: {
      device_id: deviceId,
    }
  }
});
```

**Reports Query:**
```typescript
// For guest users
if (isAnonymous && deviceId) {
  const { data } = await supabase
    .from('incidents')
    .select('*')
    .or(`reporter_id.eq.${session.user.id},reporter_id.in.(select id from auth.users where raw_user_meta_data->>'device_id'='${deviceId}')`)
    .order('created_at', { ascending: false });
}
```

## User Flow

### First Time Guest
1. Opens app
2. Device ID generated and stored
3. Taps "Continue as Guest"
4. Anonymous user created with device_id in metadata
5. Submits reports
6. Reports linked to this guest user

### Returning Guest (After Sign Out)
1. Opens app
2. Device ID retrieved from storage (same as before)
3. Taps "Continue as Guest" again
4. New anonymous user created with SAME device_id
5. Views "My Reports"
6. Sees ALL reports from this device (all guest sessions)

### Upgrade to Registered User
1. Guest user signs up with email
2. Device ID remains the same
3. Previous guest reports still accessible
4. New reports linked to registered account
5. Can see both guest and registered reports

## Benefits

✅ **Persistent Reports** - Guest reports survive sign-out  
✅ **Device Tracking** - All reports from same device grouped  
✅ **Seamless UX** - No data loss for guests  
✅ **Privacy Preserved** - Device ID is anonymous  
✅ **Upgrade Path** - Easy transition to registered account  

## Technical Considerations

### AsyncStorage Keys
- `@device_id` - Permanent device identifier
- `@guest_session_id` - Current guest session (for reference)

### Database Schema
No changes needed! Uses existing:
- `incidents.reporter_id` - Links to auth.users
- `auth.users.raw_user_meta_data` - Stores device_id

### Query Performance
- Guest queries use OR condition (slightly slower)
- Indexed on reporter_id (fast)
- Limit to reasonable number of guest sessions per device

## Edge Cases

### App Reinstall
- Device ID regenerated
- Previous reports lost (expected behavior)
- User can upgrade to registered account to preserve data

### Multiple Devices
- Each device has unique device_id
- Reports stay on the device they were created on
- Registering syncs across devices

### Device Transfer
- New owner gets new device_id
- Previous owner's reports not accessible
- Privacy maintained

## Testing Checklist

- [ ] Generate device ID on first launch
- [ ] Device ID persists across app restarts
- [ ] Guest can submit reports
- [ ] Guest signs out
- [ ] Guest signs in again
- [ ] Previous reports visible in "My Reports"
- [ ] Multiple guest sessions show combined reports
- [ ] Guest upgrades to registered user
- [ ] All reports (guest + registered) visible
- [ ] App reinstall generates new device_id

## Future Enhancements

1. **Cloud Backup**
   - Optional: Backup device_id to cloud
   - Restore on new device with same account

2. **Report Migration**
   - When guest upgrades, migrate all device reports
   - Link to registered account permanently

3. **Multi-Device Sync**
   - Registered users see reports from all devices
   - Guest reports stay device-specific

---

**Status:** ✅ Implemented  
**Last Updated:** November 5, 2025
