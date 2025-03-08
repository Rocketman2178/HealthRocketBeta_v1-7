-- Create challenge library table
CREATE TABLE IF NOT EXISTS public.challenge_library (
    id text PRIMARY KEY,
    name text NOT NULL,
    category text NOT NULL,
    tier integer NOT NULL CHECK (tier IN (0, 1, 2)),
    duration integer NOT NULL DEFAULT 21,
    description text NOT NULL,
    expert_reference text,
    learning_objectives text[] NOT NULL DEFAULT '{}',
    requirements jsonb NOT NULL DEFAULT '[]',
    implementation_protocol jsonb,
    verification_method jsonb,
    success_metrics text[] NOT NULL DEFAULT '{}',
    expert_tips text[] NOT NULL DEFAULT '{}',
    fuel_points integer NOT NULL DEFAULT 50,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    version integer DEFAULT 1,
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Create quest library table
CREATE TABLE IF NOT EXISTS public.quest_library (
    id text PRIMARY KEY,
    name text NOT NULL,
    category text NOT NULL,
    tier integer NOT NULL CHECK (tier IN (1, 2)),
    duration integer NOT NULL DEFAULT 90,
    description text NOT NULL,
    expert_ids text[] NOT NULL DEFAULT '{}',
    challenge_ids text[] NOT NULL DEFAULT '{}',
    requirements jsonb NOT NULL DEFAULT '{}',
    verification_methods text[] NOT NULL DEFAULT '{}',
    fuel_points integer NOT NULL DEFAULT 150,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    version integer DEFAULT 1,
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.challenge_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_library ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view active challenges"
ON public.challenge_library FOR SELECT
USING (is_active = true);

CREATE POLICY "Anyone can view active quests"
ON public.quest_library FOR SELECT
USING (is_active = true);

-- Create indexes
CREATE INDEX idx_challenge_library_category ON public.challenge_library(category) WHERE is_active = true;
CREATE INDEX idx_challenge_library_tier ON public.challenge_library(tier) WHERE is_active = true;
CREATE INDEX idx_quest_library_category ON public.quest_library(category) WHERE is_active = true;
CREATE INDEX idx_quest_library_tier ON public.quest_library(tier) WHERE is_active = true;

-- Create function to populate library from TypeScript data
CREATE OR REPLACE FUNCTION sync_game_library()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update version and timestamps for modified entries
    UPDATE challenge_library
    SET version = version + 1,
        updated_at = now()
    WHERE id IN (
        SELECT id FROM challenge_library
        WHERE is_active = true
    );

    UPDATE quest_library
    SET version = version + 1,
        updated_at = now()
    WHERE id IN (
        SELECT id FROM quest_library
        WHERE is_active = true
    );
END;
$$;

-- Create function to get active challenges
CREATE OR REPLACE FUNCTION get_active_challenges(p_category text DEFAULT NULL)
RETURNS TABLE (
    id text,
    name text,
    category text,
    tier integer,
    description text,
    expert_reference text,
    requirements jsonb,
    fuel_points integer,
    version integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        id,
        name,
        category,
        tier,
        description,
        expert_reference,
        requirements,
        fuel_points,
        version
    FROM challenge_library
    WHERE is_active = true
    AND (p_category IS NULL OR category = p_category)
    ORDER BY tier ASC, name ASC;
$$;

-- Create function to get active quests
CREATE OR REPLACE FUNCTION get_active_quests(p_category text DEFAULT NULL)
RETURNS TABLE (
    id text,
    name text,
    category text,
    tier integer,
    description text,
    expert_ids text[],
    challenge_ids text[],
    requirements jsonb,
    fuel_points integer,
    version integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        id,
        name,
        category,
        tier,
        description,
        expert_ids,
        challenge_ids,
        requirements,
        fuel_points,
        version
    FROM quest_library
    WHERE is_active = true
    AND (p_category IS NULL OR category = p_category)
    ORDER BY tier ASC, name ASC;
$$;

-- Trigger function to update timestamps
CREATE OR REPLACE FUNCTION update_library_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER update_challenge_library_timestamp
    BEFORE UPDATE ON challenge_library
    FOR EACH ROW
    EXECUTE FUNCTION update_library_timestamp();

CREATE TRIGGER update_quest_library_timestamp
    BEFORE UPDATE ON quest_library
    FOR EACH ROW
    EXECUTE FUNCTION update_library_timestamp();