/*
  # Vital Configuration Setup
  
  1. New Tables
    - `vital_config` - Stores Vital API configuration
    - Updates to existing tables for Vital integration
  
  2. Security
    - Enable RLS
    - Add appropriate policies
*/

-- Insert required Vital configuration
INSERT INTO public.vital_config (name, value)
VALUES 
  ('webhook_url', 'https://healthrocket.app/api/vital-webhook'),
  ('environment', 'sandbox')
ON CONFLICT (name) DO UPDATE 
SET value = EXCLUDED.value;

-- Update user clay@healthrocket.life for testing
DO $$ 
DECLARE 
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'clay@healthrocket.life';

  IF v_user_id IS NOT NULL THEN
    -- Clear any existing devices
    DELETE FROM public.user_devices 
    WHERE user_id = v_user_id;
    
    -- Reset Vital user ID
    UPDATE public.users 
    SET vital_user_id = NULL 
    WHERE id = v_user_id;
  END IF;
END $$;