-- Function to update user profile after signup
-- This uses SECURITY DEFINER to bypass RLS policies
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.update_user_profile_after_signup(
  user_id UUID,
  p_display_name TEXT,
  p_phone_number TEXT,
  p_age INTEGER,
  p_date_of_birth DATE
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Update the profile with the provided details
  UPDATE public.profiles
  SET 
    display_name = p_display_name,
    phone_number = p_phone_number,
    age = p_age,
    date_of_birth = p_date_of_birth
    -- updated_at removed as it may not exist in the table
  WHERE id = user_id;

  -- Check if the update actually affected any rows
  IF NOT FOUND THEN
    result := json_build_object(
      'success', false,
      'message', 'Profile not found for user_id: ' || user_id::text
    );
    RETURN result;
  END IF;

  -- Return success result
  result := json_build_object(
    'success', true,
    'message', 'Profile updated successfully'
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return error result
    result := json_build_object(
      'success', false,
      'message', SQLERRM
    );
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_user_profile_after_signup(UUID, TEXT, TEXT, INTEGER, DATE) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.update_user_profile_after_signup IS 'Updates user profile after signup, bypassing RLS policies using SECURITY DEFINER';
