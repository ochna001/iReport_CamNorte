# Philippine Address Format

## 📍 Address Format Standard

### **Format:**
```
Building, Street No, Purok/Name, Barangay, Municipality/City, Province
```

### **Example from Camarines Norte:**
```
Purok 1, Brgy. Del Carmen, Camarines Norte
```

---

## 🏗️ Implementation

### **File:** `app/components/LocationCard.tsx`

### **Address Components (in order):**

1. **Building Name** (if available)
   - Example: "SM City", "Municipal Hall"
   - Only if not a number

2. **Street Number** (if available)
   - Example: "123", "45-A"

3. **Street Name** (if available)
   - Example: "Rizal Street", "National Highway"

4. **Purok/Sitio** (if available)
   - Example: "Purok 1", "Sitio Maligaya"
   - Common in rural/barangay addresses

5. **Barangay** (district/subregion)
   - Example: "Brgy. Del Carmen", "Barangay Poblacion"
   - Auto-adds "Brgy." prefix if not present

6. **Municipality/City**
   - Example: "Daet", "Camarines Norte"

7. **Province** (region)
   - Example: "Camarines Norte", "Camarines Sur"
   - Excludes generic "Region" text

---

## 📋 Address Parsing Logic

### **From Reverse Geocoding:**

```typescript
const addr = result[0]; // From expo-location

// Building
if (addr.name && !addr.name.match(/^\d/)) {
  addressParts.push(addr.name);
}

// Street Number
if (addr.streetNumber) {
  addressParts.push(addr.streetNumber);
}

// Street Name
if (addr.street) {
  addressParts.push(addr.street);
}

// Purok (if in name)
if (addr.name && addr.name.toLowerCase().includes('purok')) {
  addressParts.push(addr.name);
}

// Barangay (with auto "Brgy." prefix)
const barangay = addr.district || addr.subregion;
if (barangay) {
  const brgyText = barangay.toLowerCase().startsWith('barangay') || 
                   barangay.toLowerCase().startsWith('brgy') 
    ? barangay 
    : `Brgy. ${barangay}`;
  addressParts.push(brgyText);
}

// Municipality/City
if (addr.city) {
  addressParts.push(addr.city);
}

// Province
if (addr.region && !addr.region.toLowerCase().includes('region')) {
  addressParts.push(addr.region);
}

// Join with commas
const formattedAddress = addressParts.join(', ');
```

---

## 🎯 Examples

### **Urban Address:**
```
SM City, Rizal Street, Brgy. Poblacion, Daet, Camarines Norte
```

### **Rural Address:**
```
Purok 1, Brgy. Del Carmen, Camarines Norte
```

### **With Building:**
```
Municipal Hall, National Highway, Brgy. Centro, Daet, Camarines Norte
```

### **Simple Address:**
```
Brgy. Awitan, Daet, Camarines Norte
```

---

## 🔍 Reverse Geocoding API Response

### **expo-location returns:**

```typescript
{
  name: "Purok 1",              // Landmark or street number
  street: "National Highway",    // Street name
  streetNumber: "123",           // Street number (if available)
  district: "Del Carmen",        // Barangay/District
  subregion: "Del Carmen",       // Alternative barangay field
  city: "Camarines Norte",       // Municipality/City
  region: "Bicol Region",        // Province/Region
  country: "Philippines",        // Country
  postalCode: "4603",           // Zip code
  isoCountryCode: "PH"          // Country code
}
```

---

## 📝 Address Cleaning Rules

### **1. Barangay Prefix**
- Input: `"Del Carmen"`
- Output: `"Brgy. Del Carmen"`

- Input: `"Barangay Poblacion"`
- Output: `"Barangay Poblacion"` (already has prefix)

### **2. Building Detection**
- Input: `name: "123"` (starts with number)
- Action: Skip (likely street number, not building)

- Input: `name: "SM City"`
- Action: Include (building name)

### **3. Purok Detection**
- Input: `name: "Purok 1"`
- Action: Include in address

- Input: `name: "Sitio Maligaya"`
- Action: Include in address

### **4. Region Filtering**
- Input: `region: "Bicol Region"`
- Action: Skip (generic region name)

- Input: `region: "Camarines Norte"`
- Action: Include (specific province)

---

## 🧪 Testing

### **Test Cases:**

**Test 1: Full Address**
```
Input: All fields available
Expected: "Building, Street No, Purok, Brgy. Barangay, City, Province"
```

**Test 2: Minimal Address**
```
Input: Only barangay and city
Expected: "Brgy. Barangay, City"
```

**Test 3: Purok Address**
```
Input: Purok 1, Del Carmen
Expected: "Purok 1, Brgy. Del Carmen, Camarines Norte"
```

**Test 4: Urban Address**
```
Input: Street, Barangay, City
Expected: "Street Name, Brgy. Barangay, City, Province"
```

---

## 🌍 Location Examples from Camarines Norte

### **Daet (Capital):**
```
Brgy. Poblacion, Daet, Camarines Norte
Brgy. Awitan, Daet, Camarines Norte
Brgy. Bagasbas, Daet, Camarines Norte
```

### **Other Municipalities:**
```
Purok 1, Brgy. Del Carmen, Camarines Norte
Brgy. Basud, Basud, Camarines Norte
Brgy. Jose Panganiban, Jose Panganiban, Camarines Norte
```

---

## 📊 Address Display

### **In LocationCard:**
```
📍 Your Location
Purok 1, Brgy. Del Carmen, Camarines Norte
14.16223, 122.94145
```

### **In Incident Form:**
```
📍 Your Location
Purok 1, Brgy. Del Carmen, Camarines Norte

📍 Incident Location
Brgy. Poblacion, Daet, Camarines Norte
```

---

## 🔧 Customization

### **To change format:**

Edit `app/components/LocationCard.tsx`:

```typescript
// Current format
const formattedAddress = addressParts.join(', ');

// Alternative: Line breaks
const formattedAddress = addressParts.join('\n');

// Alternative: With labels
const formattedAddress = `
  Street: ${street}
  Barangay: ${barangay}
  City: ${city}
`;
```

---

## 📚 References

- **Philippine Address System:** PHLPOST standards
- **Barangay:** Smallest administrative division
- **Purok:** Subdivision within a barangay
- **Municipality:** Local government unit (LGU)

---

**Status:** Philippine Address Format Implemented ✅  
**Updated:** November 4, 2025
