/*
  # Add Vital.io Integration Tables

  1. New Tables
    - `vital_config` - Stores Vital.io configuration settings
    - `user_devices` - Tracks connected health devices
    - `health_metrics` - Stores health data from devices
    - `lab_results` - Stores lab test results

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Handle existing policy and constraint cleanup
*/

-- Drop existing constraints if they exist
DO $$ 
BEGIN
  -- Drop health_metrics constraint if exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'health_metrics_user_id_date_metric_type_source_key'
  ) THEN
    ALTER TABLE IF EXISTS health_metrics 
    DROP CONSTRAINT IF EXISTS health_metrics_user_id_date_metric_type_source_key;
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop vital_config policies
  DROP POLICY IF EXISTS "authenticated_read_access" ON vital_config;
  DROP POLICY IF EXISTS "Allow read access to authenticated users" ON vital_config;

  -- Drop user_devices policies
  DROP POLICY IF EXISTS "users_view_own_devices" ON user_devices;
  DROP POLICY IF EXISTS "Users can view own devices" ON user_devices;

  -- Drop health_metrics policies
  DROP POLICY IF EXISTS "users_view_own_health_metrics" ON health_metrics;
  DROP POLICY IF EXISTS "Users can view own health metrics" ON health_metrics;

  -- Drop lab_results policies
  DROP POLICY IF EXISTS "users_view_own_lab_results" ON lab_results;
  DROP POLICY IF EXISTS "Users can view own lab results" ON lab_results;
END $$;

-- Vital configuration table
CREATE TABLE IF NOT EXISTS vital_config (
  name text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vital_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_access" ON vital_config
  FOR SELECT TO authenticated USING (true);

-- User devices table
CREATE TABLE IF NOT EXISTS user_devices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  vital_user_id text NOT NULL,
  provider text NOT NULL,
  connected_at timestamptz DEFAULT now(),
  last_sync_at timestamptz,
  status text DEFAULT 'active',
  metadata jsonb
);

ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_devices" ON user_devices
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Health metrics table
CREATE TABLE IF NOT EXISTS health_metrics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type text NOT NULL,
  date date NOT NULL,
  value numeric NOT NULL,
  source text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;

-- Add unique constraint to prevent duplicate metrics
ALTER TABLE health_metrics 
  ADD CONSTRAINT health_metrics_user_id_date_metric_type_source_key 
  UNIQUE (user_id, date, metric_type, source);

CREATE POLICY "users_view_own_health_metrics" ON health_metrics
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Lab results table
CREATE TABLE IF NOT EXISTS lab_results (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  vital_id text,
  test_type text NOT NULL,
  test_date date NOT NULL,
  results jsonb NOT NULL,
  status text DEFAULT 'processed',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_lab_results" ON lab_results
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Add vital_user_id column to users table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'vital_user_id'
  ) THEN
    ALTER TABLE users ADD COLUMN vital_user_id text;
  END IF;
END $$;