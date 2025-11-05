# iReport Resident App - Phase Plan

**App:** iReport Resident  
**Platform:** React Native (Android/iOS)  
**Target Users:** General public, residents, guests  
**Location:** `ireport_v1/`

---

## Overview

The Resident App is a simple, fast incident reporting tool for the general public. It prioritizes speed and ease of use with a camera-first approach.

### Key Features:
- ✅ Quick 3-step incident reporting
- ✅ Guest access (no login required)
- ✅ Resident authentication for report tracking
- ✅ Camera-first capture
- ✅ GPS auto-population
- ✅ Three agency buttons (PNP, BFP, PDRRMO)
- ✅ Report tracking and status updates
- ✅ Offline mode with queue system
- ✅ Terms & Privacy Policy agreements
- ✅ Biometric authentication

---

## Phase 1: Foundation ✅ COMPLETE
**Duration:** Week 1  
**Status:** ✅ Complete

### Tasks:
- [x] Initialize Expo project with TypeScript
- [x] Set up Supabase client configuration
- [x] Create project structure (folders, constants)
- [x] Implement color theme system
- [x] Set up navigation with Expo Router
- [x] Configure environment variables (.env)
- [x] Install core dependencies

### Deliverables:
- Working Expo app with navigation
- Supabase connection established
- Color theme implemented

---

## Phase 2: Authentication & Location ✅ COMPLETE
**Duration:** Week 1-2  
**Status:** ✅ Complete

### Tasks:
- [x] Create Login screen with email/password
- [x] Create Sign Up screen with OTP verification
- [x] Implement AuthProvider context
- [x] Add guest/anonymous login
- [x] Implement biometric authentication
- [x] Add secure credential storage (expo-secure-store)
- [x] Create Welcome screen
- [x] Integrate OSM Nominatim reverse geocoding
- [x] Create LocationCard component
- [x] Implement location utilities

### Deliverables:
- Full authentication system
- Guest access working
- Biometric login functional
- Location services integrated

---

## Phase 3: Camera & Media ✅ COMPLETE
**Duration:** Week 2  
**Status:** ✅ Complete

### Tasks:
- [x] Create Camera screen
- [x] Implement photo capture with expo-image-picker
- [x] Implement video capture
- [x] Add gallery selection
- [x] Create media preview modal
- [x] Support multiple media files
- [x] Add remove media functionality
- [x] Navigate to incident form with media

### Deliverables:
- Camera screen with photo/video capture
- Gallery integration
- Media preview and management

---

## Phase 4: Incident Reporting ✅ COMPLETE
**Duration:** Week 3  
**Status:** ✅ Complete

### Tasks:
- [x] Create simple incident form
- [x] Add agency-specific fields (name, age, description)
- [x] Implement suggested descriptions
- [x] Create report confirmation screen
- [x] Create report success screen
- [x] Add tracking number generation
- [x] Implement form validation

### Deliverables:
- Working incident form
- Confirmation and success screens
- Tracking number system

---

## Phase 5: Submission & Storage ✅ COMPLETE
**Duration:** Week 3-4  
**Status:** ✅ Complete

### Tasks:
- [x] Create incidents table in Supabase
- [x] Implement media upload to Supabase Storage
- [x] Create incident submission logic
- [x] Add error handling
- [x] Implement rate limiting (5 reports/hour)
- [x] Add input validation
- [x] Create database triggers

### Deliverables:
- Incidents stored in database
- Media files uploaded to storage
- Rate limiting active
- Error handling implemented

---

## Phase 6: Report Tracking ✅ COMPLETE
**Duration:** Week 4  
**Status:** ✅ Complete

### Tasks:
- [x] Create My Reports screen
- [x] Implement report list with status badges
- [x] Add pull-to-refresh
- [x] Create incident details screen
- [x] Add media gallery with pagination
- [x] Implement status timeline
- [x] Add guest account upgrade prompt
- [x] Implement sorting (Date, Status, Agency)

### Deliverables:
- My Reports screen functional
- Incident details view complete
- Status tracking working

---

## Phase 7: Polish & Enhancements ✅ COMPLETE
**Duration:** Week 5  
**Status:** ✅ Complete

### Tasks:
- [x] Add suggested descriptions for faster reporting
- [x] Integrate LocationCard in incident details
- [x] Fix navigation flows
- [x] Implement DOB as single source of truth
- [x] Add offline mode with queue system
- [x] Add public stats on home screen (toggleable)
- [x] Create Privacy Policy and Terms of Service
- [x] Add Terms & Privacy agreements to sign up/guest
- [x] Update splash screen with app logo
- [x] Fix header to show display name instead of email
- [x] Integrate OpenStreetMap with OSM France HOT tiles
- [x] Test end-to-end flows
- [x] UI/UX refinements

### Deliverables:
- Polished user experience
- Offline mode working
- Legal documents in place
- OSM maps integrated

---

## Phase 8: Deployment Preparation 🔄 IN PROGRESS
**Duration:** Week 6  
**Status:** 🔄 In Progress

### Tasks:
- [ ] Build production APK with EAS Build
- [ ] Build production IPA with EAS Build
- [ ] Test on physical Android devices
- [ ] Test on physical iOS devices
- [ ] Create app store assets (screenshots, icons)
- [ ] Write app store descriptions
- [ ] Final QA testing
- [ ] Performance optimization
- [ ] Submit to Google Play Store
- [ ] Submit to Apple App Store

### Deliverables:
- Production builds ready
- App store listings created
- Apps submitted for review

---

## Phase 9: Post-Launch (Optional) ⏳ FUTURE
**Duration:** Ongoing  
**Status:** ⏳ Not Started

### Potential Features:
- [ ] Real-time push notifications for status updates
- [ ] In-app messaging with officers
- [ ] Report sharing functionality
- [ ] Dark mode support
- [ ] Multi-language support (Tagalog, Bikol)
- [ ] Advanced analytics
- [ ] Community features
- [ ] Report templates

### Deliverables:
- Enhanced features based on user feedback
- Continuous improvements

---

## Technical Stack

### Frontend:
- React Native (Expo)
- TypeScript
- Expo Router (navigation)
- Lucide React Native (icons)
- expo-image-picker (camera/gallery)
- expo-location (GPS)
- expo-secure-store (biometric credentials)
- react-native-maps (OSM integration)

### Backend:
- Supabase (PostgreSQL)
- Supabase Storage (media files)
- Supabase Auth (authentication)
- Row Level Security (RLS)

### APIs:
- OpenStreetMap Nominatim (geocoding)
- OSM France HOT (map tiles)

---

## Success Metrics

### Phase 8 Goals:
- App approved on both stores
- Zero critical bugs
- < 3 second report submission time
- 95%+ crash-free rate

### Post-Launch Goals:
- 1000+ downloads in first month
- 4.0+ star rating
- < 5% report abandonment rate
- 80%+ user satisfaction

---

**Last Updated:** November 6, 2025
