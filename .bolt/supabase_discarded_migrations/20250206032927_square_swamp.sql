-- Create function to populate tier 2 content
CREATE OR REPLACE FUNCTION populate_tier2_library()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert tier 2 sleep challenges
    INSERT INTO challenge_library (
        id,
        name,
        category,
        tier,
        description,
        expert_reference,
        learning_objectives,
        requirements,
        implementation_protocol,
        verification_method,
        success_metrics,
        expert_tips,
        fuel_points
    )
    SELECT 
        'sc' || (row_number() OVER () + 100),  -- Start at 100 for tier 2
        name,
        'Sleep',
        2,
        description,
        expert_reference,
        learning_objectives,
        requirements,
        implementation_protocol,
        verification_method,
        success_metrics,
        expert_tips,
        100  -- Higher FP for tier 2
    FROM (VALUES
        (
            'Advanced Sleep Architecture',
            'Master advanced sleep architecture optimization using sophisticated tracking',
            'Dr. Matthew Walker - Advanced sleep architecture and performance optimization',
            ARRAY[
                'Master sleep stage architecture',
                'Understand performance correlations',
                'Optimize recovery cycles'
            ],
            jsonb_build_array(
                jsonb_build_object(
                    'description', 'Detailed sleep stage monitoring',
                    'verificationMethod', 'sleep_stage_logs'
                ),
                jsonb_build_object(
                    'description', 'Performance correlation tracking',
                    'verificationMethod', 'performance_logs'
                )
            ),
            jsonb_build_object(
                'week1', 'Baseline assessment and stage tracking',
                'week2', 'Cycle optimization and adjustment',
                'week3', 'Performance correlation mastery'
            ),
            jsonb_build_object(
                'type', 'sleep_stage_logs',
                'description', 'Sleep architecture verification',
                'requiredFrequency', 'daily'
            ),
            ARRAY[
                'Improved deep sleep percentage',
                'Optimized REM cycles',
                'Enhanced recovery scores'
            ],
            ARRAY[
                'Focus on the architecture, not just the duration',
                'Track cognitive performance alongside sleep stages',
                'Note exercise timing impacts on deep sleep'
            ]
        ),
        (
            'Elite Recovery Integration',
            'Master advanced recovery systems and optimization protocols',
            'Dr. Peter Attia - Advanced recovery system optimization',
            ARRAY[
                'Master recovery systems',
                'Optimize protocols',
                'Develop maintenance'
            ],
            jsonb_build_array(
                jsonb_build_object(
                    'description', 'System development',
                    'verificationMethod', 'system_logs'
                ),
                jsonb_build_object(
                    'description', 'Protocol optimization',
                    'verificationMethod', 'protocol_logs'
                )
            ),
            jsonb_build_object(
                'week1', 'System assessment',
                'week2', 'Protocol optimization',
                'week3', 'Integration mastery'
            ),
            jsonb_build_object(
                'type', 'recovery_logs',
                'description', 'Recovery protocol verification',
                'requiredFrequency', 'daily'
            ),
            ARRAY[
                'Recovery optimization',
                'Protocol effectiveness',
                'Integration success'
            ],
            ARRAY[
                'Recovery mastery enables progression',
                'Monitor all variables',
                'Track adaptation signs'
            ]
        )
    ) AS t(name, description, expert_reference, learning_objectives, requirements, implementation_protocol, verification_method, success_metrics, expert_tips)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        expert_reference = EXCLUDED.expert_reference,
        learning_objectives = EXCLUDED.learning_objectives,
        requirements = EXCLUDED.requirements,
        implementation_protocol = EXCLUDED.implementation_protocol,
        verification_method = EXCLUDED.verification_method,
        success_metrics = EXCLUDED.success_metrics,
        expert_tips = EXCLUDED.expert_tips,
        updated_at = now(),
        version = challenge_library.version + 1;

    -- Insert tier 2 mindset challenges
    INSERT INTO challenge_library (
        id,
        name,
        category,
        tier,
        description,
        expert_reference,
        learning_objectives,
        requirements,
        implementation_protocol,
        verification_method,
        success_metrics,
        expert_tips,
        fuel_points
    )
    SELECT 
        'mc' || (row_number() OVER () + 100),
        name,
        'Mindset',
        2,
        description,
        expert_reference,
        learning_objectives,
        requirements,
        implementation_protocol,
        verification_method,
        success_metrics,
        expert_tips,
        100
    FROM (VALUES
        (
            'Elite Focus Protocol',
            'Master advanced focus and cognitive performance protocols for elite mental output',
            'Dr. Andrew Huberman - Advanced focus protocols and neural optimization',
            ARRAY[
                'Master deep work states',
                'Optimize cognitive performance',
                'Develop elite focus capacity'
            ],
            jsonb_build_array(
                jsonb_build_object(
                    'description', 'Advanced focus blocks (2-4 hours)',
                    'verificationMethod', 'focus_session_logs'
                ),
                jsonb_build_object(
                    'description', 'Environment mastery',
                    'verificationMethod', 'environment_logs'
                )
            ),
            jsonb_build_object(
                'week1', 'Focus capacity baseline and neurological assessment',
                'week2', 'Progressive deep work blocks with recovery optimization',
                'week3', 'Flow state triggering and sustained performance protocol'
            ),
            jsonb_build_object(
                'type', 'focus_session_logs',
                'description', 'Advanced focus verification',
                'requiredFrequency', 'daily'
            ),
            ARRAY[
                'Sustained deep work sessions (2-4 hours)',
                'Task completion speed increase (25%+)',
                'Cognitive stamina indicators (85%+ performance maintenance)'
            ],
            ARRAY[
                'Elite focus requires systematic development',
                'Build progressive capacity',
                'Monitor recovery needs'
            ]
        ),
        (
            'Peak State Mastery',
            'Master elite-level emotional state control and rapid state change protocols',
            'Tony Robbins - Advanced state control and performance psychology',
            ARRAY[
                'Master instant state change',
                'Develop state stacking',
                'Create reliable anchors'
            ],
            jsonb_build_array(
                jsonb_build_object(
                    'description', 'Multiple state mastery',
                    'verificationMethod', 'state_logs'
                ),
                jsonb_build_object(
                    'description', 'Rapid change protocols',
                    'verificationMethod', 'performance_logs'
                )
            ),
            jsonb_build_object(
                'week1', 'Protocol mastery',
                'week2', 'Stack development',
                'week3', 'Full integration'
            ),
            jsonb_build_object(
                'type', 'state_logs',
                'description', 'State change verification',
                'requiredFrequency', 'daily'
            ),
            ARRAY[
                'Change speed (<30 seconds)',
                'State stability (>30 minutes)',
                'Stack effectiveness'
            ],
            ARRAY[
                'Elite performance requires instant state access',
                'Build reliable triggers',
                'Practice in varied conditions'
            ]
        )
    ) AS t(name, description, expert_reference, learning_objectives, requirements, implementation_protocol, verification_method, success_metrics, expert_tips)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        expert_reference = EXCLUDED.expert_reference,
        learning_objectives = EXCLUDED.learning_objectives,
        requirements = EXCLUDED.requirements,
        implementation_protocol = EXCLUDED.implementation_protocol,
        verification_method = EXCLUDED.verification_method,
        success_metrics = EXCLUDED.success_metrics,
        expert_tips = EXCLUDED.expert_tips,
        updated_at = now(),
        version = challenge_library.version + 1;

    -- Insert tier 2 quests
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
        'sq' || (row_number() OVER () + 100),
        name,
        category,
        2,
        description,
        expert_ids,
        challenge_ids,
        jsonb_build_object(
            'challengesRequired', 3,
            'dailyBoostsRequired', 63,
            'prerequisites', ARRAY['sq1', 'sq2', 'sq3']
        ),
        ARRAY[
            'Advanced verification posts',
            'Challenge mastery logs',
            'Performance metrics'
        ],
        300
    FROM (VALUES
        ('Advanced Sleep Optimization', 'Sleep', 'Master advanced sleep optimization techniques for maximum recovery',
         ARRAY['walker', 'parsley'], ARRAY['sc101', 'sc102', 'sc103']),
        ('Elite Mental Performance', 'Mindset', 'Master advanced cognitive enhancement and performance optimization',
         ARRAY['hubermanMind', 'harris'], ARRAY['mc101', 'mc102', 'mc103'])
    ) AS t(name, category, description, expert_ids, challenge_ids)
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
SELECT populate_tier2_library();