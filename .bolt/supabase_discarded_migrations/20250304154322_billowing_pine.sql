-- Drop existing contest data
DELETE FROM contests WHERE challenge_id = 'tc1';

-- Insert single Oura Sleep Challenge with correct data
INSERT INTO contests (
  challenge_id,
  entry_fee,
  min_players,
  max_players,
  start_date,
  registration_end_date,
  prize_pool,
  status,
  health_category,
  is_free
) VALUES (
  'tc1',
  75.00,
  8,
  null,
  '2025-03-15 05:00:00+00',  -- 12:00 AM EST = 5:00 AM UTC
  '2025-03-14 23:59:59+00',  -- 11:59 PM EST day before
  0.00,
  'pending',
  'Sleep',
  false
);