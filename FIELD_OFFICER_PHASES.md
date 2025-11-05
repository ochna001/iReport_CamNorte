# iReport Field Officer App - Phase Plan

**App:** iReport Field Officer  
**Platform:** React Native (Android/iOS)  
**Target Users:** PNP, BFP, PDRRMO field officers  
**Location:** `ireport_field/` (To be created)

---

## Overview

The Field Officer App is a mobile tool for officers responding to incidents in the field. It focuses on GPS navigation, real-time updates, and offline functionality for areas with poor connectivity.

### Key Features:
- View assigned incidents
- GPS navigation to incident location (OSRM routing)
- Real-time incident updates
- Upload field photos/evidence
- Update incident status on-site
- Offline-first architecture
- Push notifications for new assignments
- Communication with desk officers

---

## Phase 1: Foundation ⏳ NOT STARTED
**Duration:** Week 1  
**Status:** ⏳ Not Started

### Tasks:
- [ ] Initialize Expo project with TypeScript
- [ ] Set up Supabase client (shared config from Resident app)
- [ ] Create project structure
- [ ] Implement officer-specific color theme
- [ ] Set up navigation with Expo Router
- [ ] Configure environment variables
- [ ] Install core dependencies
- [ ] Set up shared components library

### Deliverables:
- Working Expo app with navigation
- Supabase connection established
- Officer theme implemented

---

## Phase 2: Authentication & Profile ⏳ NOT STARTED
**Duration:** Week 1-2  
**Status:** ⏳ Not Started

### Tasks:
- [ ] Create officer login screen
- [ ] Implement biometric authentication (required)
- [ ] Add unit selection (PNP/BFP/PDRRMO)
- [ ] Create officer profile screen
- [ ] Implement role verification (field officer only)
- [ ] Add secure credential storage
- [ ] Create onboarding flow for new officers
- [ ] Implement session management

### Deliverables:
- Officer authentication system
- Unit and role selection
- Profile management

---

## Phase 3: Incident Queue & Dashboard ⏳ NOT STARTED
**Duration:** Week 2-3  
**Status:** ⏳ Not Started

### Tasks:
- [ ] Create dashboard/home screen
- [ ] Implement assigned incidents list
- [ ] Add incident priority indicators
- [ ] Create incident card component
- [ ] Implement pull-to-refresh
- [ ] Add real-time subscriptions for new assignments
- [ ] Create incident filtering (status, priority, distance)
- [ ] Add quick actions (accept, decline assignment)

### Deliverables:
- Dashboard with assigned incidents
- Real-time updates working
- Filtering and sorting functional

---

## Phase 4: GPS Navigation & Routing ⏳ NOT STARTED
**Duration:** Week 3-4  
**Status:** ⏳ Not Started

### Tasks:
- [ ] Integrate OSRM (Open Source Routing Machine)
- [ ] Implement route calculation
- [ ] Create map view with route overlay
- [ ] Add turn-by-turn navigation
- [ ] Implement GPS tracking
- [ ] Add distance and ETA display
- [ ] Create "Navigate" button integration
- [ ] Add background location tracking
- [ ] Implement arrival detection

### Deliverables:
- GPS navigation to incident location
- Route visualization on map
- Turn-by-turn directions
- ETA calculation

---

## Phase 5: Incident Details & Updates ⏳ NOT STARTED
**Duration:** Week 4-5  
**Status:** ⏳ Not Started

### Tasks:
- [ ] Create incident details screen
- [ ] Display reporter information
- [ ] Show incident media gallery
- [ ] Add status update functionality
- [ ] Create status options (En Route, On Scene, Resolved, etc.)
- [ ] Implement notes/comments system
- [ ] Add timestamp tracking for each status
- [ ] Create incident timeline view

### Deliverables:
- Detailed incident view
- Status update system
- Timeline tracking

---

## Phase 6: Field Evidence & Documentation ⏳ NOT STARTED
**Duration:** Week 5-6  
**Status:** ⏳ Not Started

