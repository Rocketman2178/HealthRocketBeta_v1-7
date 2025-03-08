-- Create function to populate remaining tier 2 content
CREATE OR REPLACE FUNCTION populate_remaining_tier2_library()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert tier 2 exercise challenges
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
        'ec' || (row_number() OVER () + 100),
        name,
        'Exercise',
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
            'Elite Movement Integration',
            'Master advanced movement patterns and integrated control systems',
            'Dr. Andy Galpin - Advanced movement system integration',
            ARRAY[
                'Master system design',
                'Optimize integration',
                'Develop maintenance'
            ],
            jsonb_build_array(
                jsonb_build_object(
                    'description', 'System development',
                    'verificationMethod', 'system_logs'
                ),
                jsonb_build_object(
                    'description', 'Integration protocols',
                    'verificationMethod', 'protocol_logs'
                )
            ),
            jsonb_build_object(
                'week1', 'System design',
                'week2', 'Integration development',
                'week3', 'Maintenance mastery'
            ),
            jsonb_build_object(
                'type', 'system_logs',
                'description', 'System integration verification',
                'requiredFrequency', 'daily'
            ),
            ARRAY[
                'System effectiveness',
                'Integration success',
                'Maintenance optimization'
            ],
            ARRAY[
                'Systems enable excellence',
                'Build comprehensive protocols',
                'Monitor all variables'
            ]
        ),
        (
            'Performance Integration Protocol',
            'Create and implement comprehensive performance optimization systems',
            'Dr. Peter Attia - Complete system optimization and integration',
            ARRAY[
                'Master system integration',
                'Optimize performance',
                'Develop maintenance'
            ],
            jsonb_build_array(
                jsonb_build_object(
                    'description', 'System tracking',
                    'verificationMethod', 'system_logs'
                ),
                jsonb_build_object(
                    'description', 'Protocol optimization',
                    'verificationMethod', 'protocol_logs'
                )
            ),
            jsonb_build_object(
                'week1', 'System baseline',
                'week2', 'Integration mastery',
                'week3', 'Maintenance optimization'
            ),
            jsonb_build_object(
                'type', 'system_logs',
                'description', 'System tracking verification',
                'requiredFrequency', 'daily'
            ),
            ARRAY[
                'System effectiveness',
                'Protocol success',
                'Maintenance reliability'
            ],
            ARRAY[
                'Systems enable excellence',
                'Track all components',
                'Monitor adaptation'
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

    -- Insert tier 2 nutrition challenges
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
        'nc' || (row_number() OVER () + 100),
        name,
        'Nutrition',
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
            'Advanced Glucose Optimization',
            'Execute comprehensive glucose response protocol with monitoring',
            'Dr. Casey Means - Advanced glucose control and metabolic optimization',
            ARRAY[
                'Master glucose manipulation',
                'Optimize metabolic flexibility',
                'Enhance performance timing'
            ],
            jsonb_build_array(
                jsonb_build_object(
                    'description', 'Advanced glucose monitoring',
                    'verificationMethod', 'glucose_logs'
                ),
                jsonb_build_object(
                    'description', 'Response optimization',
                    'verificationMethod', 'response_logs'
                )
            ),
            jsonb_build_object(
                'week1', 'Advanced monitoring setup',
                'week2', 'Response optimization',
                'week3', 'Protocol mastery'
            ),
            jsonb_build_object(
                'type', 'glucose_logs',
                'description', 'Advanced glucose verification',
                'requiredFrequency', 'daily'
            ),
            ARRAY[
                'Glucose stability <10 mg/dL variance',
                'Response predictability >95%',
                'Performance correlation score'
            ],
            ARRAY[
                'Elite performance requires glucose mastery',
                'Track all variables',
                'Monitor adaptation signs'
            ]
        ),
        (
            'Elite Nutrition Integration',
            'Create and implement fully optimized performance nutrition systems',
            'Dr. Rhonda Patrick - Advanced system optimization and integration',
            ARRAY[
                'Master system integration',
                'Optimize protocols',
                'Enhance maintenance'
            ],
            jsonb_build_array(
                jsonb_build_object(
                    'description', 'System tracking',
                    'verificationMethod', 'system_logs'
                ),
                jsonb_build_object(
                    'description', 'Protocol optimization',
                    'verificationMethod', 'protocol_logs'
                )
            ),
            jsonb_build_object(
                'week1', 'System baseline',
                'week2', 'Integration mastery',
                'week3', 'Maintenance optimization'
            ),
            jsonb_build_object(
                'type', 'system_logs',
                'description', 'System tracking verification',
                'requiredFrequency', 'daily'
            ),
            ARRAY[
                'System effectiveness',
                'Protocol success',
                'Maintenance reliability'
            ],
            ARRAY[
                'Systems enable excellence',
                'Track all components',
                'Monitor adaptation'
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

    -- Insert tier 2 biohacking challenges
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
        'bc' || (row_number() OVER () + 100),
        name,
        'Biohacking',
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
            'Advanced Cold Protocol',
            'Master advanced cold exposure protocols and adaptation strategies',
            'Ben Greenfield - Advanced cold exposure and adaptation',
            ARRAY[
                'Master cold protocols',
                'Optimize adaptation',
                'Develop advanced systems'
            ],
            jsonb_build_array(
                jsonb_build_object(
                    'description', 'Advanced exposure protocols',
                    'verificationMethod', 'protocol_logs'
                ),
                jsonb_build_object(
                    'description', 'Adaptation tracking',
                    'verificationMethod', 'adaptation_logs'
                )
            ),
            jsonb_build_object(
                'week1', 'Protocol advancement',
                'week2', 'Adaptation optimization',
                'week3', 'System mastery'
            ),
            jsonb_build_object(
                'type', 'cold_protocol_logs',
                'description', 'Cold protocol verification',
                'requiredFrequency', 'daily'
            ),
            ARRAY[
                'Protocol mastery',
                'Adaptation optimization',
                'System effectiveness'
            ],
            ARRAY[
                'Advanced protocols require precision',
                'Monitor all variables',
                'Track recovery patterns'
            ]
        ),
        (
            'Recovery Stack Integration',
            'Create and implement advanced recovery technology stacks',
            'Dave Asprey - Advanced recovery technology integration',
            ARRAY[
                'Master stack development',
                'Optimize integration',
                'Develop protocols'
            ],
            jsonb_build_array(
                jsonb_build_object(
                    'description', 'Advanced modality integration',
                    'verificationMethod', 'integration_logs'
                ),
                jsonb_build_object(
                    'description', 'Stack optimization',
                    'verificationMethod', 'stack_logs'
                )
            ),
            jsonb_build_object(
                'week1', 'Stack advancement',
                'week2', 'Integration mastery',
                'week3', 'Protocol optimization'
            ),
            jsonb_build_object(
                'type', 'recovery_stack_logs',
                'description', 'Recovery stack verification',
                'requiredFrequency', 'daily'
            ),
            ARRAY[
                'Stack effectiveness',
                'Integration optimization',
                'Protocol mastery'
            ],
            ARRAY[
                'Advanced stacks require balance',
                'Monitor interactions',
                'Track all variables'
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

    -- Insert remaining tier 2 quests
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
        'eq' || (row_number() OVER () + 100),
        name,
        category,
        2,
        description,
        expert_ids,
        challenge_ids,
        jsonb_build_object(
            'challengesRequired', 3,
            'dailyBoostsRequired', 63,
            'prerequisites', ARRAY['eq1', 'eq2', 'eq3']
        ),
        ARRAY[
            'Advanced verification posts',
            'Challenge mastery logs',
            'Performance metrics'
        ],
        300
    FROM (VALUES
        ('Elite Performance Development', 'Exercise', 'Master elite-level performance development and optimization protocols',
         ARRAY['galpin', 'attia'], ARRAY['ec101', 'ec102', 'ec103']),
        ('Advanced Metabolic Optimization', 'Nutrition', 'Master advanced metabolic optimization for peak health and performance',
         ARRAY['means', 'hyman'], ARRAY['nc101', 'nc102', 'nc103']),
        ('Elite Recovery Integration', 'Biohacking', 'Master advanced recovery systems and optimization protocols',
         ARRAY['asprey', 'greenfield'], ARRAY['bc101', 'bc102', 'bc103'])
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
SELECT populate_remaining_tier2_library();