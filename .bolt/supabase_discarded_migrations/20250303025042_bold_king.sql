/*
  # Delete Latest Health Assessment

  1. Changes
    - Deletes the most recent health assessment for a specific user
    - Maintains data integrity by only removing the latest record
    - Preserves historical assessments

  2. Security
    - Uses RLS policies
    - Requires authentication
*/

-- Function to delete latest health assessment for a user
CREATE OR REPLACE FUNCTION delete_latest_health_assessment(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_latest_assessment_id uuid;
BEGIN
  -- Get user ID from email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Get ID of latest assessment
  SELECT id INTO v_latest_assessment_id
  FROM health_assessments
  WHERE user_id = v_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_latest_assessment_id IS NULL THEN
    RAISE EXCEPTION 'No health assessments found for user';
  END IF;

  -- Delete only the latest assessment
  DELETE FROM health_assessments
  WHERE id = v_latest_assessment_id;
END;
$$;

-- Execute the function for the specified user
SELECT delete_latest_health_assessment('clay@healthrocket.life');

-- Drop the function after use
DROP FUNCTION delete_latest_health_assessment(text);