### Tasks:
- [ ] Implement camera for field photos
- [ ] Add video recording
- [ ] Create evidence upload system
- [ ] Implement photo annotations
- [ ] Add voice notes recording
- [ ] Create evidence gallery
- [ ] Implement offline evidence queue
- [ ] Add evidence metadata (timestamp, GPS)

### Deliverables:
- Field evidence capture
- Media upload system
- Offline evidence queue

---

## Phase 7: Offline Mode & Sync ⏳ NOT STARTED
**Duration:** Week 6-7  
**Status:** ⏳ Not Started

### Tasks:
- [ ] Implement offline data storage (SQLite)
- [ ] Create sync queue system
- [ ] Add offline incident viewing
- [ ] Implement offline status updates
- [ ] Create sync indicator UI
- [ ] Add conflict resolution
- [ ] Implement background sync
- [ ] Create offline maps caching

### Deliverables:
- Full offline functionality
- Automatic sync when online
- Offline maps support

---

## Phase 8: Communication & Notifications ⏳ NOT STARTED
**Duration:** Week 7-8  
**Status:** ⏳ Not Started

### Tasks:
- [ ] Implement push notifications (Expo Notifications)
- [ ] Add new assignment alerts
- [ ] Create in-app messaging with desk officers
- [ ] Implement incident chat/comments
- [ ] Add notification preferences
- [ ] Create notification history
- [ ] Implement emergency broadcast system
- [ ] Add sound/vibration alerts

### Deliverables:
- Push notifications working
- In-app messaging functional
- Emergency alerts system

---

## Phase 9: Reports & History ⏳ NOT STARTED
**Duration:** Week 8-9  
**Status:** ⏳ Not Started

### Tasks:
- [ ] Create completed incidents history
- [ ] Implement incident search
- [ ] Add date range filtering
- [ ] Create officer performance stats
- [ ] Implement incident reports export
- [ ] Add shift summary
- [ ] Create monthly activity report
- [ ] Implement data visualization

### Deliverables:
- Incident history view
- Performance statistics
- Report generation

---

## Phase 10: Testing & Polish ⏳ NOT STARTED
**Duration:** Week 9-10  
**Status:** ⏳ Not Started

### Tasks:
- [ ] End-to-end testing
- [ ] GPS accuracy testing
- [ ] Offline mode testing
- [ ] Performance optimization
- [ ] Battery usage optimization
- [ ] UI/UX refinements
- [ ] Accessibility improvements
- [ ] Security audit

### Deliverables:
- Fully tested app
- Optimized performance
- Polished UI/UX

---

## Phase 11: Deployment ⏳ NOT STARTED
**Duration:** Week 11  
**Status:** ⏳ Not Started

### Tasks:
- [ ] Build production APK/IPA
- [ ] Internal testing with officers
- [ ] Create training materials
- [ ] Conduct officer training sessions
- [ ] Beta testing with select officers
- [ ] Final bug fixes
- [ ] Submit to app stores
- [ ] Deploy to production

### Deliverables:
- Production builds
- Training materials
- App store submissions

---

## Technical Stack

### Frontend:
- React Native (Expo)
- TypeScript
- Expo Router
- react-native-maps (OSM + OSRM)
- expo-location (GPS tracking)
- expo-notifications (push notifications)
- expo-sqlite (offline storage)
- Lucide React Native (icons)

### Backend:
- Supabase (shared with Resident app)
- Supabase Realtime (incident updates)
- OSRM (routing engine)
- OSM (map tiles)

### APIs:
- OSRM API (routing)
- OpenStreetMap (geocoding)
- Expo Push Notifications

---

## Success Metrics

### Launch Goals:
- < 5 second route calculation
- 95%+ GPS accuracy
- < 10% battery drain per hour
- 99%+ offline reliability
- < 2 second incident load time

### Post-Launch Goals:
- 90%+ officer adoption rate
- 4.5+ star rating from officers
- < 30 second average response time to assignment
- 80%+ incident resolution rate

---

## Dependencies

### Must be completed first:
- Resident App (Phase 8) - for incident creation
- Database schema updates for assignments
- OSRM server setup

### Can develop in parallel:
- Desk Officer App (for assignment creation)
- Chief/Admin App (for oversight)

---

**Last Updated:** November 6, 2025
