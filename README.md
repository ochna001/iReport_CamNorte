# iReport Camarines Norte 🚨

**Emergency incident reporting mobile app for residents of Camarines Norte, Philippines.**

Report crimes, fires, and disasters directly to PNP, BFP, and PDRRMO with photo/video evidence and GPS location.

[![Platform](https://img.shields.io/badge/Platform-React%20Native-blue)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-black)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📱 Features

### 🚀 Quick Incident Reporting
- **Camera-first flow** - Opens camera immediately on report
- **3-step process** - Camera → Details → Submit
- **GPS auto-population** - Automatic location capture
- **Multiple media** - Photos and videos with gallery support
- **Offline mode** - Queue reports when offline

### 🏛️ Multi-Agency Support
- 🚔 **PNP (Philippine National Police)** - Crime reports
- 🚒 **BFP (Bureau of Fire Protection)** - Fire reports
- 🆘 **PDRRMO** - Disaster and emergency reports

### 🔐 Authentication & Security
- **Guest access** - Report without account
- **Email/OTP verification** - Secure resident accounts
- **Biometric login** - Fingerprint/Face ID support
- **Secure storage** - Encrypted credentials with expo-secure-store
- **Terms & Privacy** - Required agreements for compliance

### 📊 Report Tracking
- **My Reports** - View all submitted reports
- **Status updates** - Real-time incident status
- **Media gallery** - View uploaded evidence
- **Timeline** - Track incident progress
- **Sorting & filtering** - By date, status, agency

### 🗺️ Maps & Location
- **OpenStreetMap** - Free, no API keys required
- **OSM France HOT tiles** - Humanitarian tile server
- **Interactive maps** - Expandable location cards
- **Reverse geocoding** - Philippine address format
- **Barangay-level detail** - Accurate local addresses

---

## 🛠️ Tech Stack

### Frontend
- **React Native** - Cross-platform mobile framework
- **Expo SDK 54** - Development platform
- **TypeScript** - Type-safe code
- **Expo Router** - File-based navigation

### Backend
- **Supabase** - PostgreSQL database
- **Supabase Auth** - Authentication system
- **Supabase Storage** - Media file storage
- **Row Level Security** - Data access control

### Key Libraries
- `react-native-maps` - Map integration (OSM)
- `expo-image-picker` - Camera and gallery
- `expo-location` - GPS services
- `expo-secure-store` - Encrypted storage
- `expo-local-authentication` - Biometric auth
- `lucide-react-native` - Modern icons
- `@react-native-async-storage/async-storage` - Local storage
- `@react-native-community/datetimepicker` - Date picker

## 📂 Project Structure

```
app/
├── (tabs)/              # Home screen
├── components/          # LocationCard, etc.
├── screens/             # Auth screens
├── camera.tsx           # Camera screen
└── incident-form.tsx    # Report form

supabase/
├── RLS_POLICIES.sql     # Security
└── ADD_AGE_COLUMN.sql   # Age field migration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Expo CLI** (installed globally)
- **Supabase account** ([Sign up](https://supabase.com/))
- **Android Studio** (for Android builds) or **Xcode** (for iOS builds)

### 1. Clone Repository

```bash
git clone https://github.com/ochna001/iReport_CamNorte.git
cd iReport_CamNorte
```

### 2. Install Dependencies

```bash
npm install
```

**Core dependencies that will be installed:**

```json
{
  "@expo/vector-icons": "^15.0.3",
  "@react-native-async-storage/async-storage": "^2.2.0",
  "@react-native-community/datetimepicker": "^8.5.0",
  "@react-native-community/netinfo": "^11.4.1",
  "@supabase/supabase-js": "^2.78.0",
  "expo": "~54.0.22",
  "expo-camera": "^17.0.9",
  "expo-image-picker": "^17.0.8",
  "expo-local-authentication": "^17.0.7",
  "expo-location": "^19.0.7",
  "expo-router": "~6.0.14",
  "expo-secure-store": "~15.0.7",
  "lucide-react-native": "^0.552.0",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "react-native-maps": "1.20.1",
  "react-native-safe-area-context": "~5.6.0"
}
```

### 3. Set Up Supabase

#### Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Note your **Project URL** and **Anon Key**

#### Run Database Migrations
In Supabase SQL Editor, run these files in order:

1. **`reference/schema.sql`** - Main database schema
2. **`supabase/RLS_POLICIES.sql`** - Row Level Security policies
3. **`supabase/ADD_DOB_COLUMN.sql`** - Date of birth column
4. **`supabase/AUTO_CREATE_PROFILE_TRIGGER.sql`** - Auto-create profiles
5. **`supabase/RATE_LIMITING.sql`** - Rate limiting (5 reports/hour)

#### Enable Storage
1. Go to **Storage** in Supabase Dashboard
2. Create a bucket named `incident-media`
3. Set bucket to **Public** (for media access)

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**⚠️ Important:** Never commit `.env` to version control!

### 5. Run Development Server

```bash
# Start Expo development server
npm start

# Or with specific platform
npm run android  # Android
npm run ios      # iOS
npm run web      # Web (limited functionality)
```

**Note:** Maps require a development build. Expo Go will show a placeholder.

### 6. Build for Testing

#### Development Build (with native features)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --profile development --platform android

# Build for iOS
eas build --profile development --platform ios
```

#### Production Build

```bash
# Android APK
eas build --profile production --platform android

# iOS IPA
eas build --profile production --platform ios
```

---

## 📱 Running on Physical Device

### Android
1. Build development APK: `eas build --profile development --platform android`
2. Download APK from Expo dashboard
3. Install on Android device
4. Enable "Install from Unknown Sources" if needed

### iOS
1. Build development IPA: `eas build --profile development --platform ios`
2. Register device UDID in Apple Developer
3. Download and install via TestFlight or direct install

---

## 🗺️ Maps Setup

**Good news:** No API keys needed! The app uses OpenStreetMap.

### OSM Configuration
- **Tile Server:** OSM France HOT (Humanitarian OpenStreetMap Team)
- **Tile URL:** `https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png`
- **Geocoding:** OpenStreetMap Nominatim API
- **Cost:** FREE ✅

### Why OSM France HOT?
- Designed for humanitarian/emergency apps
- More permissive than main OSM tiles
- No User-Agent header issues
- Perfect for incident reporting

**See:** `OSM_MAP_INFO.md` for more details

---

## 🔧 Configuration

### App Configuration (`app.json`)

```json
{
  "expo": {
    "name": "ireport_v1",
    "slug": "ireport_v1",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "splash": {
      "image": "./assets/images/logov1.png",
      "backgroundColor": "#1E88E5"
    },
    "android": {
      "package": "com.anonymous.ireport_v1",
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION"
      ]
    }
  }
}
```

### EAS Build Configuration (`eas.json`)

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

## 📱 Building

### Development Build (with maps)
```bash
eas build --profile development --platform android
```

### Production
```bash
eas build --profile production --platform android
```

## 🗺️ Maps

**Free maps - no API keys!**
- iOS: Apple Maps
- Android: OpenStreetMap

**Note:** Interactive maps need development build. Expo Go shows placeholder.

## 📊 User Flow

**Logged-in:**
```
Home → Report → Camera → Form (auto-filled) → Submit
```

**Guest:**
```
Home → Report → Camera → Form (manual) → Submit
```

## 📝 Status

- ✅ Phase 1: Foundation
- ✅ Phase 2: Authentication
- ✅ Phase 3: Incident Reporting
- ⏳ Phase 4: Backend Submission
- ⏳ Phase 5: Report Tracking

---

## 🧪 Testing

### Test Scenarios
1. **Guest Report** - Submit without login
2. **Resident Report** - Login and submit with auto-fill
3. **Biometric Login** - Enable and test fingerprint/face
4. **Offline Mode** - Turn off internet, submit report, reconnect
5. **Report Tracking** - View submitted reports and status
6. **Maps** - Expand location card to view map

### Common Issues

**Maps not showing:**
- Build development APK (maps don't work in Expo Go)
- Check internet connection for tile loading

**Camera not working:**
- Grant camera permissions
- Test on physical device (simulator has limitations)

**Biometric not working:**
- Ensure device has biometric hardware
- Login normally once to save credentials
- Enable biometric in Profile → Preferences

---

## 📚 Documentation

### Project Documentation
- **[PROJECT_PLAN.md](PROJECT_PLAN.md)** - 4-app ecosystem overview
- **[RESIDENT_PHASES.md](RESIDENT_PHASES.md)** - Resident app phase plan
- **[FIELD_OFFICER_PHASES.md](FIELD_OFFICER_PHASES.md)** - Field officer app phases
- **[DESK_OFFICER_PHASES.md](DESK_OFFICER_PHASES.md)** - Desk officer app phases
- **[CHIEF_ADMIN_PHASES.md](CHIEF_ADMIN_PHASES.md)** - Chief/admin app phases

### Legal & Technical
- **[PRIVACY_POLICY.md](PRIVACY_POLICY.md)** - Privacy policy
- **[TERMS_OF_SERVICE.md](TERMS_OF_SERVICE.md)** - Terms of service
- **[reference/schema.sql](reference/schema.sql)** - Database schema
- **[supabase/RLS_POLICIES.sql](supabase/RLS_POLICIES.sql)** - Security policies

---

## 🤝 Contributing

This is a government project for Camarines Norte. For contributions:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Team

**Developer:** Camarines Norte LGU Development Team  
**Repository:** [github.com/ochna001/iReport_CamNorte](https://github.com/ochna001/iReport_CamNorte)

---

## 🎯 Roadmap

### Current: Phase 8 - Deployment Preparation ✅

**Completed:**
- ✅ Authentication (Email/OTP, Guest, Biometric)
- ✅ Incident Reporting (Camera, Forms, Submission)
- ✅ Report Tracking (Status, Timeline, Media)
- ✅ Maps (OpenStreetMap, no API keys)
- ✅ Offline Mode (Queue system)
- ✅ Security (Rate limiting, RLS, encryption)

**Next:**
- 📱 App Store Deployment
- 🔔 Push Notifications
- 💬 In-app Messaging

**Future Apps:**
- 🚓 Field Officer App - GPS navigation
- 💻 Desk Officer App - Incident management
- 📊 Chief/Admin App - Analytics & oversight

---

**Version:** 1.0.0  
**Last Updated:** November 6, 2025  
**Status:** Ready for Deployment 🚀
