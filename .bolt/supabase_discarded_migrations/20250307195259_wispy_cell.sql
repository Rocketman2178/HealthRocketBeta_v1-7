/*
  # Remove Vital Integration Tables and Columns

  1. Changes
    - Drop vital_config table
    - Drop user_devices table
    - Drop health_metrics table
    - Drop lab_results table
    - Remove vital-related columns from users table
*/

-- Drop Vital-related tables if they exist
DROP TABLE IF EXISTS public.vital_config;
DROP TABLE IF EXISTS public.user_devices;
DROP TABLE IF EXISTS public.health_metrics;
DROP TABLE IF EXISTS public.lab_results;

-- Remove Vital-related columns from users table
DO $$ 
BEGIN
  -- Remove vital_user_id column if it exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'vital_user_id'
  ) THEN
    ALTER TABLE public.users DROP COLUMN vital_user_id;
  END IF;
END $$;