# Profile Creation Setup Guide

This guide explains how to set up automatic profile creation for new users in the iReport app.

## Problem
When users sign up, their account is created in `auth.users`, but a corresponding profile entry needs to be created in the `public.profiles` table. Previously, this was done manually in the app code, which could fail due to RLS policies or network issues.

## Solution
Use a database trigger to automatically create a profile entry whenever a new user signs up.

## Setup Instructions

### Step 1: Run the Auto-Create Profile Trigger
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the contents of `AUTO_CREATE_PROFILE_TRIGGER.sql`

This will:
- Create a function `handle_new_user()` that creates a profile entry
- Create a trigger that runs after a new user is inserted into `auth.users`
- Only create profiles for non-anonymous users (guest users are excluded)

### Step 2: Verify RLS Policies
Ensure the following RLS policies exist on the `profiles` table:

```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

You should see at least these policies:
- `Users can insert their own profile` (FOR INSERT)
- `Users can view their own profile` (FOR SELECT)
- `Users can update their own profile` (FOR UPDATE)

If they don't exist, run the contents of `RLS_POLICIES.sql`.

### Step 3: Test the Setup

#### Test 1: Create a new user
```sql
-- This should automatically create a profile entry
-- Test in SQL Editor (replace with test email)
SELECT auth.uid(); -- Should return the user ID
SELECT * FROM public.profiles WHERE id = auth.uid();
```

#### Test 2: Sign up through the app
1. Open the app
2. Click "Sign Up"
3. Fill in all fields
4. Verify email with OTP
5. Check if profile was created in Supabase Dashboard

## How It Works

1. User signs up through the app
2. Supabase creates entry in `auth.users`
3. Trigger `on_auth_user_created` fires automatically
4. Function `handle_new_user()` runs and creates profile with:
   - `id`: User's auth ID
   - `email`: User's email
   - `role`: 'Resident' (default)
   - `display_name`: From user metadata or 'User'
5. App then updates the profile with additional info (phone, DOB, age)

## Troubleshooting

### Profile not being created
1. Check if trigger exists:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

2. Check function exists:
```sql
SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
```

3. Check RLS is enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';
```

### Profile creation fails with RLS error
The trigger function runs with `SECURITY DEFINER`, which means it has the permissions of the user who created it (usually the database owner). This bypasses RLS policies.

If you still get RLS errors:
1. Ensure the function is created with `SECURITY DEFINER`
2. Grant necessary permissions (see AUTO_CREATE_PROFILE_TRIGGER.sql)

### Duplicate key errors
The trigger uses `ON CONFLICT (id) DO NOTHING` to prevent duplicate entries. If you still get errors:
1. Check if profile already exists
2. The app will attempt to UPDATE instead of INSERT if profile exists

## Additional Notes

- Anonymous users (guests) do NOT get profile entries
- The trigger only creates basic profile info
- The app updates the profile with additional details after OTP verification
- If profile update fails, user can still log in and update later
