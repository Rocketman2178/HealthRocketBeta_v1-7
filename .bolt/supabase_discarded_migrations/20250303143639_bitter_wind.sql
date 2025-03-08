/*
  # Fix Challenge Completions Constraint

  1. Changes
    - Safely removes duplicate challenge completions
    - Adds unique constraint only if it doesn't exist
    - Updates user fuel points

  2. Data Cleanup
    - Preserves earliest completion record
    - Updates related statistics
*/

DO $$ 
BEGIN
  -- Create a temporary table to store the earliest completion for each challenge
  CREATE TEMP TABLE earliest_completions AS
  SELECT DISTINCT ON (user_id, challenge_id)
    id,
    user_id,
    challenge_id,
    completed_at,
    fp_earned,
    days_to_complete,
    final_progress,
    status
  FROM completed_challenges
  WHERE challenge_id = 'tc0'
  ORDER BY user_id, challenge_id, completed_at ASC;

  -- Delete all duplicate completions while keeping the earliest one
  DELETE FROM completed_challenges
  WHERE challenge_id = 'tc0'
  AND id NOT IN (SELECT id FROM earliest_completions);

  -- Add unique constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'unique_user_challenge'
  ) THEN
    ALTER TABLE completed_challenges
    ADD CONSTRAINT unique_user_challenge 
    UNIQUE (user_id, challenge_id);
  END IF;

  -- Update user statistics to reflect correct completion count
  UPDATE users u
  SET fuel_points = (
    SELECT COALESCE(SUM(fp_earned), 0)
    FROM completed_challenges cc
    WHERE cc.user_id = u.id
  )
  WHERE id IN (
    SELECT user_id 
    FROM completed_challenges 
    WHERE challenge_id = 'tc0'
  );

  -- Drop temporary table
  DROP TABLE earliest_completions;
END $$;