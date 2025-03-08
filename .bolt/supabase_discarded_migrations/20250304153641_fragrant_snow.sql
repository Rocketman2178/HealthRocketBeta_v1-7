-- Function to get upcoming contests with duplicate prevention
CREATE OR REPLACE FUNCTION get_upcoming_contests(
  p_limit integer DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  challenge_id text,
  entry_fee numeric,
  min_players integer,
  max_players integer,
  start_date timestamptz,
  registration_end_date timestamptz,
  prize_pool numeric,
  status text,
  is_free boolean,
  health_category text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return unique contests ordered by start date
  RETURN QUERY
  WITH unique_contests AS (
    SELECT DISTINCT ON (challenge_id) *
    FROM contests
    WHERE start_date > now()
    ORDER BY challenge_id, start_date ASC
  )
  SELECT 
    id,
    challenge_id,
    entry_fee,
    min_players,
    max_players,
    start_date,
    registration_end_date,
    prize_pool,
    status,
    is_free,
    health_category
  FROM unique_contests
  ORDER BY start_date ASC
  LIMIT p_limit;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_upcoming_contests TO authenticated;