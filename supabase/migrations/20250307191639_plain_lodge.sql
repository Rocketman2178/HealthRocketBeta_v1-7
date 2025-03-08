/*
  # Vital.io Integration Setup

  1. Tables
    - `vital_config` - Configuration storage for API keys and settings
    - `user_devices` - Track connected health devices
    - `health_metrics` - Store health data from devices
    - `lab_results` - Store processed lab test results
    
  2. Security
    - RLS policies for data access
    - Authenticated user access controls
*/

-- Check if vital_config exists and create if not
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'vital_config') THEN
    CREATE TABLE public.vital_config (
      name text PRIMARY KEY,
      value text NOT NULL,
      created_at timestamptz DEFAULT now() NOT NULL,
      updated_at timestamptz DEFAULT now() NOT NULL
    );

    -- Insert initial configuration values if table was just created
    INSERT INTO public.vital_config (name, value) VALUES
      ('api_key', 'sk_us_TuRgU6jA3MA-OMBVqWlBOLKQ-NE1cOQNzWh8O5u00fY'),
      ('environment', 'sandbox'),
      ('webhook_secret', 'whsec_Ug7Ipf44N8+d5leHKQamzcu9GR1rtksV');
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

-- Add unique constraint for health metrics if it doesn't exist
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
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow read access to authenticated users" ON public.vital_config;
  DROP POLICY IF EXISTS "Users can view own devices" ON public.user_devices;
  DROP POLICY IF EXISTS "Users can view own health metrics" ON public.health_metrics;
  DROP POLICY IF EXISTS "Users can view own lab results" ON public.lab_results;
END $$;

-- Create RLS policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'vital_config' AND policyname = 'Allow read access to authenticated users'
  ) THEN
    CREATE POLICY "Allow read access to authenticated users" 
      ON public.vital_config
      FOR SELECT 
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_devices' AND policyname = 'Users can view own devices'
  ) THEN
    CREATE POLICY "Users can view own devices" 
      ON public.user_devices
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'health_metrics' AND policyname = 'Users can view own health metrics'
  ) THEN
    CREATE POLICY "Users can view own health metrics" 
      ON public.health_metrics
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'lab_results' AND policyname = 'Users can view own lab results'
  ) THEN
    CREATE POLICY "Users can view own lab results" 
      ON public.lab_results
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;