# iReport Project Plan - Two Separate Applications

## Strategic Decision: Two Apps Approach

### App 1: iReport Resident/Guest (Current Project)
**Location:** `ireport_v1/`  
**Target Users:** General public, residents, guests  
**Status:** 🔄 In Development - Phase 6 (Report Tracking)

#### Features:
- ✅ Simple incident reporting (3 steps)
- ✅ Guest access (no login required)
- ✅ Resident authentication (track reports)
- ✅ Camera-first incident capture
- ✅ GPS and timestamp auto-population
- ✅ OSM Nominatim reverse geocoding
- ✅ Three agency buttons (PNP, BFP, PDRRMO)
- ✅ Camera screen with photo/video capture
- ✅ Multiple media support with gallery
- ✅ Media preview modal
- ✅ Simple incident form (name, age, description)
- ✅ Report confirmation/summary screen
- ✅ Anonymous login for guest tracking
- ✅ Media upload to Supabase Storage
- ✅ Incident submission to database
- ✅ Success screen with tracking number
- ✅ My Reports screen with status tracking
- ✅ Guest account upgrade prompt
- ✅ Incident details view with full report information
- ✅ Media gallery with pagination
- ✅ Status timeline display
- ⏳ Real-time status update notifications (push notifications)

#### User Flow:
1. Open app → See three agency buttons
2. Tap button → Camera opens immediately
3. Capture photo/video → Auto-fill form with GPS/timestamp
4. Add minimal details → Submit
5. (Optional) Track report if logged in

---

### App 2: iReport LGU Officers (Future Project)
**Location:** `ireport_lgu/` (To be created)  
**Target Users:** PNP, BFP, PDRRMO officers (Desk, Field, Chief)  
**Status:** ⏳ Not Started

#### Features:
- Unit selection (PNP/BFP/PDRRMO)
- Role selection (Desk Officer/Field Officer/Chief)
- Incident management dashboard
- Assignment system
- Active incident monitoring
- **OSM-based routing** (OSRM for fastest route to incident)
- **Route visualization** on map with turn-by-turn navigation
- Final report documentation
- Advanced authentication with biometrics
- Real-time notifications
- Analytics and reporting

#### User Roles:
- **Desk Officer:** Process and assign incidents
- **Field Officer:** Respond to assigned incidents
- **Chief/Admin:** System oversight and management

---

## Current Phase: Resident/Guest App

