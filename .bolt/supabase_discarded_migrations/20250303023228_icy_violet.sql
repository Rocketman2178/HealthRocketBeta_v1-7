/*
  # Fix Assessment History Functions

  1. Changes
    - Drop existing functions
    - Recreate with correct return types
    - Update permissions

  2. Security
    - Functions remain security definer
    - Access restricted to authenticated users
*/

-- Drop existing functions
DROP FUNCTION IF EXISTS get_previous_health_assessment(uuid);
DROP FUNCTION IF EXISTS get_assessment_history(uuid);

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
  created_at timestamptz,
  previous_healthspan integer
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
    ha.created_at,
    ha.previous_healthspan
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
  created_at timestamptz,
  previous_healthspan integer
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
    ha.created_at,
    ha.previous_healthspan
  FROM health_assessments ha
  WHERE ha.user_id = p_user_id
  ORDER BY ha.created_at DESC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_previous_health_assessment TO authenticated;
GRANT EXECUTE ON FUNCTION get_assessment_history TO authenticated;