-- Function to get upcoming contests with explicit table references
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
    SELECT DISTINCT ON (c.challenge_id)
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
  SELECT 
    uc.id,
    uc.challenge_id,
    uc.entry_fee,
    uc.min_players,
    uc.max_players,
    uc.start_date,
    uc.registration_end_date,
    uc.prize_pool,
    uc.status,
    uc.is_free,
    uc.health_category
  FROM unique_contests uc
  ORDER BY uc.start_date ASC
  LIMIT p_limit;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_upcoming_contests TO authenticated;