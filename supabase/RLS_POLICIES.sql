-- Row Level Security Policies for iReport
-- Run these in your Supabase SQL Editor

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow users to insert their own profile during signup
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy 2: Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy 3: Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Allow admins to view all profiles (optional)
-- Uncomment if you want admins to see all profiles
-- CREATE POLICY "Admins can view all profiles"
-- ON profiles
-- FOR SELECT
-- USING (
--   EXISTS (
--     SELECT 1 FROM profiles
--     WHERE id = auth.uid()
--     AND role IN ('Admin', 'Chief')
--   )
-- );

-- ============================================
-- INCIDENTS TABLE POLICIES (for future use)
-- ============================================

-- Enable RLS on incidents table
-- ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own incidents
-- CREATE POLICY "Users can create incidents"
-- ON incidents
-- FOR INSERT
-- WITH CHECK (auth.uid() = reporter_id);

-- Allow users to view their own incidents
-- CREATE POLICY "Users can view their own incidents"
-- ON incidents
-- FOR SELECT
-- USING (auth.uid() = reporter_id);

-- Allow officers to view all incidents
-- CREATE POLICY "Officers can view all incidents"
-- ON incidents
-- FOR SELECT
-- USING (
--   EXISTS (
--     SELECT 1 FROM profiles
--     WHERE id = auth.uid()
--     AND role IN ('PNP_desk', 'PNP_field', 'PNP_chief', 'BFP_desk', 'BFP_field', 'BFP_chief', 'PDRRMO_desk', 'PDRRMO_field', 'PDRRMO_chief')
--   )
-- );
