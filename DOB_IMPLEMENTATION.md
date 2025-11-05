# Date of Birth (DOB) Implementation

## ✅ Why DOB Instead of Age?

### **Benefits of DOB:**
1. **Accurate over time** - Age changes yearly, DOB is permanent
2. **Official standard** - Used in government IDs and documents
3. **Auto-calculation** - Age calculated automatically when needed
4. **Better verification** - Easier to verify with official documents
5. **Analytics** - Better for age-group analysis and statistics

### **Age vs DOB Comparison:**

| Feature | Age | DOB |
|---------|-----|-----|
| Changes over time | ❌ Yes, yearly | ✅ No, permanent |
| Verification | ❌ Harder | ✅ Easier (ID match) |
| Calculation | ❌ Manual | ✅ Automatic |
| Official docs | ❌ Rarely used | ✅ Standard |
| Database storage | ❌ Needs updates | ✅ Set once |

## 📋 Implementation

### **1. Signup Form**

**File:** `app/screens/SignUpScreen.tsx`

**Fields:**
```
Full Name
Date of Birth (MM/DD/YYYY)  ← NEW
Email
Phone Number
Password
Confirm Password
```

**Validation:**
- ✅ Format: MM/DD/YYYY
- ✅ Minimum age: 13 years old
- ✅ Maximum age: 120 years
- ✅ Not in future
- ✅ Valid date (no Feb 31, etc.)

**Code:**
```typescript
// Validate format
const dobRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;

// Calculate age
const dob = new Date(dateOfBirth);
const today = new Date();
const age = today.getFullYear() - dob.getFullYear();
const monthDiff = today.getMonth() - dob.getMonth();
const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) 
  ? age - 1 
  : age;

// Validate age range
if (actualAge < 13) {
  Alert.alert('Error', 'You must be at least 13 years old');
}
```

---

### **2. Database Storage**

**File:** `supabase/ADD_DOB_COLUMN.sql`

**Migration:**
```sql
-- Add date_of_birth column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add constraint
ALTER TABLE public.profiles
ADD CONSTRAINT dob_range CHECK (
  date_of_birth IS NULL OR 
  (date_of_birth <= CURRENT_DATE AND 
   date_of_birth >= CURRENT_DATE - INTERVAL '120 years')
);
```

**Storage locations:**
1. **profiles.date_of_birth** (DATE) - Database
2. **user_metadata.date_of_birth** (string) - Auth metadata

---

### **3. Incident Form Auto-fill**

**File:** `app/incident-form.tsx`

**How it works:**

**Step 1:** Get DOB from user profile
```typescript
const metadata = session.user.user_metadata;
const dob = metadata?.date_of_birth;
```

**Step 2:** Calculate current age
```typescript
const dobDate = new Date(dob);
const today = new Date();
const age = today.getFullYear() - dobDate.getFullYear();
const monthDiff = today.getMonth() - dobDate.getMonth();
const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate()) 
  ? age - 1 
  : age;
```

**Step 3:** Auto-fill age field
```typescript
setAge(actualAge.toString());
```

**Result:**
- ✅ Age is always accurate (calculated in real-time)
- ✅ Auto-updates on birthdays
- ✅ User can still edit if needed (for witness/victim age)

---

## 📊 Data Flow

### **Signup Flow:**
```
User enters DOB (05/15/1990)
    ↓
Validated (format, age range)
    ↓
Saved to TWO places:
    ├─ profiles.date_of_birth = '1990-05-15'
    └─ user_metadata.date_of_birth = '05/15/1990'
```

### **Incident Report Flow:**
```
User logged in
    ↓
Fetch DOB from metadata/database
    ↓
Calculate age: 2025 - 1990 = 35 (adjusted for month/day)
    ↓
Auto-fill age field: "35"
    ↓
User can edit if reporting for someone else
```

---

## 🎯 User Experience

### **For New Users:**
```
Sign Up → Enter DOB → Verify OTP → Login
    ↓
Report Incident → Age auto-filled (calculated from DOB)
```

### **For Guest Users:**
```
Report Incident → Enter age manually
```

### **For Existing Users (before migration):**
```
DOB = NULL in database
    ↓
Age field empty in incident form
    ↓
Enter age manually
    ↓
(Optional: Add "Update Profile" feature later)
```

---

## 🔧 Setup Instructions

### **1. Run Database Migration**

