# 🔍 Location Debug Tool

## Purpose

This debug tool shows exactly what data the Nominatim API (OpenStreetMap) returns for your location, helping you understand and fix address formatting issues.

## How to Use

### **1. Access the Debug Screen**

**From Home Screen:**
1. Open the app
2. Scroll down
3. Tap **"🔍 Debug Location"** button

**Direct Navigation:**
```
/debug-location
```

---

### **2. What You'll See**

The debug screen shows:

#### **📍 Coordinates**
```
Latitude: 14.16223
Longitude: 122.94145
```

#### **✅ Formatted Address**
Shows the address as formatted by your current logic:
```
Purok 1, Del Carmen, Talisay, Camarines Norte
```

#### **🔍 Raw API Response**
Shows all fields returned by Nominatim:
```
name: Purok 1
street: null
streetNumber: null
district: Del Carmen
subregion: null
city: Talisay
region: Camarines Norte
country: Philippines
postalCode: 4603
isoCountryCode: PH
```

#### **📋 JSON Output**
Full JSON response for copying/debugging:
```json
{
  "name": "Purok 1",
  "district": "Del Carmen",
  "city": "Talisay",
  "region": "Camarines Norte",
  "country": "Philippines",
  "postalCode": "4603"
}
```

#### **🧪 Address Parts Analysis**
Shows which fields are available:
```
name: "Purok 1" ✅
street: "null" ❌
streetNumber: "null" ❌
district: "Del Carmen" ✅
subregion: "null" ❌
city: "Talisay" ✅
region: "Camarines Norte" ✅
country: "Philippines" ✅
postalCode: "4603" ✅
```

---

## How to Use This Data

### **Step 1: Check Raw Data**
Look at the "Raw API Response" section to see what fields Nominatim actually provides.

### **Step 2: Identify Issues**
Compare the raw data with the formatted address:
- Is something missing?
- Is something in the wrong place?
- Are there duplicate values?

### **Step 3: Fix the Logic**
Edit `app/components/LocationCard.tsx` based on what you see:

```typescript
// Example: If "district" contains the barangay
const barangay = addr.district || addr.subregion;
if (barangay) {
  addressParts.push(barangay);
}

// Example: If "city" is actually the municipality
if (addr.city) {
  addressParts.push(addr.city);
}

// Example: If "region" contains the province
if (addr.region && !addr.region.includes('Bicol')) {
  addressParts.push(addr.region);
}
```

---

## Common Issues & Solutions

### **Issue 1: Wrong Field Mapping**

**Problem:**
```
Raw: district: "Camarines Norte"
Formatted: "Brgy. Camarines Norte" ❌
```

**Solution:**
```typescript
// Check if district is actually a province name
if (addr.district && !isProvinceName(addr.district)) {
  addressParts.push(addr.district);
}
```

---

### **Issue 2: Duplicate Values**

**Problem:**
```
Raw: city: "Camarines Norte", region: "Camarines Norte"
Formatted: "Camarines Norte, Camarines Norte" ❌
```

**Solution:**
```typescript
// Skip if already added
if (barangay && barangay !== addr.city && barangay !== addr.region) {
  addressParts.push(barangay);
}
```

---

### **Issue 3: Regional Names**

**Problem:**
```
Raw: region: "Bicol Region"
Formatted: "..., Bicol Region" ❌
```

**Solution:**
```typescript
// Skip regional names
if (addr.region && !addr.region.toLowerCase().includes('region')) {
  addressParts.push(addr.region);
}
```

---

## Testing Different Locations

### **Test 1: Urban Area (Daet)**
Expected fields:
- name: Street name or landmark
- district: Barangay name
- city: "Daet"
- region: "Camarines Norte"

### **Test 2: Rural Area (Del Carmen)**
Expected fields:
- name: "Purok 1" or similar
- district: "Del Carmen"
- city: Municipality name
- region: "Camarines Norte"

### **Test 3: Provincial Road**
Expected fields:
- name: Road name
- district: Barangay
- city: Municipality
- region: Province

---

## Debugging Workflow

### **Step 1: Capture Data**
1. Go to the location you want to test
2. Open debug screen
3. Take screenshot or copy JSON

### **Step 2: Analyze**
1. Check which fields are populated
2. Identify what each field represents
3. Note any unexpected values

### **Step 3: Update Logic**
1. Edit `LocationCard.tsx`
2. Update address parsing based on findings
3. Test again

### **Step 4: Verify**
1. Refresh debug screen
2. Check formatted address
3. Confirm it matches expected format

---

## Expected Format

### **Target Format:**
```
Purok/Street, Barangay, Municipality, Province
```

### **Examples:**

**Rural:**
```
Purok 1, Del Carmen, Talisay, Camarines Norte
```

**Urban:**
```
Rizal Street, Poblacion, Daet, Camarines Norte
```

**Simple:**
```
Del Carmen, Camarines Norte
```

---

## Removing Debug Tool (Production)

### **Before Release:**

1. **Remove from Home Screen**
   ```typescript
   // Delete this section from app/(tabs)/index.tsx
   <TouchableOpacity 
     style={styles.debugButton}
     onPress={() => router.push('/debug-location')}
   >
     <Text style={styles.debugText}>🔍 Debug Location</Text>
   </TouchableOpacity>
   ```

2. **Delete Debug File**
   ```bash
   rm app/debug-location.tsx
   ```

3. **Or Keep Hidden**
   ```typescript
   // Only show in development
   {__DEV__ && (
     <TouchableOpacity 
       style={styles.debugButton}
       onPress={() => router.push('/debug-location')}
     >
       <Text style={styles.debugText}>🔍 Debug Location</Text>
     </TouchableOpacity>
   )}
   ```

---

## Sharing Debug Data

### **To Share with Developer:**

1. Open debug screen
2. Scroll to "JSON Output" section
3. Take screenshot or copy text
4. Share via:
   - Screenshot
   - Copy/paste JSON
   - Screen recording

### **What to Include:**
- Coordinates
- Raw API response
- Current formatted address
- Expected address format

---

## Technical Details

### **API Used:**
- `expo-location` → `reverseGeocodeAsync()`
- Backend: Nominatim (OpenStreetMap)
- No API key required

### **Data Structure:**
```typescript
interface LocationGeocodedAddress {
  name?: string;
  street?: string;
  streetNumber?: string;
  district?: string;
  subregion?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  isoCountryCode?: string;
}
```

### **Refresh Rate:**
- Manual refresh only
- Tap "🔄 Refresh" to update
- Gets current device location

---

## Tips

✅ **Test in multiple locations** - Different areas may return different field structures

✅ **Compare with Google Maps** - Verify the expected address format

✅ **Check field availability** - Not all fields are always populated

✅ **Look for patterns** - Nominatim may use fields differently in different regions

✅ **Test edge cases** - Highways, provincial roads, remote areas

---

**Status:** Debug Tool Ready ✅  
**Location:** `app/debug-location.tsx`  
**Access:** Home Screen → "🔍 Debug Location"  
**Updated:** November 4, 2025
