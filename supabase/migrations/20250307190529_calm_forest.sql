/*
  # Add Vital.io Configuration

  1. New Tables
    - `vital_config` - Stores Vital.io configuration values
    - Enables secure storage of API keys and secrets
    
  2. Security
    - RLS policies to restrict access
    - Only authenticated users can read config
    - No direct writes allowed (managed by functions)
*/

-- Create vital configuration table
CREATE TABLE IF NOT EXISTS public.vital_config (
  name text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vital_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow read access to authenticated users" 
  ON public.vital_config
  FOR SELECT 
  TO authenticated
  USING (true);

-- Insert initial configuration
INSERT INTO public.vital_config (name, value) VALUES
  ('vital_api_key', 'sk_us_TuRgU6jA3MA-OMBVqWlBOLKQ-NE1cOQNzWh8O5u00fY'),
  ('vital_environment', 'sandbox'),
  ('vital_webhook_secret', 'whsec_Ug7Ipf44N8+d5leHKQamzcu9GR1rtksV')
ON CONFLICT (name) DO UPDATE
SET 
  value = EXCLUDED.value,
  updated_at = now();