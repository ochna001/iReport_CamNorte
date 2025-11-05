# iReport Project Plan - Four Application Ecosystem

## Strategic Decision: Four Apps Approach

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│              Supabase Backend (Shared)              │
│  - PostgreSQL Database                              │
│  - Storage (Media Files)                            │
│  - Authentication (All User Types)                  │
│  - Real-time Subscriptions                          │
│  - Row Level Security (RLS)                         │
└─────────────────────────────────────────────────────┘
                          ▲
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼────────┐ ┌──────▼──────┐ ┌───────▼────────┐
│   Resident     │ │    Field    │ │  Desk Officer  │
│   Mobile App   │ │   Officer   │ │   Mobile/Web   │
│                │ │  Mobile App │ │                │
│ React Native   │ │React Native │ │ React Native   │
│ (Android/iOS)  │ │(Android/iOS)│ │  or Next.js    │
└────────────────┘ └─────────────┘ └────────────────┘
                          │
                  ┌───────▼────────┐
                  │  Chief/Admin   │
                  │    Web App     │
                  │                │
                  │    Next.js     │
                  │   (Vercel)     │
                  └────────────────┘
```

---

## App 1: iReport Resident 📱
**Location:** `ireport_v1/` (Current Project)  
**Target Users:** General public, residents, guests  
**Platform:** React Native (Android/iOS)  
**Status:** ✅ Phase 8 - Ready for Deployment

**See detailed phases:** [RESIDENT_PHASES.md](./RESIDENT_PHASES.md)

---

## App 2: iReport Field Officer 📱
**Location:** `ireport_field/` (To be created)  
**Target Users:** PNP, BFP, PDRRMO field officers  
**Platform:** React Native (Android/iOS)  
**Status:** ⏳ Not Started

**See detailed phases:** [FIELD_OFFICER_PHASES.md](./FIELD_OFFICER_PHASES.md)

---

## App 3: iReport Desk Officer 💻
**Location:** `ireport_desk/` (To be created)  
**Target Users:** Desk officers at stations  
**Platform:** Next.js Web App  
**Status:** ⏳ Not Started

**See detailed phases:** [DESK_OFFICER_PHASES.md](./DESK_OFFICER_PHASES.md)

---

## App 4: iReport Chief/Admin 💻
**Location:** `ireport_admin/` (To be created)  
**Target Users:** Chiefs, administrators, LGU officials  
**Platform:** Next.js (Vercel)  
**Status:** ⏳ Not Started

**See detailed phases:** [CHIEF_ADMIN_PHASES.md](./CHIEF_ADMIN_PHASES.md)

---

## Current Focus: Resident App

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

## Why Four Apps?

### Benefits:

| Benefit | Explanation |
|---------|-------------|
| **Role-Specific UX** | Each app tailored to specific workflows and user needs |
| **Security** | Residents can't access officer features; officers can't access admin |
| **Performance** | Smaller app sizes, faster load times, optimized for use case |
| **Platform Choice** | Mobile for field work, web for office/admin work |
| **Development** | Parallel development by different teams possible |
| **Deployment** | Independent release cycles, no downtime for all users |
| **Maintenance** | Easier to update specific roles without affecting others |
| **App Store** | Multiple listings = better visibility and targeted marketing |

### Shared Backend (Supabase):
- PostgreSQL database with shared tables
- Supabase Storage for media files
- Authentication for all user types
- Real-time subscriptions
- Row Level Security (RLS) for data access control

### Shared Code (Potential):
- Supabase client configuration
- Color themes and design tokens
- Common UI components (buttons, cards, etc.)
- Utility functions (geocoding, formatting, etc.)
- TypeScript types and interfaces

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
