-- Update start date for Oura Sleep Challenge
UPDATE contests
SET 
  start_date = '2025-03-15 05:00:00+00',  -- 12:00 AM EST = 5:00 AM UTC
  registration_end_date = '2025-03-14 23:59:59+00'  -- 11:59 PM EST day before
WHERE challenge_id = 'tc1';

-- Create function to get upcoming contests
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
  SELECT 
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
  ORDER BY c.start_date ASC
  LIMIT p_limit;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_upcoming_contests TO authenticated;