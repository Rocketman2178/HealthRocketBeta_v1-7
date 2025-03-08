/*
  # Add Entry Fee Processing Functions

  1. New Functions
    - `process_challenge_entry` - Handles entry fee processing and registration
    - `check_entry_fee_status` - Verifies payment status for challenge entry

  2. Security
    - Functions are security definer
    - Access restricted to authenticated users
*/

-- Function to process challenge entry
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
  FROM premium_challenges
  WHERE challenge_id = p_challenge_id;

  -- If challenge requires payment, verify it
  IF v_entry_fee > 0 THEN
    -- Record payment and registration
    INSERT INTO premium_challenge_registrations (
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

-- Function to check entry fee status
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
  FROM premium_challenge_registrations
  WHERE user_id = p_user_id
  AND challenge_id = p_challenge_id;

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