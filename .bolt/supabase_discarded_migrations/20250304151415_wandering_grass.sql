/*
  # Add Health Category to Contests Table

  1. Changes
    - Add health_category column to contests table
    - Update existing contest with health category
    - Add check constraint for valid categories

  2. Security
    - Maintain existing RLS policies
*/

-- Add health_category column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contests' 
    AND column_name = 'health_category'
  ) THEN
    ALTER TABLE contests 
      ADD COLUMN health_category text,
      ADD CONSTRAINT valid_health_category CHECK (
        health_category IN ('Mindset', 'Sleep', 'Exercise', 'Nutrition', 'Biohacking')
      );
  END IF;
END $$;

-- Update existing Oura Sleep Challenge
UPDATE contests
SET health_category = 'Sleep'
WHERE challenge_id = 'tc1';

-- Create index for health category queries
CREATE INDEX IF NOT EXISTS idx_contests_health_category 
  ON contests(health_category);

-- Update get_contest_details function to include health category
CREATE OR REPLACE FUNCTION get_contest_details(p_contest_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', id,
    'challenge_id', challenge_id,
    'entry_fee', entry_fee,
    'min_players', min_players,
    'max_players', max_players,
    'start_date', start_date,
    'registration_end_date', registration_end_date,
    'prize_pool', prize_pool,
    'status', status,
    'is_free', is_free,
    'health_category', health_category,
    'created_at', created_at
  ) INTO v_result
  FROM contests
  WHERE id = p_contest_id;

  RETURN v_result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_contest_details TO authenticated;