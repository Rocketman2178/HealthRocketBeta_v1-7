/*
  # Update Healthspan Years Calculation

  1. Changes
    - Modifies update_health_assessment function to correctly calculate healthspan years
    - Adds previous_healthspan tracking
    - Updates healthspan_years calculation to be the difference between current and initial healthspan

  2. Security
    - Maintains existing RLS policies
    - Requires authentication
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_health_assessment;

-- Create updated function with correct healthspan calculation
CREATE OR REPLACE FUNCTION update_health_assessment(
  p_user_id uuid,
  p_expected_lifespan integer,
  p_expected_healthspan integer,
  p_health_score numeric,
  p_mindset_score numeric,
  p_sleep_score numeric,
  p_exercise_score numeric,
  p_nutrition_score numeric,
  p_biohacking_score numeric,
  p_created_at timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_assessment_date timestamptz;
  v_initial_healthspan integer;
  v_healthspan_years numeric;
  v_fp_reward integer;
  v_next_level_points integer;
BEGIN
  -- Get date of last assessment
  SELECT created_at INTO v_last_assessment_date
  FROM health_assessments
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- Check if 30 days have passed since last assessment
  IF v_last_assessment_date IS NOT NULL AND 
     p_created_at < v_last_assessment_date + interval '30 days' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Must wait 30 days between health assessments'
    );
  END IF;

  -- Get initial healthspan from first assessment or use current as initial
  SELECT COALESCE(
    (SELECT expected_healthspan 
     FROM health_assessments 
     WHERE user_id = p_user_id 
     ORDER BY created_at ASC 
     LIMIT 1),
    p_expected_healthspan
  ) INTO v_initial_healthspan;

  -- Calculate healthspan years gained (current - initial)
  v_healthspan_years := p_expected_healthspan - v_initial_healthspan;

  -- Calculate FP reward (10% of next level requirement)
  SELECT calculate_next_level_points(level) INTO v_next_level_points
  FROM users WHERE id = p_user_id;
  
  v_fp_reward := GREATEST(1, floor(v_next_level_points * 0.1));

  -- Insert new assessment
  INSERT INTO health_assessments (
    user_id,
    expected_lifespan,
    expected_healthspan,
    previous_healthspan,
    health_score,
    healthspan_years,
    mindset_score,
    sleep_score,
    exercise_score,
    nutrition_score,
    biohacking_score,
    created_at
  ) VALUES (
    p_user_id,
    p_expected_lifespan,
    p_expected_healthspan,
    v_initial_healthspan,
    p_health_score,
    v_healthspan_years,
    p_mindset_score,
    p_sleep_score,
    p_exercise_score,
    p_nutrition_score,
    p_biohacking_score,
    p_created_at
  );

  -- Update user profile
  UPDATE users
  SET 
    health_score = p_health_score,
    healthspan_years = v_healthspan_years,
    fuel_points = fuel_points + v_fp_reward
  WHERE id = p_user_id;

  -- Return success response
  RETURN jsonb_build_object(
    'success', true,
    'healthspan_years', v_healthspan_years,
    'fp_reward', v_fp_reward
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_health_assessment TO authenticated;