### Completed:
- ✅ **Phase 1:** Project setup with Expo
- ✅ **Phase 1:** Supabase integration
- ✅ **Phase 2:** Authentication system (Login/SignUp/OTP)
- ✅ **Phase 2:** Color theme implementation
- ✅ **Phase 2:** Home screen with agency buttons
- ✅ **Phase 2:** AuthProvider context
- ✅ **Phase 2:** OSM Nominatim reverse geocoding
- ✅ **Phase 2:** Location utilities (`lib/geocoding.ts`)
- ✅ **Phase 2:** LocationCard component
- ✅ **Phase 2:** Debug location screen
- ✅ **Phase 3:** Camera screen (`app/camera.tsx`)
- ✅ **Phase 3:** Photo/video capture with ImagePicker
- ✅ **Phase 3:** Multiple media support
- ✅ **Phase 3:** Gallery selection
- ✅ **Phase 3:** Media preview with remove functionality
- ✅ **Phase 3:** Navigation to incident form with media
- ✅ **Phase 3:** Full-screen media preview modal
- ✅ **Phase 4:** Simple incident form (skipped complex agency forms)
- ✅ **Phase 4:** Report confirmation/summary screen (`confirm-report.tsx`)
- ✅ **Phase 4:** Success screen with tracking number (`report-success.tsx`)
- ✅ **Phase 5:** Database schema created (`INCIDENTS_TABLE.sql`)
- ✅ **Phase 5:** Anonymous login implementation (`AuthProvider.tsx`)
- ✅ **Phase 5:** Media upload to Supabase Storage
- ✅ **Phase 5:** Incident submission implementation
- ✅ **Phase 6:** My Reports screen (`my-reports.tsx`)
- ✅ **Phase 6:** Guest account upgrade prompt
- ✅ **Phase 6:** Report list with status badges
- ✅ **Phase 6:** Pull-to-refresh functionality
- ✅ **Phase 6:** Welcome screen with guest/login options (`welcome.tsx`)
- ✅ **Phase 6:** Guest user identifier display (Guest #ABC12345)
- ✅ **Phase 6:** Manual anonymous sign-in (not auto)
- ✅ **Phase 6:** Incident details screen (`incident-details.tsx`)
- ✅ **Phase 6:** Media gallery with horizontal scroll and pagination
- ✅ **Phase 6:** Status timeline with visual indicators
- ✅ **Phase 6:** Agency-specific detail fields display
- ✅ **Phase 7:** Suggested descriptions for faster reporting (agency-specific)
- ✅ **Phase 7:** LocationCard integration in incident details (map view option)
- ✅ **Phase 7:** Fixed report success navigation flow
- ✅ **Phase 7:** Sorting in My Reports (Date, Status, Agency)
- ✅ **Phase 7:** DOB as single source of truth (auto-calculate age)
- ✅ **Phase 7.5:** Offline mode support with queue system
- ✅ **Phase 7.5:** Public stats on home screen (toggleable)
- ✅ **Phase 7.5:** Privacy Policy and Terms of Service
- ✅ **Security:** Rate limiting (5 reports/hour) (`RATE_LIMITING.sql`)
- ✅ **Security:** Input validation and abuse prevention

### Next Steps:
1. **Phase 7: Testing & Polish** ✅ Complete
   - ✅ Tested anonymous login flow end-to-end
   - ✅ Tested report submission and tracking
   - ✅ Tested incident details view
   - ✅ UI/UX refinements (suggestions, LocationCard, navigation)
   - ⏳ Performance optimization (ongoing)
   - ⏳ Bug fixes (as discovered)

2. **Phase 8: Deployment Preparation** (Next)
   - Build production APK/IPA with EAS Build
   - Test on physical devices (Android & iOS)
   - App store assets (screenshots, descriptions, icons)
   - ✅ Privacy policy and terms of service
   - Final QA testing
   - Submit to Google Play Store / Apple App Store

3. **Phase 9: Optional Enhancements** (Future)
   - Real-time push notifications for status updates
   - In-app messaging with officers
   - Report sharing functionality
   - ✅ Offline mode support (completed)
   - Multiple officers assignment (LGU app)
   - Dark mode support
   - Multi-language support (Tagalog, Bikol)

---

## Why Two Apps?

### Benefits:
1. **Better UX** - Each app tailored to its specific audience
2. **Security** - Officer features not exposed in public app
3. **Smaller Size** - Residents don't download unused officer features
4. **Professional** - Officers get a dedicated, professional tool
5. **Maintainability** - Clear separation of concerns
6. **App Store** - Two listings = better visibility

### Shared Components:
- Supabase client configuration
- Color themes
- Common UI components
- Database schema
- API utilities

---

## Database Schema
Both apps will use the same Supabase backend with shared tables:
- `profiles` - User accounts (residents and officers)
- `incidents` - All incident reports
- `agency_stations` - Station locations for routing
- `incident_assignments` - Officer assignments (LGU app only)
- `incident_updates` - Status updates

---

## Timeline
- **Phase 1:** Project Setup ✅ Complete
- **Phase 2:** Authentication & Location ✅ Complete
- **Phase 3:** Camera & Media ✅ Complete
- **Phase 4:** Incident Forms ✅ Complete (simplified)
- **Phase 5:** Submission & Storage ✅ Complete
- **Phase 6:** Report Tracking ✅ Complete
- **Phase 7:** Testing & Polish ✅ Complete
- **Phase 8 (Next):** Deployment Preparation
- **Phase 9:** Optional Enhancements (as needed)
- **Phase 10:** LGU Officers App (Start after Resident app is deployed)

---

## Technical Notes

### OSM Integration
- **Geocoding:** OpenStreetMap Nominatim API for reverse geocoding
- **Routing (LGU App):** OSRM (Open Source Routing Machine) for fastest route calculation
- **Visualization:** react-native-maps with polyline overlay for route display
- **Utilities:** Centralized in `lib/geocoding.ts` for consistency

---

**Last Updated:** November 5, 2025
