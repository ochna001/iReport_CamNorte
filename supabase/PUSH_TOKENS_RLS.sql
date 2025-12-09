-- Ensure the table exists (idempotent)
CREATE TABLE IF NOT EXISTS public.push_tokens (
    token TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT,
    platform TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Remove existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own tokens" ON public.push_tokens;
DROP POLICY IF EXISTS "Users can insert their own tokens" ON public.push_tokens;
DROP POLICY IF EXISTS "Users can delete their own tokens" ON public.push_tokens;

-- Create policies
-- 1. Allow users to view their own tokens
CREATE POLICY "Users can view their own tokens"
ON public.push_tokens
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Allow users to insert/upsert their own tokens
-- The WITH CHECK clause ensures they can only insert rows with their own user_id
CREATE POLICY "Users can insert their own tokens"
ON public.push_tokens
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Allow users to update their own tokens
CREATE POLICY "Users can update their own tokens"
ON public.push_tokens
FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Allow users to delete their own tokens
CREATE POLICY "Users can delete their own tokens"
ON public.push_tokens
FOR DELETE
USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE public.push_tokens IS 'Stores Expo push tokens for user devices';
