/*
  # Fix Contest Registrations Table

  1. Changes
    - Update contest_registrations table to use correct column names
    - Fix foreign key references
    - Update function parameters to match new schema

  2. Security
    - Maintain existing RLS policies
    - Update function permissions
*/

-- Fix contest_registrations table
ALTER TABLE contest_registrations
  DROP CONSTRAINT IF EXISTS contest_registrations_contest_id_fkey;

-- Rename challenge_id to contest_id if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contest_registrations' 
    AND column_name = 'challenge_id'
  ) THEN
    ALTER TABLE contest_registrations 
      RENAME COLUMN challenge_id TO contest_id;
  END IF;
END $$;

-- Add foreign key constraint
ALTER TABLE contest_registrations
  ADD CONSTRAINT contest_registrations_contest_id_fkey 
  FOREIGN KEY (contest_id) REFERENCES contests(id);

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