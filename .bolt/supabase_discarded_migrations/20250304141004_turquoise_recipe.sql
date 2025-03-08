/*
  # Add Challenge Reset Function
  
  1. New Functions
    - `reset_challenge_data`: Clears verification posts and boost counts when restarting a challenge
    
  2. Security
    - Function is security definer to ensure proper access control
    - Only accessible to authenticated users
*/

-- Function to reset challenge data when restarting
CREATE OR REPLACE FUNCTION reset_challenge_data(
  p_user_id uuid,
  p_challenge_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete verification posts from chat messages
  DELETE FROM chat_messages
  WHERE user_id = p_user_id 
  AND chat_id = 'c_' || p_challenge_id
  AND is_verification = true;

  -- Reset boost count and last boost date in challenges table
  UPDATE challenges
  SET boost_count = 0,
      last_daily_boost_completed_date = NULL
  WHERE user_id = p_user_id
  AND challenge_id = p_challenge_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION reset_challenge_data TO authenticated;

-- Update the start_challenge function to use reset_challenge_data
CREATE OR REPLACE FUNCTION start_challenge(
  p_user_id uuid,
  p_challenge_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Clear any existing verification data
  PERFORM reset_challenge_data(p_user_id, p_challenge_id);

  -- Insert new challenge
  INSERT INTO challenges (
    user_id,
    challenge_id,
    status,
    progress,
    started_at,
    boost_count,
    verification_count
  )
  VALUES (
    p_user_id,
    p_challenge_id,
    'active',
    0,
    now(),
    0,
    0
  )
  RETURNING jsonb_build_object(
    'id', id,
    'challenge_id', challenge_id,
    'status', status,
    'started_at', started_at
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION start_challenge TO authenticated;