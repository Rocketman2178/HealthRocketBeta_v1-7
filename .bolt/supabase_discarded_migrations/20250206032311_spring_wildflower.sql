-- Create function to populate challenge library
CREATE OR REPLACE FUNCTION populate_challenge_library()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert tier 0 challenge
    INSERT INTO challenge_library (
        id,
        name,
        category,
        tier,
        duration,
        description,
        expert_reference,
        learning_objectives,
        requirements,
        implementation_protocol,
        verification_method,
        success_metrics,
        expert_tips,
        fuel_points
    ) VALUES (
        'tc0',
        'Morning Basics',
        'Contests',
        0,
        21,
        'Establish a simple but powerful morning routine that touches all five health categories: Mindset, Sleep, Nutrition, Exercise and Biohacking. (Unlocks Tier 1 Expert Challenges)',
        'The Health Rocket Team - Gamifying Health to Increase HealthSpan',
        ARRAY[
            'Establish morning routine fundamentals',
            'Build cross-category consistency',
            'Develop verification habits'
        ],
        jsonb_build_array(
            jsonb_build_object(
                'description', 'Complete at least 3 morning actions daily',
                'verificationMethod', 'daily_logs'
            ),
            jsonb_build_object(
                'description', 'Submit weekly verification posts',
                'verificationMethod', 'verification_posts'
            ),
            jsonb_build_object(
                'description', 'Share challenge takeaways',
                'verificationMethod', 'reflection_post'
            )
        ),
        jsonb_build_object(
            'week1', 'Complete at least 3 daily actions within 2 hours of waking:\n- Mindset: 2-minute gratitude reflection\n- Sleep: Record total sleep time or sleep quality score\n- Exercise: 5-minute stretch\n- Nutrition: Glass of water\n- Biohacking: 5 minutes of morning sunlight exposure',
            'week2', 'Continue daily actions and document sleep metrics',
            'week3', 'Maintain routine and prepare challenge reflection'
        ),
        jsonb_build_object(
            'type', 'verification_posts',
            'description', 'Week 1: Selfie with morning sunlight exposure\nWeek 2: Screenshot of weekly sleep score or time log\nWeek 3: Three takeaway thoughts from this Challenge',
            'requiredFrequency', 'weekly'
        ),
        ARRAY[
            'Daily action completion rate >80%',
            'Weekly verification posts submitted',
            'Challenge reflection completed'
        ],
        ARRAY[
            'Start with the easiest actions first',
            'Stack habits by connecting them to existing routines',
            'Focus on consistency over perfection'
        ],
        50
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        description = EXCLUDED.description,
        expert_reference = EXCLUDED.expert_reference,
        learning_objectives = EXCLUDED.learning_objectives,
        requirements = EXCLUDED.requirements,
        implementation_protocol = EXCLUDED.implementation_protocol,
        verification_method = EXCLUDED.verification_method,
        success_metrics = EXCLUDED.success_metrics,
        expert_tips = EXCLUDED.expert_tips,
        fuel_points = EXCLUDED.fuel_points,
        updated_at = now(),
        version = challenge_library.version + 1;

    -- Insert sleep challenges
    INSERT INTO challenge_library (
        id,
        name,
        category,
        tier,
        description,
        expert_reference,
        requirements,
        fuel_points
    )
    SELECT 
        'sc' || row_number() OVER (),
        name,
        'Sleep',
        tier,
        description,
        expert_reference,
        jsonb_build_array(
            jsonb_build_object(
                'description', 'Daily sleep tracking',
                'verificationMethod', 'sleep_logs'
            ),
            jsonb_build_object(
                'description', 'Weekly verification posts',
                'verificationMethod', 'verification_posts'
            )
        ),
        50
    FROM (VALUES
        ('Sleep Schedule Mastery', 1, 'Establish a consistent sleep schedule that aligns with your circadian rhythm', 'Dr. Matthew Walker - Sleep consistency and circadian rhythm optimization'),
        ('Recovery Environment Setup', 1, 'Create an optimal sleep environment for quality sleep', 'Dr. Kirk Parsley - Sleep environment optimization for recovery'),
        ('Digital Sunset Protocol', 1, 'Implement systematic reduction of artificial light exposure', 'Dr. Dan Pardi - Light Management System')
        -- Add more sleep challenges here
    ) AS t(name, tier, description, expert_reference)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        expert_reference = EXCLUDED.expert_reference,
        requirements = EXCLUDED.requirements,
        updated_at = now(),
        version = challenge_library.version + 1;

    -- Insert mindset challenges
    INSERT INTO challenge_library (
        id,
        name,
        category,
        tier,
        description,
        expert_reference,
        requirements,
        fuel_points
    )
    SELECT 
        'mc' || row_number() OVER (),
        name,
        'Mindset',
        tier,
        description,
        expert_reference,
        jsonb_build_array(
            jsonb_build_object(
                'description', 'Daily mindset practice',
                'verificationMethod', 'mindset_logs'
            ),
            jsonb_build_object(
                'description', 'Weekly verification posts',
                'verificationMethod', 'verification_posts'
            )
        ),
        50
    FROM (VALUES
        ('Focus Protocol Development', 1, 'Establish a systematic approach to enhancing focus and cognitive performance', 'Dr. Andrew Huberman - Focus enhancement and neural state optimization'),
        ('Meditation Foundation', 1, 'Build a solid foundation in mindfulness meditation practice', 'Sam Harris - Meditation fundamentals and awareness training'),
        ('Morning Mindset Protocol', 1, 'Develop a comprehensive morning routine for optimal mental states', 'Tony Robbins - Peak state activation and emotional mastery')
        -- Add more mindset challenges here
    ) AS t(name, tier, description, expert_reference)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        expert_reference = EXCLUDED.expert_reference,
        requirements = EXCLUDED.requirements,
        updated_at = now(),
        version = challenge_library.version + 1;

    -- Insert quests
    INSERT INTO quest_library (
        id,
        name,
        category,
        tier,
        description,
        expert_ids,
        challenge_ids,
        requirements,
        verification_methods,
        fuel_points
    )
    SELECT 
        'sq' || row_number() OVER (),
        name,
        category,
        tier,
        description,
        expert_ids,
        challenge_ids,
        jsonb_build_object(
            'challengesRequired', 2,
            'dailyBoostsRequired', 45,
            'prerequisites', '{}'::text[]
        ),
        ARRAY[
            'Weekly verification posts',
            'Challenge completion logs',
            'Daily boost tracking'
        ],
        150
    FROM (VALUES
        ('Sleep Quality Foundation', 'Sleep', 1, 'Establish fundamental sleep habits and environment optimization', 
         ARRAY['walker', 'parsley'], ARRAY['sc1', 'sc2', 'sc3']),
        ('Mindset Foundation', 'Mindset', 1, 'Establish fundamental mindset practices and cognitive enhancement protocols',
         ARRAY['hubermanMind', 'harris'], ARRAY['mc1', 'mc2', 'mc3'])
        -- Add more quests here
    ) AS t(name, category, tier, description, expert_ids, challenge_ids)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        expert_ids = EXCLUDED.expert_ids,
        challenge_ids = EXCLUDED.challenge_ids,
        requirements = EXCLUDED.requirements,
        verification_methods = EXCLUDED.verification_methods,
        updated_at = now(),
        version = quest_library.version + 1;
END;
$$;

-- Execute the population function
SELECT populate_challenge_library();