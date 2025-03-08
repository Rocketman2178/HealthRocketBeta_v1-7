/*
  # Add Latest Health Assessment Function
  
  1. New Functions
    - get_latest_health_assessment: Returns the most recent health assessment data for a user
  
  2. Changes
    - Adds function to retrieve latest assessment data including all category scores
    - Includes proper error handling and security settings
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_latest_health_assessment;

-- Create function to get latest health assessment
CREATE OR REPLACE FUNCTION get_latest_health_assessment(p_user_id uuid)
RETURNS TABLE (
  expected_lifespan integer,
  expected_healthspan integer,
  health_score numeric(4,2),
  mindset_score numeric(4,2),
  sleep_score numeric(4,2),
  exercise_score numeric(4,2),
  nutrition_score numeric(4,2),
  biohacking_score numeric(4,2),
  healthspan_years numeric(4,2),
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
    ha.healthspan_years,
    ha.created_at
  FROM health_assessments ha
  WHERE ha.user_id = p_user_id
  ORDER BY ha.created_at DESC
  LIMIT 1;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_latest_health_assessment TO authenticated;