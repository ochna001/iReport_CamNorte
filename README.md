# iReport - Camarines Norte

Emergency incident reporting mobile app for residents of Camarines Norte.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (Expo Go)
npm start

# Build for Android (Development)
eas build --profile development --platform android
```

## 📱 Features

### Incident Reporting
- 📸 **Camera-first flow** - Auto-opens camera on report
- 🗺️ **GPS location** - Automatic location with barangay-level detail
- 📍 **Dual locations** - Resident location + Incident location
- 🖼️ **Evidence** - Photo/video attachments
- 📝 **Details** - Name, age, date/time, description

### Multi-Agency Support
- 🚔 **PNP** - Crime reports
- 🚒 **BFP** - Fire reports  
- 🆘 **PDRRMO** - Disaster reports

### Authentication
- 📧 **Email/OTP** - Secure login with DOB
- 👤 **Guest mode** - No login required
- 🔐 **Biometric** - Fingerprint/Face ID
- 📋 **Auto-fill** - Name & age pre-filled for users

## 🛠️ Tech Stack

- React Native + Expo SDK 54
- Supabase (PostgreSQL + Auth)
- Expo Router (file-based)
- react-native-maps (Free OSM/Apple Maps)
- TypeScript

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

## 🏗️ Setup

### 1. Install
```bash
npm install
```

### 2. Environment
Create `.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### 3. Database
Run in Supabase SQL Editor:
1. `reference/schema.sql`
2. `supabase/RLS_POLICIES.sql`
3. `supabase/ADD_DOB_COLUMN.sql`

### 4. Run
```bash
npm start
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

## 📚 Documentation

- `PROJECT_PLAN.md` - Roadmap
- `FREE_MAP_ALTERNATIVES.md` - Maps guide
- `DOB_IMPLEMENTATION.md` - Date of Birth setup

---

**Version:** 1.0.0  
**Updated:** Nov 4, 2025
