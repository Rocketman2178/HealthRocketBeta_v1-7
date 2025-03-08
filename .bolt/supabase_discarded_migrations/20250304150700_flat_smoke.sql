/*
  # Fix Contest Tables

  1. New Tables
    - `contests` table for contest challenges
    - `contest_registrations` table for tracking registrations
    
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
    - Grant necessary permissions

  3. Changes
    - Create tables if they don't exist
    - Add proper foreign key constraints
    - Add required indexes
*/

-- Create contests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.contests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id text NOT NULL,
  entry_fee numeric(10,2) NOT NULL DEFAULT 0,
  min_players integer NOT NULL,
  max_players integer,
  start_date timestamptz NOT NULL,
  registration_end_date timestamptz NOT NULL,
  prize_pool numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  is_free boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'failed', 'completed'))
);

-- Create contest_registrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.contest_registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id uuid REFERENCES public.contests ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  stripe_payment_id text,
  registered_at timestamptz DEFAULT now() NOT NULL,
  paid_at timestamptz,
  refunded_at timestamptz,
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  UNIQUE(contest_id, user_id)
);

-- Enable RLS
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_registrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view contests"
  ON public.contests FOR SELECT
  USING (true);

CREATE POLICY "Users can view own registrations"
  ON public.contest_registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can register for contests"
  ON public.contest_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contests_challenge_id 
  ON public.contests(challenge_id);

CREATE INDEX IF NOT EXISTS idx_contest_registrations_user 
  ON public.contest_registrations(user_id);

CREATE INDEX IF NOT EXISTS idx_contest_registrations_contest 
  ON public.contest_registrations(contest_id);

-- Update process_challenge_entry function
CREATE OR REPLACE FUNCTION process_challenge_entry(
  p_user_id uuid,
  p_contest_id uuid,
  p_payment_intent_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entry_fee numeric;
  v_challenge_id text;
  v_result jsonb;
BEGIN
  -- Get contest details
  SELECT entry_fee, challenge_id INTO v_entry_fee, v_challenge_id
  FROM contests
  WHERE id = p_contest_id;

  -- If contest requires payment, verify it
  IF v_entry_fee > 0 THEN
    -- Record payment and registration
    INSERT INTO contest_registrations (
      user_id,
      contest_id,
      payment_status,
      stripe_payment_id,
      paid_at
    ) VALUES (
      p_user_id,
      p_contest_id,
      'paid',
      p_payment_intent_id,
      now()
    );
  END IF;

  -- Start the challenge
  v_result := start_challenge(p_user_id, v_challenge_id);

  RETURN jsonb_build_object(
    'success', true,
    'challenge', v_result
  );
END;
$$;

-- Update check_entry_fee_status function
CREATE OR REPLACE FUNCTION check_entry_fee_status(
  p_user_id uuid,
  p_contest_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status jsonb;
BEGIN
  SELECT jsonb_build_object(
    'has_paid', (payment_status = 'paid'),
    'payment_id', stripe_payment_id,
    'paid_at', paid_at
  ) INTO v_status
  FROM contest_registrations
  WHERE user_id = p_user_id
  AND contest_id = p_contest_id;

  RETURN COALESCE(v_status, jsonb_build_object(
    'has_paid', false,
    'payment_id', null,
    'paid_at', null
  ));
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION process_challenge_entry TO authenticated;
GRANT EXECUTE ON FUNCTION check_entry_fee_status TO authenticated;