/*
  # Add Vital.io Environment Configuration

  1. New Tables
    - vital_config: Stores environment configuration securely
      - name (text, primary key)
      - value (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - RLS enabled
    - Only accessible via secure functions
*/

-- Create vital configuration table
CREATE TABLE IF NOT EXISTS public.vital_config (
  name text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.vital_config ENABLE ROW LEVEL SECURITY;

-- Create secure access function
CREATE OR REPLACE FUNCTION get_vital_config(config_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT value 
    FROM vital_config 
    WHERE name = config_name
  );
END;
$$;

-- Insert configuration values
INSERT INTO public.vital_config (name, value)
VALUES 
  ('vital_api_key', 'sk_us_TuRgU6jA3MA-OMBVqWlBOLKQ-NE1cOQNzWh8O5u00fY'),
  ('vital_environment', 'sandbox'),
  ('vital_webhook_secret', 'whsec_Ug7Ipf44N8+d5leHKQamzcu9GR1rtksV')
ON CONFLICT (name) 
DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();