**In Supabase SQL Editor:**
```sql
-- Copy and run: supabase/ADD_DOB_COLUMN.sql
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

ALTER TABLE public.profiles
ADD CONSTRAINT dob_range CHECK (
  date_of_birth IS NULL OR 
  (date_of_birth <= CURRENT_DATE AND 
   date_of_birth >= CURRENT_DATE - INTERVAL '120 years')
);
```

### **2. Test Signup**

1. Open app
2. Go to Sign Up
3. Enter DOB: `05/15/1990`
4. Complete signup
5. Verify in Supabase:
   - Table Editor → profiles → check `date_of_birth` column
   - Authentication → Users → check metadata

### **3. Test Incident Form**

1. Login as user with DOB
2. Create incident report
3. Check age field → should auto-fill with calculated age
4. Try editing age (should work)

---

## 📝 Examples

### **Valid DOB Formats:**
- ✅ `01/15/1990` - January 15, 1990
- ✅ `12/31/2010` - December 31, 2010
- ✅ `06/01/2000` - June 1, 2000

### **Invalid DOB Formats:**
- ❌ `1/15/1990` - Missing leading zero
- ❌ `15/01/1990` - Wrong format (DD/MM/YYYY)
- ❌ `2010-01-15` - Wrong format (YYYY-MM-DD)
- ❌ `01-15-1990` - Wrong separator

### **Age Calculation Examples:**

**Example 1:**
- DOB: `05/15/1990`
- Today: `11/04/2025`
- Age: `35` (birthday passed this year)

**Example 2:**
- DOB: `12/25/2010`
- Today: `11/04/2025`
- Age: `14` (birthday not yet this year)

**Example 3:**
- DOB: `11/04/2010`
- Today: `11/04/2025`
- Age: `15` (birthday is today!)

---

## 🧪 Testing Checklist

### **Signup Tests:**
- [ ] Valid DOB accepted
- [ ] Invalid format rejected
- [ ] Age < 13 rejected
- [ ] Future date rejected
- [ ] DOB saved to database
- [ ] DOB saved to metadata

### **Incident Form Tests:**
- [ ] Logged-in user: Age auto-fills
- [ ] Guest user: Age field empty
- [ ] Age is editable
- [ ] Age validation works (1-120)
- [ ] Calculated age is correct

### **Edge Cases:**
- [ ] Leap year birthdays (Feb 29)
- [ ] Birthday today
- [ ] Birthday tomorrow
- [ ] Birthday yesterday
- [ ] Very old user (100+ years)
- [ ] Young user (13-17 years)

---

## 🚀 Future Enhancements

### **Phase 1: Basic (Current)**
- ✅ DOB in signup
- ✅ Age auto-calculation
- ✅ Database storage

### **Phase 2: Profile Management**
- [ ] Edit Profile screen
- [ ] Update DOB
- [ ] View calculated age
- [ ] Birthday notifications

### **Phase 3: Analytics**
- [ ] Age distribution reports
- [ ] Age group analysis
- [ ] Demographics dashboard

### **Phase 4: Advanced**
- [ ] Date picker UI (instead of text input)
- [ ] Age verification (upload ID)
- [ ] Senior citizen benefits
- [ ] Minor account restrictions

---

## 📚 Technical Notes

### **Date Storage:**
- **Database:** `DATE` type (YYYY-MM-DD)
- **Metadata:** `string` (MM/DD/YYYY)
- **JavaScript:** `Date` object for calculations

### **Age Calculation Logic:**
```typescript
// Basic calculation
const age = today.getFullYear() - dob.getFullYear();

// Adjust if birthday hasn't occurred this year
const monthDiff = today.getMonth() - dob.getMonth();
const actualAge = monthDiff < 0 || 
  (monthDiff === 0 && today.getDate() < dob.getDate()) 
  ? age - 1 
  : age;
```

### **Timezone Considerations:**
- DOB stored as DATE (no timezone)
- Age calculated using local timezone
- Consistent across all users

---

## 📋 Summary

### **What Changed:**
- ❌ Removed: Age input in signup
- ✅ Added: Date of Birth input in signup
- ✅ Added: Auto age calculation in incident form
- ✅ Added: Database column for DOB
- ✅ Added: Validation for DOB format and range

### **Benefits:**
- ✅ More accurate (age auto-updates)
- ✅ More official (matches IDs)
- ✅ Better UX (auto-fill works)
- ✅ Better data (permanent, not changing)

### **Action Required:**
1. Run migration: `supabase/ADD_DOB_COLUMN.sql`
2. Test signup with DOB
3. Test incident form auto-fill
4. Done! ✅

---

**Status:** DOB Implementation Complete ✅  
**Version:** 1.0.0  
**Updated:** November 4, 2025
