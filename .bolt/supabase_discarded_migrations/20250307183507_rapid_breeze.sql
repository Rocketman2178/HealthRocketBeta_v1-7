/*
  # Premium Challenge System

  1. New Tables
    - `premium_challenges`
      - Core challenge configuration and status
      - Tracks entry fees, player limits, dates, and prize pool
    - `premium_challenge_registrations`
      - Player registrations and payment status
      - Links users to challenges with payment tracking

  2. Security
    - Enable RLS on both tables
    - Add policies for viewing and registration
    - Secure payment status management

  3. Functions
    - Prize distribution calculator
    - Handles dynamic prize pool allocation
*/

-- Create premium challenges table
CREATE TABLE IF NOT EXISTS public.premium_challenges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id text NOT NULL,
  entry_fee numeric(10,2) NOT NULL,
  min_players integer NOT NULL,
  max_players integer,
  start_date timestamptz NOT NULL,
  registration_end_date timestamptz NOT NULL,
  prize_pool numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'failed', 'completed'))
);

-- Create premium challenge registrations table
CREATE TABLE IF NOT EXISTS public.premium_challenge_registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  premium_challenge_id uuid REFERENCES public.premium_challenges ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users ON DELETE CASCADE NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  stripe_payment_id text,
  registered_at timestamptz DEFAULT now() NOT NULL,
  paid_at timestamptz,
  refunded_at timestamptz,
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  UNIQUE(premium_challenge_id, user_id)
);

-- Enable RLS
ALTER TABLE public.premium_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_challenge_registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can view premium challenges" ON public.premium_challenges;
  DROP POLICY IF EXISTS "Users can view own registrations" ON public.premium_challenge_registrations;
  DROP POLICY IF EXISTS "Users can register for challenges" ON public.premium_challenge_registrations;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- RLS Policies
CREATE POLICY "Anyone can view premium challenges"
  ON public.premium_challenges FOR SELECT
  USING (true);

CREATE POLICY "Users can view own registrations"
  ON public.premium_challenge_registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can register for challenges"
  ON public.premium_challenge_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_premium_challenge_start_date 
  ON public.premium_challenges(start_date);
  
CREATE INDEX IF NOT EXISTS idx_premium_challenge_registrations_user 
  ON public.premium_challenge_registrations(user_id);

-- Functions
CREATE OR REPLACE FUNCTION calculate_prize_distribution(
  p_challenge_id uuid,
  p_total_players integer
)
RETURNS TABLE (
  rank integer,
  prize_amount numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prize_pool numeric;
  v_top_10_count integer;
  v_top_50_count integer;
BEGIN
  -- Get prize pool
  SELECT prize_pool INTO v_prize_pool
  FROM premium_challenges
  WHERE id = p_challenge_id;
  
  -- Calculate counts
  v_top_10_count := greatest(1, floor(p_total_players * 0.1));
  v_top_50_count := greatest(1, floor(p_total_players * 0.5)) - v_top_10_count;
  
  -- Return prize distribution
  RETURN QUERY
  SELECT 
    r.rank,
    CASE
      WHEN r.rank <= v_top_10_count THEN 
        round((v_prize_pool * 0.75) / v_top_10_count, 2)
      WHEN r.rank <= (v_top_10_count + v_top_50_count) THEN
        75.00 -- Entry fee returned
      ELSE 0.00
    END as prize_amount
  FROM generate_series(1, p_total_players) as r(rank);
END;
$$;

-- Insert Oura Sleep Challenge
INSERT INTO public.premium_challenges (
  challenge_id,
  entry_fee,
  min_players,
  max_players,
  start_date,
  registration_end_date,
  prize_pool,
  status
) VALUES (
  'tc1',
  75.00,
  8,
  null,
  '2025-02-14 00:00:00+00',
  '2025-02-13 23:59:59+00',
  0.00, -- Will be calculated based on registrations
  'pending'
);