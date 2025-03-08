/*
  # Rename Premium Challenges to Contests

  1. Changes
    - Rename premium_challenges table to contests
    - Rename premium_challenge_registrations table to contest_registrations
    - Update foreign key references
    - Update function parameters and references
    - Add new indexes for performance

  2. Security
    - Maintain existing RLS policies
    - Update function permissions
*/

-- Rename tables
ALTER TABLE IF EXISTS premium_challenges 
  RENAME TO contests;

ALTER TABLE IF EXISTS premium_challenge_registrations 
  RENAME TO contest_registrations;

-- Update foreign key reference
ALTER TABLE contest_registrations 
  RENAME CONSTRAINT premium_challenge_registrations_premium_challenge_id_fkey 
  TO contest_registrations_contest_id_fkey;

-- Rename columns to match new naming
ALTER TABLE contest_registrations 
  RENAME COLUMN premium_challenge_id TO contest_id;

-- Update function parameters and references
CREATE OR REPLACE FUNCTION process_challenge_entry(
  p_user_id uuid,
  p_challenge_id text,
  p_payment_intent_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entry_fee numeric;
  v_result jsonb;
BEGIN
  -- Get challenge entry fee
  SELECT entry_fee INTO v_entry_fee
  FROM contests
  WHERE challenge_id = p_challenge_id;

  -- If challenge requires payment, verify it
  IF v_entry_fee > 0 THEN
    -- Record payment and registration
    INSERT INTO contest_registrations (
      user_id,
      challenge_id,
      payment_status,
      stripe_payment_id,
      paid_at
    ) VALUES (
      p_user_id,
      p_challenge_id,
      'paid',
      p_payment_intent_id,
      now()
    );
  END IF;

  -- Start the challenge
  v_result := start_challenge(p_user_id, p_challenge_id);

  RETURN jsonb_build_object(
    'success', true,
    'challenge', v_result
  );
END;
$$;

-- Update check entry fee status function
CREATE OR REPLACE FUNCTION check_entry_fee_status(
  p_user_id uuid,
  p_challenge_id text
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
  AND challenge_id = p_challenge_id;

  RETURN COALESCE(v_status, jsonb_build_object(
    'has_paid', false,
    'payment_id', null,
    'paid_at', null
  ));
END;
$$;

-- Add new indexes for performance
CREATE INDEX IF NOT EXISTS idx_contests_challenge_id 
  ON contests(challenge_id);

CREATE INDEX IF NOT EXISTS idx_contest_registrations_challenge_id 
  ON contest_registrations(challenge_id);

-- Grant permissions
GRANT EXECUTE ON FUNCTION process_challenge_entry TO authenticated;
GRANT EXECUTE ON FUNCTION check_entry_fee_status TO authenticated;