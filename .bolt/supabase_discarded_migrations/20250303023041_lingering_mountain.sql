/*
  # Add Health Assessment History Support

  1. New Functions
    - get_previous_health_assessment: Retrieves latest assessment for comparison
    - get_assessment_history: Gets full assessment history for a user

  2. Security
    - Functions are security definer
    - Access restricted to authenticated users
*/

-- Function to get previous health assessment
CREATE OR REPLACE FUNCTION get_previous_health_assessment(p_user_id uuid)
RETURNS TABLE (
  expected_lifespan integer,
  expected_healthspan integer,
  health_score numeric(4,2),
  mindset_score numeric(4,2),
  sleep_score numeric(4,2),
  exercise_score numeric(4,2),
  nutrition_score numeric(4,2),
  biohacking_score numeric(4,2),
  created_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ha.expected_lifespan,
    ha.expected_healthspan,
    ha.health_score,
    ha.mindset_score,
    ha.sleep_score,
    ha.exercise_score,
    ha.nutrition_score,
    ha.biohacking_score,
    ha.created_at
  FROM health_assessments ha
  WHERE ha.user_id = p_user_id
  ORDER BY ha.created_at DESC
  LIMIT 1;
END;
$$;

-- Function to get full assessment history
CREATE OR REPLACE FUNCTION get_assessment_history(p_user_id uuid)
RETURNS TABLE (
  expected_lifespan integer,
  expected_healthspan integer,
  health_score numeric(4,2),
  mindset_score numeric(4,2),
  sleep_score numeric(4,2),
  exercise_score numeric(4,2),
  nutrition_score numeric(4,2),
  biohacking_score numeric(4,2),
  created_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ha.expected_lifespan,
    ha.expected_healthspan,
    ha.health_score,
    ha.mindset_score,
    ha.sleep_score,
    ha.exercise_score,
    ha.nutrition_score,
    ha.biohacking_score,
    ha.created_at
  FROM health_assessments ha
  WHERE ha.user_id = p_user_id
  ORDER BY ha.created_at DESC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_previous_health_assessment TO authenticated;
GRANT EXECUTE ON FUNCTION get_assessment_history TO authenticated;