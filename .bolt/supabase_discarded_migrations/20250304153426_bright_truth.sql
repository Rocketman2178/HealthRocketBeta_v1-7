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
  RETURN QUERY
  WITH unique_contests AS (
    SELECT DISTINCT ON (challenge_id)
      c.id,
      c.challenge_id,
      c.entry_fee,
      c.min_players,
      c.max_players,
      c.start_date,
      c.registration_end_date,
      c.prize_pool,
      c.status,
      c.is_free,
      c.health_category
    FROM contests c
    WHERE c.start_date > now()
    ORDER BY c.challenge_id, c.start_date ASC
  )
  SELECT *
  FROM unique_contests
  ORDER BY start_date ASC
  LIMIT p_limit;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_upcoming_contests TO authenticated;