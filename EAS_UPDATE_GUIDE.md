# EAS Update Guide

## Overview
EAS Update allows you to push JavaScript changes to your app **without rebuilding**. Users get updates automatically when they restart the app.

---

## ⚠️ IMPORTANT: One-Time Rebuild Required

**Before you can use EAS Update, you MUST rebuild your app once** to include the update configuration.

### Why Rebuild?
- ✅ Includes `expo-updates` native module
- ✅ Configures update channels
- ✅ Enables Hermes JS engine
- ✅ Sets up update URL

### Rebuild Command:
```bash
# For testing
eas build --profile preview --platform android

# For production
eas build --profile production --platform android
```

**After this rebuild, you can use `eas update` for all future JavaScript changes!**

---

## What Can Be Updated (No Rebuild)

✅ **JavaScript/TypeScript code**
- React components
- Business logic
- Feature flags
- Bug fixes
- UI changes

✅ **Assets**
- Images
- Fonts
- JSON files

✅ **Configuration**
- Feature toggles
- API endpoints (in JS)
- App behavior

---

## What Requires Rebuild

❌ **Native changes**
- `app.json` modifications
- New native dependencies
- Permission changes
- Native module updates
- Android/iOS configuration

---

## How to Push Updates

### Step 1: Make Your Changes
```typescript
// Example: Enable maps in production
// File: app/components/LocationCard.tsx
const ENABLE_MAPS_IN_PRODUCTION = true;
```

### Step 2: Commit Changes
```bash
git add .
git commit -m "Enable maps in production"
git push
```

### Step 3: Push Update
```bash
# For preview builds
eas update --branch preview --message "Enable maps in production"

# For production builds
eas update --branch production --message "Enable maps in production"
```

### Step 4: Users Get Update
- ✅ Automatic on next app restart
- ✅ No reinstall needed
- ✅ Takes 1-2 minutes to propagate

---

## Update Channels

Your app has 3 channels configured:

| Channel | Build Profile | Use Case |
|---------|--------------|----------|
| **development** | `development` | Testing with dev tools |
| **preview** | `preview` | Internal testing |
| **production** | `production` | Live users |

---

## Common Commands

### Push Update to Preview
```bash
eas update --branch preview --message "Your update message"
```

### Push Update to Production
```bash
eas update --branch production --message "Your update message"
```

### View Update History
```bash
eas update:list --branch preview
eas update:list --branch production
```

### Check Update Status
```bash
eas update:view [update-id]
```

---

## Update Workflow

### Scenario 1: Quick Bug Fix

```bash
# 1. Fix the bug in code
# 2. Test locally
npm start

# 3. Commit
git add .
git commit -m "Fix: [bug description]"

# 4. Push update
eas update --branch preview --message "Fix: [bug description]"

# 5. Test on device (restart app)
# 6. If good, push to production
eas update --branch production --message "Fix: [bug description]"
```

### Scenario 2: Enable Feature Flag

```bash
# 1. Change feature flag
const ENABLE_MAPS_IN_PRODUCTION = true;

# 2. Commit
git add app/components/LocationCard.tsx
git commit -m "Enable maps in production"

# 3. Push update
eas update --branch production --message "Enable maps"

# Users get maps enabled on next restart!
```

### Scenario 3: Rollback

```bash
# 1. Find previous update
eas update:list --branch production

# 2. Republish old update
eas update:republish --branch production --group [group-id]
```

---

## Testing Updates

### On Your Device

1. **Install the app** (from the rebuild)
2. **Make a code change**
3. **Push update:**
   ```bash
   eas update --branch preview --message "Test update"
   ```
4. **Close and restart app** (don't just minimize)
5. **Update downloads automatically**

### Check Update Downloaded

Add this to your app to see update info:
```typescript
import * as Updates from 'expo-updates';

// Check for updates
const update = await Updates.checkForUpdateAsync();
if (update.isAvailable) {
  await Updates.fetchUpdateAsync();
  await Updates.reloadAsync();
}
```

---

## Best Practices

### 1. Test in Preview First
```bash
# Always test in preview before production
eas update --branch preview --message "Test feature"
# Test thoroughly
eas update --branch production --message "Deploy feature"
```

### 2. Use Descriptive Messages
```bash
# Good
eas update --branch production --message "Fix: Map crash on Android 12"

# Bad
eas update --branch production --message "update"
```

### 3. Version Your Updates
```bash
# Include version in message
eas update --branch production --message "v1.0.1: Enable maps"
```

### 4. Keep Git in Sync
```bash
# Always commit before updating
git add .
git commit -m "Your changes"
git push
eas update --branch production --message "Your changes"
```

---

## Troubleshooting

### Update Not Appearing

**Solution:**
1. Fully close app (swipe away from recent apps)
2. Reopen app
3. Wait 10-30 seconds
4. Close and reopen again

### "No Updates Available"

**Possible causes:**
- App not built with update config (rebuild needed)
- Wrong channel
- Update still propagating (wait 2-3 minutes)

**Check:**
```bash
eas update:list --branch preview
```

### Update Fails to Download

**Possible causes:**
- No internet connection
- Update too large
- Corrupted update

**Solution:**
```bash
# Republish the update
eas update --branch preview --message "Republish"
```

---

## When to Rebuild vs Update

### Use EAS Update (Fast) ⚡
- JavaScript code changes
- React component updates
- Feature flag toggles
- Bug fixes
- UI tweaks

### Use Full Rebuild (Slow) 🐌
- First time setup
- Native dependency changes
- `app.json` modifications
- Permission updates
- Major version updates

---

## Cost & Limits

**Free Tier:**
- ✅ Unlimited updates
- ✅ Unlimited users
- ✅ All features included

**No limits on:**
- Update frequency
- Update size (reasonable)
- Number of channels

---

## Your Next Steps

### 1. Rebuild Once (Required)
```bash
eas build --profile preview --platform android
```

### 2. Install New Build
Install the APK on your device

### 3. Test Update System
```bash
# Make a small change (e.g., change a text)
# Push update
eas update --branch preview --message "Test update system"
# Restart app and verify change appears
```

### 4. Use for Future Changes
From now on, use `eas update` for all JavaScript changes!

---

## Quick Reference

```bash
# Push update to preview
eas update --branch preview --message "Your message"

# Push update to production
eas update --branch production --message "Your message"

# List updates
eas update:list --branch preview

# View specific update
eas update:view [update-id]

# Rollback (republish old update)
eas update:republish --branch production --group [group-id]
```

---

## Summary

✅ **Installed:** `expo-updates`  
✅ **Configured:** Update channels in `eas.json`  
✅ **Configured:** Update URL in `app.json`  
✅ **Ready:** Just rebuild once, then use updates!

**Next Command:**
```bash
eas build --profile preview --platform android
```

After this rebuild, you can push updates instantly! 🚀

---

**Last Updated:** November 6, 2025  
**Status:** Configured, awaiting rebuild
