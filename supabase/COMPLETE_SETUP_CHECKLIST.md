# Complete Supabase Setup Checklist

Use this checklist to ensure everything is configured correctly.

## ✅ Step 1: Fix Profile Creation (CRITICAL)

Go to **SQL Editor** and run this:

```sql
-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create INSERT policy (allows users to create their profile)
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Create SELECT policy (allows users to read their profile)
CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create UPDATE policy (allows users to update their profile)
CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

**Test:** Try signing up - profile creation should now work!

---

## ✅ Step 2: Enable Email Confirmations

1. Go to **Authentication** → **Providers**
2. Click on **Email**
3. Settings:
   - ✅ **Enable Email provider** - ON
   - ✅ **Confirm email** - ON
   - ✅ **Secure email change** - ON (optional)

---

## ✅ Step 3: Configure OTP Email Template

1. Go to **Authentication** → **Email Templates**
2. Select **Confirm signup**
3. Replace the content with:

```html
<h2>Verify Your Email - iReport</h2>
<p>Welcome to iReport Camarines Norte!</p>
<p>Your verification code is:</p>
<h1 style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a73e8; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px;">{{ .Token }}</h1>
<p style="color: #666;">This code will expire in 60 minutes.</p>
<p style="color: #666;">If you didn't request this code, please ignore this email.</p>
<br>
<p>Thank you,<br>The iReport Team</p>
```

4. Click **Save**

---

## ✅ Step 4: Verify Auth Settings

1. Go to **Authentication** → **Settings**
2. Under **Auth Settings**:
   - **Site URL**: `exp://localhost:8081` (for development)
   - **Email OTP expiry**: 3600 seconds (60 minutes)
   - **Mailer autoconfirm**: OFF (we want manual verification)

---

## ✅ Step 5: Test the Complete Flow

### Test Signup:
1. Open your app
2. Click "Create Account"
3. Fill in all fields
4. Click "Sign Up"
5. **Expected:** Alert "Verification Required"
6. **Expected:** Email with 6-digit code arrives

### Test OTP Verification:
1. Navigate to OTP screen
2. Enter the 6-digit code from email
3. Click "Verify Account"
4. **Expected:** Success message
5. **Expected:** Redirected to Login screen

### Test Login:
1. Enter your email and password
2. Click "Sign In"
3. **Expected:** Navigate to home screen

---

## 🐛 Troubleshooting

### Issue: "Profile creation failed"
**Solution:** Run the SQL from Step 1 above

### Issue: "Not receiving OTP emails"
**Check:**
- Spam/junk folder
- Authentication → Logs (see if email was sent)
- Email provider settings

### Issue: "Invalid OTP code"
**Check:**
- Code hasn't expired (60 min limit)
- Typing correct digits
- No extra spaces

### Issue: "Can't login after verification"
**Check:**
- Did you verify the email?
- Check Authentication → Users (user should show as confirmed)

---

## 📊 Verify Everything is Working

Run these SQL queries to check:

### Check if policies exist:
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```
**Expected:** 3 policies (INSERT, SELECT, UPDATE)

### Check if RLS is enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';
```
**Expected:** rowsecurity = true

### Check profiles table structure:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

### Check if users are being created:
```sql
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## ✅ Final Checklist

Before testing, make sure:

- [ ] RLS policies created (Step 1)
- [ ] Email confirmations enabled (Step 2)
- [ ] Email template updated (Step 3)
- [ ] Auth settings verified (Step 4)
- [ ] App is running (`npm start`)
- [ ] Using a real email address for testing

---

## 🎯 Expected Result

After completing all steps:

1. ✅ User can sign up
2. ✅ Profile is created in database
3. ✅ OTP email is sent
4. ✅ User can verify with OTP code
5. ✅ User can login after verification
6. ✅ Session persists across app restarts

---

**Status:** Follow each step in order. Test after each step to isolate any issues.
