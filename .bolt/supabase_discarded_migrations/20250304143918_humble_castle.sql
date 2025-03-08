/*
  # Add Entry Fee Field to Premium Challenges

  1. New Fields
    - `entry_fee` numeric(10,2) - The cost to enter the challenge
    - `is_free` boolean - Flag for free challenges

  2. Changes
    - Add entry fee field
    - Add is_free flag
    - Update existing challenges
*/

-- Add entry fee field if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'premium_challenges' AND column_name = 'entry_fee'
  ) THEN
    ALTER TABLE premium_challenges ADD COLUMN entry_fee numeric(10,2) DEFAULT 0;
  END IF;
END $$;

-- Add is_free flag
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'premium_challenges' AND column_name = 'is_free'
  ) THEN
    ALTER TABLE premium_challenges ADD COLUMN is_free boolean DEFAULT false;
  END IF;
END $$;

-- Update existing challenges
UPDATE premium_challenges
SET is_free = (entry_fee = 0 OR entry_fee IS NULL);