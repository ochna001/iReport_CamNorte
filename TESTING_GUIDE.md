# iReport Testing Guide - Phase 6 Complete

## Testing Checklist

### 1. Anonymous Login Flow
- [ ] Open app → Should show Welcome screen
- [ ] Tap "Continue as Guest" → Should create anonymous session
- [ ] Check profile tab → Should show "Guest #XXXXXX" identifier
- [ ] Close and reopen app → Guest session should persist
- [ ] Reports should be tied to anonymous user_id

### 2. Report Submission Flow
**Test all three agencies:**

#### PNP (Crime Report)
- [ ] Tap "Report Crime" button
- [ ] Camera opens immediately
- [ ] Capture photo/video or select from gallery
- [ ] Add multiple media (test unlimited uploads)
- [ ] Remove media works correctly
- [ ] Form auto-fills GPS location
- [ ] Submit report successfully
- [ ] Success screen shows tracking ID

#### BFP (Fire Report)
- [ ] Tap "Report Fire" button
- [ ] Follow same camera flow
- [ ] Verify BFP color theme (red)
- [ ] Submit successfully

#### PDRRMO (Disaster Report)
- [ ] Tap "Report Disaster" button
- [ ] Follow same camera flow
- [ ] Verify PDRRMO color theme (orange)
- [ ] Submit successfully

### 3. My Reports Screen
- [ ] Navigate to "My Reports" tab
- [ ] All submitted reports appear in list
- [ ] Pull-to-refresh works
- [ ] Status badges display correctly (Pending/Assigned/In Progress/Resolved/Closed)
- [ ] Agency badges show correct colors
- [ ] Report cards show:
  - Description (truncated to 2 lines)
  - Location address
  - Date submitted
  - Media count
  - Tracking ID

### 4. Incident Details View
- [ ] Tap any report card
- [ ] Details screen opens with agency color header
- [ ] All information displays correctly:
  - Status badge
  - Media gallery (swipe between photos)
  - Pagination dots (if multiple media)
  - Full description
  - Complete location address
  - GPS coordinates
  - Date and time
  - Agency-specific fields (if any)
  - Status timeline
- [ ] Back button returns to reports list

### 5. Guest Account Features
- [ ] Yellow upgrade prompt appears on My Reports
- [ ] "Create Account" button navigates to SignUp
- [ ] Guest can view all their reports
- [ ] Guest reports persist across app sessions

### 6. Registered User Flow
- [ ] Tap "Login" on Welcome screen
- [ ] Login with email/password
- [ ] Profile shows email instead of Guest #
- [ ] Can submit reports
- [ ] Can view reports
- [ ] No upgrade prompt appears

### 7. Sign Up Flow
- [ ] Tap "Sign Up" on Welcome screen
- [ ] Enter email, password, name, age, DOB
- [ ] Receive OTP email
- [ ] Verify OTP
- [ ] Redirects to home screen
- [ ] Profile shows user email

### 8. Edge Cases
- [ ] No internet connection → Proper error messages
- [ ] Camera permission denied → Shows alert
- [ ] Location permission denied → Shows alert
- [ ] Empty reports list → Shows empty state with "Go to Home" button
- [ ] Invalid form data → Validation errors
- [ ] Rate limiting → Max 5 reports per hour per user

### 9. UI/UX Checks
- [ ] Tab bar animation works smoothly
- [ ] Header respects device notch/cutout
- [ ] Tab bar doesn't clip on right side
- [ ] All colors match theme
- [ ] Loading states show properly
- [ ] Error messages are user-friendly
- [ ] Touch targets are adequate size
- [ ] Text is readable on all backgrounds

### 10. Data Persistence
**Guest Reports:**
- [ ] Submit report as guest
- [ ] Note the tracking ID
- [ ] Close app completely
- [ ] Reopen app
- [ ] Guest session persists
- [ ] Report still appears in My Reports
- [ ] Can view incident details

**App Update Scenario:**
- Reports persist (stored in Supabase)
- Session may persist (depends on secure storage)
- If session lost, guest loses access to reports
- Recommend: Add "claim reports" feature later

---

## Known Limitations

1. **Guest Session Loss:** If guest clears app data or reinstalls, they lose access to their reports (reports still exist in DB but can't be accessed)
2. **No Push Notifications:** Status updates require manual refresh
3. **No Offline Mode:** Requires internet connection to submit reports
4. **No Report Editing:** Once submitted, reports cannot be edited
5. **No Report Deletion:** Users cannot delete their reports

---

## Next Phase: Testing & Polish

### Priority Fixes:
1. Test on physical devices (iOS and Android)
2. Test with slow/unstable internet
3. Test with various image sizes and formats
4. Verify all error states
5. Check accessibility features
6. Performance optimization
7. Memory leak checks

### Optional Enhancements:
1. Push notifications for status updates
2. In-app messaging with officers
3. Report sharing functionality
4. Offline mode with queue
5. Report editing within 5 minutes
6. Dark mode support
7. Multiple language support

---

**Last Updated:** November 5, 2025
