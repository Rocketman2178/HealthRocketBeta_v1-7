/*
  # Add Vital.io Integration

  1. New Tables
    - vital_config: Stores Vital API configuration
    - user_devices: Tracks connected Vital devices
    - health_metrics: Stores health data from Vital
    - lab_results: Stores lab test results from Vital

  2. Changes
    - Add vital_user_id to users table
    
  3. Security
    - Enable RLS on all tables
    - Add policies for data access
*/

-- Create vital_config table
CREATE TABLE IF NOT EXISTS public.vital_config (
  name text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vital_config ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
DROP POLICY IF EXISTS "authenticated_read_access" ON public.vital_config;
CREATE POLICY "authenticated_read_access" 
  ON public.vital_config
  FOR SELECT TO authenticated
  USING (true);

-- Create user_devices table
CREATE TABLE IF NOT EXISTS public.user_devices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  vital_user_id text NOT NULL,
  provider text NOT NULL,
  connected_at timestamptz DEFAULT now(),
  last_sync_at timestamptz,
  status text DEFAULT 'active',
  metadata jsonb
);

-- Enable RLS
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

-- Create policy for user devices
DROP POLICY IF EXISTS "users_view_own_devices" ON public.user_devices;
CREATE POLICY "users_view_own_devices"
  ON public.user_devices
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Create health_metrics table
CREATE TABLE IF NOT EXISTS public.health_metrics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  metric_type text NOT NULL,
  date date NOT NULL,
  value numeric NOT NULL,
  source text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint
ALTER TABLE public.health_metrics
  DROP CONSTRAINT IF EXISTS health_metrics_user_id_date_metric_type_source_key;
ALTER TABLE public.health_metrics
  ADD CONSTRAINT health_metrics_user_id_date_metric_type_source_key 
  UNIQUE (user_id, date, metric_type, source);

-- Enable RLS
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy for health metrics
DROP POLICY IF EXISTS "users_view_own_health_metrics" ON public.health_metrics;
CREATE POLICY "users_view_own_health_metrics"
  ON public.health_metrics
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Create lab_results table
CREATE TABLE IF NOT EXISTS public.lab_results (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  vital_id text,
  test_type text NOT NULL,
  test_date date NOT NULL,
  results jsonb NOT NULL,
  status text DEFAULT 'processed',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;

-- Create policy for lab results
DROP POLICY IF EXISTS "users_view_own_lab_results" ON public.lab_results;
CREATE POLICY "users_view_own_lab_results"
  ON public.lab_results
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Add vital_user_id to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'users' 
    AND column_name = 'vital_user_id'
  ) THEN
    ALTER TABLE public.users ADD COLUMN vital_user_id text;
  END IF;
END $$;