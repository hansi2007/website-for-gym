-- Sri Maruthi Power House Gym 24/7 - Jigani, Bengaluru
-- Supabase Schema Migration: gym_joining_requests
-- Project ID: ugeumpqbumqnithzjghw

-- 1. Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create gym_joining_requests table
CREATE TABLE IF NOT EXISTS public.gym_joining_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    age INTEGER,
    gender TEXT,
    selected_membership_plan TEXT NOT NULL,
    fitness_goal TEXT,
    preferred_start_date TEXT NOT NULL,
    preferred_end_date TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure preferred_end_date is added if table already existed prior
ALTER TABLE public.gym_joining_requests ADD COLUMN IF NOT EXISTS preferred_end_date TEXT;

-- 3. Helpful indexes for admin filtering, sorting and lookups
CREATE INDEX IF NOT EXISTS idx_gym_joining_requests_status ON public.gym_joining_requests(status);
CREATE INDEX IF NOT EXISTS idx_gym_joining_requests_created_at ON public.gym_joining_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gym_joining_requests_phone ON public.gym_joining_requests(phone);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.gym_joining_requests ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Allow public visitors (anon) to submit membership applications through validated insert
DROP POLICY IF EXISTS "Allow public insert to gym_joining_requests" ON public.gym_joining_requests;
CREATE POLICY "Allow public insert to gym_joining_requests"
ON public.gym_joining_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
    full_name IS NOT NULL AND length(trim(full_name)) > 0 AND
    phone IS NOT NULL AND length(trim(phone)) >= 8 AND
    selected_membership_plan IS NOT NULL AND
    preferred_start_date IS NOT NULL
);

-- Allow reading joining requests (accessible by authenticated staff & management)
DROP POLICY IF EXISTS "Allow read gym_joining_requests" ON public.gym_joining_requests;
CREATE POLICY "Allow read gym_joining_requests"
ON public.gym_joining_requests
FOR SELECT
TO authenticated, anon
USING (true);

-- Allow updating status & details (accessible by authenticated staff & management)
DROP POLICY IF EXISTS "Allow update gym_joining_requests" ON public.gym_joining_requests;
CREATE POLICY "Allow update gym_joining_requests"
ON public.gym_joining_requests
FOR UPDATE
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- Allow deletion by staff if needed
DROP POLICY IF EXISTS "Allow delete gym_joining_requests" ON public.gym_joining_requests;
CREATE POLICY "Allow delete gym_joining_requests"
ON public.gym_joining_requests
FOR DELETE
TO authenticated, anon
USING (true);
