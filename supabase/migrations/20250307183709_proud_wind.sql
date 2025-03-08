/*
  # Contest System

  1. New Tables
    - `contests`
      - Core contest configuration and status
      - Tracks entry fees, player limits, dates, and prize pool
      - Includes health category tracking
    - `contest_registrations`
      - Player registrations and payment status
      - Links users to contests with payment tracking

  2. Security
    - Enable RLS on both tables
    - Add policies for viewing and registration
    - Secure payment status management

  3. Indexes
    - Optimized queries for contest lookup and registration tracking
*/

-- Create contests table
CREATE TABLE IF NOT EXISTS public.contests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id text NOT NULL,
  entry_fee numeric(10,2) DEFAULT 0 NOT NULL,
  min_players integer NOT NULL,
  max_players integer,
  start_date timestamptz NOT NULL,
  registration_end_date timestamptz NOT NULL,
  prize_pool numeric(10,2) DEFAULT 0 NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  is_free boolean DEFAULT false NOT NULL,
  health_category text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'failed', 'completed')),
  CONSTRAINT valid_health_category CHECK (health_category IN ('Mindset', 'Sleep', 'Exercise', 'Nutrition', 'Biohacking'))
);

-- Create contest registrations table
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

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can view contests" ON public.contests;
  DROP POLICY IF EXISTS "Users can view own registrations" ON public.contest_registrations;
  DROP POLICY IF EXISTS "Users can register for contests" ON public.contest_registrations;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- RLS Policies
CREATE POLICY "Anyone can view contests"
  ON public.contests FOR SELECT
  USING (true);

CREATE POLICY "Users can view own registrations"
  ON public.contest_registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can register for contests"
  ON public.contest_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contests_challenge_id 
  ON public.contests(challenge_id);

CREATE INDEX IF NOT EXISTS idx_contests_health_category 
  ON public.contests(health_category);

CREATE INDEX IF NOT EXISTS idx_contest_registrations_contest 
  ON public.contest_registrations(contest_id);

CREATE INDEX IF NOT EXISTS idx_contest_registrations_user 
  ON public.contest_registrations(user_id);

-- Insert Oura Sleep Challenge
INSERT INTO public.contests (
  challenge_id,
  entry_fee,
  min_players,
  max_players,
  start_date,
  registration_end_date,
  prize_pool,
  status,
  is_free,
  health_category
) VALUES (
  'tc1',
  75.00,
  8,
  null,
  '2025-02-14 00:00:00+00',
  '2025-02-13 23:59:59+00',
  0.00, -- Will be calculated based on registrations
  'pending',
  false,
  'Sleep'
);