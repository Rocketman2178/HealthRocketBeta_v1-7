-- Create consolidated core schema migration
-- This migration combines essential schema and functionality

-- Core User Tables
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email text NOT NULL,
    name text,
    plan text DEFAULT 'Pro Plan'::text,
    level integer DEFAULT 1,
    fuel_points integer DEFAULT 0,
    burn_streak integer DEFAULT 0,
    health_score numeric(4,2) DEFAULT 7.8,
    healthspan_years numeric(4,2) DEFAULT 0,
    lifespan integer DEFAULT 85,
    healthspan integer DEFAULT 75,
    onboarding_completed boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Health Assessment Tables
CREATE TABLE IF NOT EXISTS public.health_assessments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users ON DELETE CASCADE NOT NULL,
    expected_lifespan integer NOT NULL,
    expected_healthspan integer NOT NULL,
    health_score numeric(4,2) NOT NULL,
    healthspan_years numeric(4,2) NOT NULL,
    previous_healthspan integer NOT NULL,
    mindset_score numeric(4,2) NOT NULL,
    sleep_score numeric(4,2) NOT NULL,
    exercise_score numeric(4,2) NOT NULL,
    nutrition_score numeric(4,2) NOT NULL,
    biohacking_score numeric(4,2) NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Challenge System Tables
CREATE TABLE IF NOT EXISTS public.challenges (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users ON DELETE CASCADE NOT NULL,
    challenge_id text NOT NULL,
    status text NOT NULL,
    progress numeric(5,2) DEFAULT 0,
    verification_count integer DEFAULT 0,
    verifications_required integer DEFAULT 3,
    started_at timestamptz DEFAULT now() NOT NULL,
    completed_at timestamptz,
    updated_at timestamptz DEFAULT now()
);

-- Chat System Tables
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id text NOT NULL,
    user_id uuid REFERENCES public.users ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    media_url text,
    media_type text CHECK (media_type IN ('image', 'video')),
    is_verification boolean DEFAULT false,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Boost System Tables
CREATE TABLE IF NOT EXISTS public.completed_boosts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users ON DELETE CASCADE NOT NULL,
    boost_id text NOT NULL,
    completed_at timestamptz DEFAULT now() NOT NULL,
    completed_date date DEFAULT CURRENT_DATE NOT NULL,
    UNIQUE(user_id, boost_id, completed_date)
);

CREATE TABLE IF NOT EXISTS public.daily_fp (
    user_id uuid REFERENCES public.users ON DELETE CASCADE NOT NULL,
    date date NOT NULL,
    fp_earned integer DEFAULT 0,
    source text,
    boosts_completed integer DEFAULT 0,
    streak_bonus integer DEFAULT 0,
    PRIMARY KEY (user_id, date)
);

-- Community System Tables
CREATE TABLE IF NOT EXISTS public.communities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    member_count integer DEFAULT 0,
    settings jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_memberships (
    user_id uuid REFERENCES public.users ON DELETE CASCADE NOT NULL,
    community_id uuid REFERENCES public.communities ON DELETE CASCADE NOT NULL,
    is_primary boolean DEFAULT false,
    joined_at timestamptz DEFAULT now(),
    global_leaderboard_opt_in boolean DEFAULT true,
    PRIMARY KEY (user_id, community_id)
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_fp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;

-- Create essential RLS policies
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can view own health assessments"
    ON public.health_assessments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health assessments"
    ON public.health_assessments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own challenges"
    ON public.challenges FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges"
    ON public.challenges FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges"
    ON public.challenges FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "chat_messages_select"
    ON public.chat_messages FOR SELECT
    USING (true);

CREATE POLICY "chat_messages_insert"
    ON public.chat_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own completed boosts"
    ON public.completed_boosts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completed boosts"
    ON public.completed_boosts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own daily FP"
    ON public.daily_fp FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily FP"
    ON public.daily_fp FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view active communities"
    ON public.communities FOR SELECT
    USING (is_active = true);

CREATE POLICY "Users can view own memberships"
    ON public.community_memberships FOR SELECT
    USING (auth.uid() = user_id);

-- Create essential indexes
CREATE INDEX IF NOT EXISTS idx_challenges_user ON public.challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat ON public.chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_completed_boosts_user ON public.completed_boosts(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_fp_user ON public.daily_fp(user_id);
CREATE INDEX IF NOT EXISTS idx_community_memberships_user ON public.community_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_community_memberships_primary ON public.community_memberships(user_id) WHERE is_primary = true;

-- Create essential functions
CREATE OR REPLACE FUNCTION calculate_next_level_points(p_level integer)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
AS $$
    SELECT round(20 * power(1.41, p_level - 1))::integer;
$$;

CREATE OR REPLACE FUNCTION handle_level_up(
    p_user_id uuid,
    p_current_fp integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_level integer;
    v_next_level_points integer;
    v_remaining_fp integer := p_current_fp;
    v_new_level integer;
    v_levels_gained integer := 0;
BEGIN
    SELECT level INTO v_current_level
    FROM users
    WHERE id = p_user_id;

    v_new_level := v_current_level;

    WHILE true LOOP
        v_next_level_points := calculate_next_level_points(v_new_level);
        
        IF v_remaining_fp < v_next_level_points THEN
            EXIT;
        END IF;
        
        v_remaining_fp := v_remaining_fp - v_next_level_points;
        v_new_level := v_new_level + 1;
        v_levels_gained := v_levels_gained + 1;
    END LOOP;

    IF v_levels_gained > 0 THEN
        UPDATE users
        SET 
            level = v_new_level,
            fuel_points = v_remaining_fp
        WHERE id = p_user_id;

        RETURN jsonb_build_object(
            'leveled_up', true,
            'levels_gained', v_levels_gained,
            'new_level', v_new_level,
            'carryover_fp', v_remaining_fp,
            'next_level_points', calculate_next_level_points(v_new_level),
            'should_show_modal', true
        );
    END IF;

    RETURN jsonb_build_object(
        'leveled_up', false,
        'current_level', v_current_level,
        'current_fp', p_current_fp,
        'next_level_points', v_next_level_points,
        'should_show_modal', false
    );
END;
$$;