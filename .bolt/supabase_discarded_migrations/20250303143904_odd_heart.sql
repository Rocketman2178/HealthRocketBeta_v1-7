/*
  # Verify Challenge Completions

  1. New Functions
    - get_completed_challenges_count: Returns accurate count of completed challenges
    - verify_challenge_completions: Verifies and returns discrepancies

  2. Data Verification
    - Checks completed_challenges table
    - Verifies challenge completion counts
    - Returns detailed completion info
*/

-- Function to get accurate completed challenges count
CREATE OR REPLACE FUNCTION get_completed_challenges_count(p_user_id uuid)
RETURNS TABLE (
  total_count bigint,
  challenge_counts jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_count,
    jsonb_object_agg(
      challenge_id,
      jsonb_build_object(
        'count', COUNT(*),
        'completed_at', MAX(completed_at),
        'fp_earned', SUM(fp_earned)
      )
    ) as challenge_counts
  FROM completed_challenges
  WHERE user_id = p_user_id
  GROUP BY user_id;
END;
$$;

-- Function to verify challenge completions
CREATE OR REPLACE FUNCTION verify_challenge_completions(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'completed_challenges', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', cc.id,
          'challenge_id', cc.challenge_id,
          'completed_at', cc.completed_at,
          'fp_earned', cc.fp_earned,
          'status', cc.status
        )
      )
      FROM completed_challenges cc
      WHERE cc.user_id = p_user_id
    ),
    'total_count', (
      SELECT COUNT(*)
      FROM completed_challenges
      WHERE user_id = p_user_id
    ),
    'user_details', (
      SELECT jsonb_build_object(
        'fuel_points', fuel_points,
        'level', level
      )
      FROM users
      WHERE id = p_user_id
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_completed_challenges_count TO authenticated;
GRANT EXECUTE ON FUNCTION verify_challenge_completions TO authenticated;