# OSM Nominatim Address Structure for Philippines

## 🗺️ Confirmed Data Structure

Based on actual debug output from Camarines Norte location:

### **Raw API Response:**
```json
{
  "name": "5W7V+PCQ",           // Plus Code (skip this)
  "street": null,               // Not available
  "streetNumber": null,         // Not available
  "district": null,             // Barangay (not always available)
  "subregion": "Camarines Norte", // ✅ THIS IS THE PROVINCE!
  "city": "Talisay",            // ✅ Municipality
  "region": "Bicol",            // Regional name (skip)
  "country": "Philippines",
  "postalCode": null,
  "isoCountryCode": "PH",
  "formattedAddress": "5W7V+PCQ, Talisay, Camarines Norte, Philippines"
}
```

---

## 🎯 Key Findings

### **Critical Discovery:**
```
subregion = PROVINCE (Camarines Norte) ✅
region = REGIONAL NAME (Bicol) ❌
```

**This is opposite of what we expected!**

### **Field Mapping:**

| Field | Contains | Use |
|-------|----------|-----|
| `name` | Plus Code or street name | Use if not Plus Code |
| `street` | Street name | Use if available |
| `district` | Barangay | Use if available |
| `city` | Municipality | ✅ Always use |
| `subregion` | **Province** | ✅ Always use |
| `region` | Regional name (Bicol) | ❌ Skip |

---

## 📝 Address Format Logic

### **New Logic (Based on Real Data):**

```typescript
const addressParts = [];

// 1. Name (skip Plus Codes like "5W7V+PCQ")
if (addr.name && !addr.name.match(/^[A-Z0-9]{4}\+[A-Z0-9]{2,3}$/)) {
  addressParts.push(addr.name);
}

// 2. Street
if (addr.street) {
  addressParts.push(addr.street);
}

// 3. Barangay (from district)
if (addr.district) {
  addressParts.push(addr.district);
}

// 4. Municipality (from city)
if (addr.city) {
  addressParts.push(addr.city);
}

// 5. Province (from subregion, NOT region!)
if (addr.subregion) {
  addressParts.push(addr.subregion);
}

return addressParts.join(', ');
```

---

## 📊 Examples

### **Example 1: Your Location (Talisay)**

**Input:**
```json
{
  "name": "5W7V+PCQ",
  "city": "Talisay",
  "subregion": "Camarines Norte",
  "region": "Bicol"
}
```

**Output:**
```
Talisay, Camarines Norte ✅
```

**Before Fix:**
```
5W7V+PCQ, Camarines Norte, Talisay ❌
```

---

### **Example 2: With Street Name**

**Input:**
```json
{
  "name": "Rizal Street",
  "city": "Daet",
  "subregion": "Camarines Norte",
  "region": "Bicol"
}
```

**Output:**
```
Rizal Street, Daet, Camarines Norte ✅
```

---

### **Example 3: With Barangay**

**Input:**
```json
{
  "name": "Purok 1",
  "district": "Del Carmen",
  "city": "Talisay",
  "subregion": "Camarines Norte",
  "region": "Bicol"
}
```

**Output:**
```
Purok 1, Del Carmen, Talisay, Camarines Norte ✅
```

---

## 🔍 Plus Code Detection

### **What is a Plus Code?**
Google's open location code format:
- Format: `XXXX+XX` or `XXXX+XXX`
- Example: `5W7V+PCQ`
- Not human-readable
- Should be skipped

### **Detection Regex:**
```typescript
/^[A-Z0-9]{4}\+[A-Z0-9]{2,3}$/
```

**Matches:**
- ✅ `5W7V+PCQ`
- ✅ `6PQR+MN`
- ✅ `7ABC+DEF`

**Doesn't Match:**
- ❌ `Purok 1`
- ❌ `Rizal Street`
- ❌ `Del Carmen`

---

## 🗺️ OSM vs Google Maps

### **OSM (Nominatim):**
```
subregion = Province
region = Regional name
```

### **Google Maps (if we used it):**
```
administrativeArea = Province
locality = Municipality
```

**Important:** We're using OSM/Nominatim, not Google Maps!

---

## 🧪 Testing Results

### **Test Location: Talisay, Camarines Norte**

**Coordinates:**
```
Latitude: 14.1631208
Longitude: 122.9412058
```

**Before Fix:**
```
5W7V+PCQ, Camarines Norte, Talisay ❌
```

**After Fix:**
```
Talisay, Camarines Norte ✅
```

**Status:** ✅ Working correctly!

---

## 📋 Field Availability

Based on testing in Camarines Norte:

| Field | Availability | Notes |
|-------|--------------|-------|
| `name` | ✅ Always | May be Plus Code |
| `street` | ❌ Rare | Usually null |
| `streetNumber` | ❌ Rare | Usually null |
| `district` | ⚠️ Sometimes | Barangay if available |
| `subregion` | ✅ Always | Province name |
| `city` | ✅ Always | Municipality |
| `region` | ✅ Always | Regional name (skip) |
| `country` | ✅ Always | Philippines |
| `postalCode` | ❌ Rare | Usually null |

---

## 🎯 Final Format

### **Ideal Output:**
```
[Street/Purok], [Barangay], Municipality, Province
```

### **Minimum Output:**
```
Municipality, Province
```

### **Examples:**

**Full:**
```
Purok 1, Del Carmen, Talisay, Camarines Norte
```

**Without Barangay:**
```
Talisay, Camarines Norte
```

**With Street:**
```
Rizal Street, Poblacion, Daet, Camarines Norte
```

---

## 🚀 Implementation Status

### **Files Updated:**
- ✅ `app/components/LocationCard.tsx` - Fixed address parsing
- ✅ `app/debug-location.tsx` - Debug tool created
- ✅ Documentation updated

### **Changes Made:**
1. ✅ Skip Plus Codes in name field
2. ✅ Use `subregion` for province (not `region`)
3. ✅ Skip `region` field (Bicol)
4. ✅ Proper field order
5. ✅ Fallback to formattedAddress if needed

---

## 📚 References

- **OSM Nominatim:** https://nominatim.openstreetmap.org/
- **Plus Codes:** https://maps.google.com/pluscodes/
- **expo-location:** https://docs.expo.dev/versions/latest/sdk/location/

---

**Status:** OSM Address Structure Confirmed ✅  
**Provider:** Nominatim (OpenStreetMap)  
**Region:** Camarines Norte, Philippines  
**Updated:** November 4, 2025
