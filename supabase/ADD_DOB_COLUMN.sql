-- Migration: Add date_of_birth column to profiles table
-- Run this in Supabase SQL Editor

-- Add date_of_birth column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add constraint to ensure date is reasonable (not in future, not too old)
ALTER TABLE public.profiles
ADD CONSTRAINT dob_range CHECK (
  date_of_birth IS NULL OR 
  (date_of_birth <= CURRENT_DATE AND date_of_birth >= CURRENT_DATE - INTERVAL '120 years')
);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.date_of_birth IS 'User date of birth. Used to calculate age. Optional field.';
