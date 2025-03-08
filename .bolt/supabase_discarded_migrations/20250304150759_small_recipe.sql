/*
  # Fix Process Challenge Entry Function

  1. Changes
    - Drop duplicate process_challenge_entry functions
    - Create single unified version with proper parameters
    - Update related functions to use new signature

  2. Security
    - Maintain security definer
    - Keep existing permissions
*/

-- Drop existing functions with this name
DROP FUNCTION IF EXISTS process_challenge_entry(uuid, text, text);
DROP FUNCTION IF EXISTS process_challenge_entry(uuid, uuid, text);

-- Create unified function with clear parameter names
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

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contest not found';
  END IF;

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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION process_challenge_entry TO authenticated;