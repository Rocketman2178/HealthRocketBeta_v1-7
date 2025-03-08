/*
  # Vital.io Integration Setup

  1. New Tables
    - vital_config: Store API keys and configuration
    - user_devices: Track connected health devices
    - health_metrics: Store health data from devices
    - lab_results: Store processed lab test results

  2. Security
    - RLS policies for data access
    - Authenticated user access controls
*/

-- Create vital configuration table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.vital_config (
  name text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Safely insert config values
DO $$ 
BEGIN
  -- Insert api_key if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM public.vital_config WHERE name = 'api_key') THEN
    INSERT INTO public.vital_config (name, value) 
    VALUES ('api_key', 'sk_us_TuRgU6jA3MA-OMBVqWlBOLKQ-NE1cOQNzWh8O5u00fY');
  END IF;

  -- Insert environment if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM public.vital_config WHERE name = 'environment') THEN
    INSERT INTO public.vital_config (name, value) 
    VALUES ('environment', 'sandbox');
  END IF;

  -- Insert webhook_secret if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM public.vital_config WHERE name = 'webhook_secret') THEN
    INSERT INTO public.vital_config (name, value) 
    VALUES ('webhook_secret', 'whsec_Ug7Ipf44N8+d5leHKQamzcu9GR1rtksV');
  END IF;
END $$;

-- Create user devices table
CREATE TABLE IF NOT EXISTS public.user_devices (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  vital_user_id text NOT NULL,
  provider text NOT NULL,
  connected_at timestamptz DEFAULT now(),
  last_sync_at timestamptz,
  status text DEFAULT 'active',
  metadata jsonb
);

-- Create health metrics table
CREATE TABLE IF NOT EXISTS public.health_metrics (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type text NOT NULL,
  date date NOT NULL,
  value numeric NOT NULL,
  source text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create lab results table
CREATE TABLE IF NOT EXISTS public.lab_results (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  vital_id text,
  test_type text NOT NULL,
  test_date date NOT NULL,
  results jsonb NOT NULL,
  status text DEFAULT 'processed',
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint for health metrics
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'health_metrics_user_id_date_metric_type_source_key'
  ) THEN
    ALTER TABLE public.health_metrics
      ADD CONSTRAINT health_metrics_user_id_date_metric_type_source_key 
      UNIQUE (user_id, date, metric_type, source);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.vital_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON public.vital_config;
DROP POLICY IF EXISTS "Users can view own devices" ON public.user_devices;
DROP POLICY IF EXISTS "Users can view own health metrics" ON public.health_metrics;
DROP POLICY IF EXISTS "Users can view own lab results" ON public.lab_results;

-- Create RLS policies
CREATE POLICY "Allow read access to authenticated users" 
  ON public.vital_config
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own devices" 
  ON public.user_devices
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own health metrics" 
  ON public.health_metrics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own lab results" 
  ON public.lab_results
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);