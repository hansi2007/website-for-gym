import { createClient } from '@supabase/supabase-js';
import { GymJoiningRequest, JoiningRequestStatus } from '../types';

export const SUPABASE_PROJECT_ID = 'ugeumpqbumqnithzjghw';
export const SUPABASE_URL = 'https://ugeumpqbumqnithzjghw.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_Aq_TpH-65usRdAYDah7CgA_vXFFiEmj';

// Initialize Supabase client with the provided project credentials
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface NewJoiningRequestInput {
  full_name: string;
  phone: string;
  email?: string | null;
  age?: number | null;
  gender?: string | null;
  selected_membership_plan: string;
  fitness_goal?: string | null;
  preferred_start_date: string;
  preferred_end_date?: string | null;
  message?: string | null;
}

/**
 * Inserts a new gym joining application into the Supabase gym_joining_requests table.
 * Returns the confirmed inserted record or throws a descriptive error.
 */
export async function submitGymJoiningRequest(
  input: NewJoiningRequestInput
): Promise<GymJoiningRequest> {
  const payload: Record<string, unknown> = {
    full_name: input.full_name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || null,
    age: input.age ? Number(input.age) : null,
    gender: input.gender || null,
    selected_membership_plan: input.selected_membership_plan.trim(),
    fitness_goal: input.fitness_goal?.trim() || null,
    preferred_start_date: input.preferred_start_date,
    message: input.message?.trim() || null,
    status: 'pending',
  };

  if (input.preferred_end_date) {
    payload.preferred_end_date = input.preferred_end_date;
  }

  let { data, error } = await supabase
    .from('gym_joining_requests')
    .insert([payload])
    .select()
    .single();

  // If error is 42703 (preferred_end_date column does not exist yet), retry without preferred_end_date
  if (error && (error.code === '42703' || error.message?.includes('preferred_end_date'))) {
    console.warn("Table gym_joining_requests doesn't have preferred_end_date column yet. Retrying without it...");
    delete payload.preferred_end_date;
    const retry = await supabase
      .from('gym_joining_requests')
      .insert([payload])
      .select()
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error('Supabase insert error:', error);
    if (error.code === 'PGRST205' || error.message?.includes('not find the table')) {
      throw new Error(
        `Database table 'gym_joining_requests' does not exist in Supabase yet. Please run the SQL migration script from the Admin Dashboard or Supabase SQL Editor.`
      );
    }
    throw new Error(error.message || 'Failed to submit application to Supabase database.');
  }

  if (!data) {
    throw new Error('Supabase did not return the saved record confirmation.');
  }

  return data as GymJoiningRequest;
}

/**
 * Fetches all joining requests from Supabase, sorted by newest first.
 */
export async function fetchGymJoiningRequests(): Promise<{
  data: GymJoiningRequest[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('gym_joining_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Supabase fetch error:', error);
    return {
      data: [],
      error:
        error.code === 'PGRST205'
          ? "Table 'gym_joining_requests' not found in Supabase. Please execute the SQL migration in Supabase SQL Editor."
          : error.message,
    };
  }

  return { data: (data as GymJoiningRequest[]) || [], error: null };
}

/**
 * Updates the application status in Supabase.
 */
export async function updateJoiningRequestStatus(
  id: string,
  status: JoiningRequestStatus
): Promise<void> {
  const { error } = await supabase
    .from('gym_joining_requests')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Supabase update status error:', error);
    throw new Error(error.message || 'Failed to update application status.');
  }
}

/**
 * Deletes a joining request from Supabase.
 */
export async function deleteGymJoiningRequest(id: string): Promise<void> {
  const { error } = await supabase
    .from('gym_joining_requests')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase delete error:', error);
    throw new Error(error.message || 'Failed to delete application.');
  }
}

/**
 * Tests connection to the Supabase endpoint.
 */
export async function checkSupabaseHealth(): Promise<{
  connected: boolean;
  tableFound: boolean;
  message: string;
}> {
  try {
    const { data, error } = await supabase
      .from('gym_joining_requests')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('not find the table')) {
        return {
          connected: true,
          tableFound: false,
          message:
            "Connected to Supabase project 'ugeumpqbumqnithzjghw', but table 'gym_joining_requests' has not been created yet.",
        };
      }
      return {
        connected: false,
        tableFound: false,
        message: error.message,
      };
    }

    return {
      connected: true,
      tableFound: true,
      message: "Connected to Supabase. Table 'gym_joining_requests' is active and ready.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      tableFound: false,
      message: msg,
    };
  }
}

export const SQL_ADD_END_DATE_SCRIPT = `-- Quick Fix: Add preferred_end_date to existing gym_joining_requests table
ALTER TABLE public.gym_joining_requests 
ADD COLUMN IF NOT EXISTS preferred_end_date TEXT;`;

export const SQL_MIGRATION_SCRIPT = `-- Sri Maruthi Power House Gym 24/7 (Jigani, Bengaluru)
-- Supabase Migration: gym_joining_requests
-- Project ID: ugeumpqbumqnithzjghw

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

-- Ensure preferred_end_date exists even if table was already created
ALTER TABLE public.gym_joining_requests ADD COLUMN IF NOT EXISTS preferred_end_date TEXT;

CREATE INDEX IF NOT EXISTS idx_gym_joining_requests_status ON public.gym_joining_requests(status);
CREATE INDEX IF NOT EXISTS idx_gym_joining_requests_created_at ON public.gym_joining_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gym_joining_requests_phone ON public.gym_joining_requests(phone);

ALTER TABLE public.gym_joining_requests ENABLE ROW LEVEL SECURITY;

-- Note: DROP POLICY IF EXISTS is required before CREATE POLICY to prevent Error 42710
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

DROP POLICY IF EXISTS "Allow read gym_joining_requests" ON public.gym_joining_requests;
CREATE POLICY "Allow read gym_joining_requests"
ON public.gym_joining_requests
FOR SELECT
TO authenticated, anon
USING (true);

DROP POLICY IF EXISTS "Allow update gym_joining_requests" ON public.gym_joining_requests;
CREATE POLICY "Allow update gym_joining_requests"
ON public.gym_joining_requests
FOR UPDATE
TO authenticated, anon
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete gym_joining_requests" ON public.gym_joining_requests;
CREATE POLICY "Allow delete gym_joining_requests"
ON public.gym_joining_requests
FOR DELETE
TO authenticated, anon
USING (true);`;
