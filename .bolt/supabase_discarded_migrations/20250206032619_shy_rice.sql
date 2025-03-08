-- Create function to populate remaining challenges and quests
CREATE OR REPLACE FUNCTION populate_remaining_library()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert exercise challenges
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
        'ec' || row_number() OVER (),
        name,
        'Exercise',
        tier,
        description,
        expert_reference,
        learning_objectives,
        requirements,
        implementation_protocol,
        verification_method,
        success_metrics,
        expert_tips,
        50
    FROM (VALUES
        (
            'Movement Pattern Mastery',
            1,
            'Master fundamental movement patterns for optimal joint health and performance',
            'Ben Patrick - Movement pattern optimization and joint health',
            ARRAY[
                'Understand movement mechanics',
                'Master basic patterns',
                'Develop joint control'
            ],
            jsonb_build_array(
                jsonb_build_object(
                    'description', 'Daily movement practice',
                    'verificationMethod', 'movement_logs'
                ),
                jsonb_build_object(
                    'description', 'Pattern progression',
                    'verificationMethod', 'pattern_logs'
                )
            ),
            jsonb_build_object(
                'week1', 'Movement assessment and baseline',
                'week2', 'Pattern development and control',
                'week3', 'Integration and flow mastery'
            ),
            jsonb_build_object(
                'type', 'movement_logs',
                'description', 'Movement pattern verification',
                'requiredFrequency', 'daily'
            ),
            ARRAY[
                'Movement quality score >85%',
                'Joint mobility improvements',
                'Pattern mastery assessment'
            ],
            ARRAY[
                'Quality movement precedes loading',
                'Focus on control before speed',
                'Build systematic progression'
            ]
        ),
        (
            'Zone 2 Foundation',
            1,
            'Establish foundational aerobic capacity through structured Zone 2 training',
            'Dr. Peter Attia - Zone 2 training and metabolic health optimization',
            ARRAY[
                'Understand zone training',
                'Master intensity control',
                'Develop aerobic base'
            ],
            jsonb_build_array(
                jsonb_build_object(
                    'description', 'Heart rate monitoring',
                    'verificationMethod', 'hr_logs'
                ),
                jsonb_build_object(
                    'description', 'Zone adherence',
                    'verificationMethod', 'zone_logs'
                )
            ),
            jsonb_build_object(
                'week1', 'Zone identification and baseline',
                'week2', 'Duration development',
                'week3', 'Protocol optimization'
            ),
            jsonb_build_object(
                'type', 'zone2_logs',
                'description', 'Zone 2 training verification',
                'requiredFrequency', 'daily'
            ),
            ARRAY[
                'Zone accuracy >90%',
                'Duration targets met',
                'Recovery optimization'
            ],
            ARRAY[
                'Zone 2 builds the engine',
                'Focus on consistency',
                'Monitor recovery needs'
            ]
        )
    ) AS t(name, tier, description, expert_reference, learning_objectives, requirements, implementation_protocol, verification_method, success_metrics, expert_tips)
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

    -- Insert nutrition challenges
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
        'nc' || row_number() OVER (),
        name,
        'Nutrition',
        tier,
        description,
        expert_reference,
        learning_objectives,
        requirements,
        implementation_protocol,
        verification_method,
        success_metrics,
        expert_tips,
        50
    FROM (VALUES
        (
            'Glucose Guardian',
            1,
            'Master glucose response patterns through strategic food choices and timing',
            'Dr. Casey Means - Glucose optimization and metabolic health',
            ARRAY[
                'Understand glucose dynamics',
                'Master response patterns',
                'Develop optimal timing'
            ],
            jsonb_build_array(
                jsonb_build_object(
                    'description', 'Daily glucose monitoring',
                    'verificationMethod', 'glucose_logs'
                ),
                jsonb_build_object(
                    'description', 'Food response tracking',
                    'verificationMethod', 'response_logs'
                )
            ),
            jsonb_build_object(
                'week1', 'Baseline monitoring and pattern identification',
                'week2', 'Strategic intervention testing',
                'week3', 'Protocol optimization and habits'
            ),
            jsonb_build_object(
                'type', 'glucose_logs',
                'description', 'Glucose tracking verification',
                'requiredFrequency', 'daily'
            ),
            ARRAY[
                'Post-meal glucose <120mg/dL',
                'Daily variability <15mg/dL',
                'Pattern recognition >90%'
            ],
            ARRAY[
                'Glucose stability is the foundation',
                'Track meal timing impact',
                'Monitor exercise effects'
            ]
        ),
        (
            'Nutrient Density Protocol',
            1,
            'Optimize nutrient intake through strategic food selection and preparation methods',
            'Dr. Rhonda Patrick - Nutrient optimization and absorption enhancement',
            ARRAY[
                'Master food quality assessment',
                'Optimize preparation methods',
                'Maximize nutrient absorption'
            ],
            jsonb_build_array(
                jsonb_build_object(
                    'description', 'Daily nutrient tracking',
                    'verificationMethod', 'nutrient_logs'
                ),
                jsonb_build_object(
                    'description', 'Food quality assessment',
                    'verificationMethod', 'quality_logs'
                )
            ),
            jsonb_build_object(
                'week1', 'Food quality baseline and assessment',
                'week2', 'Preparation method optimization',
                'week3', 'Absorption protocol mastery'
            ),
            jsonb_build_object(
                'type', 'nutrient_logs',
                'description', 'Nutrient tracking verification',
                'requiredFrequency', 'daily'
            ),
            ARRAY[
                'Micronutrient targets met',
                'Preparation mastery score',
                'Quality consistency >90%'
            ],
            ARRAY[
                'Quality drives outcomes',
                'Focus on food synergies',
                'Track absorption factors'
            ]
        )
    ) AS t(name, tier, description, expert_reference, learning_objectives, requirements, implementation_protocol, verification_method, success_metrics, expert_tips)
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

    -- Insert biohacking challenges
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
        'bc' || row_number() OVER (),
        name,
        'Biohacking',
        tier,
        description,
        expert_reference,
        learning_objectives,
        requirements,
        implementation_protocol,
        verification_method,
        success_metrics,
        expert_tips,
        50
    FROM (VALUES
        (
            'Cold Adaptation',
            1,
            'Master progressive cold exposure for enhanced recovery and resilience',
            'Ben Greenfield - Cold exposure optimization and adaptation protocols',
            ARRAY[
                'Understand cold adaptation',
                'Master exposure protocols',
                'Develop systematic progression'
            ],
            jsonb_build_array(
                jsonb_build_object(
                    'description', 'Daily cold exposure',
                    'verificationMethod', 'exposure_logs'
                ),
                jsonb_build_object(
                    'description', 'Temperature monitoring',
                    'verificationMethod', 'temp_logs'
                )
            ),
            jsonb_build_object(
                'week1', 'Baseline assessment and gradual exposure',
                'week2', 'Protocol progression and adaptation',
                'week3', 'Advanced integration and optimization'
            ),
            jsonb_build_object(
                'type', 'cold_exposure_logs',
                'description', 'Cold exposure verification',
                'requiredFrequency', 'daily'
            ),
            ARRAY[
                'Exposure duration targets',
                'Temperature adaptation scores',
                'Recovery enhancement metrics'
            ],
            ARRAY[
                'Cold builds resilience systematically',
                'Progress gradually',
                'Monitor recovery markers'
            ]
        ),
        (
            'HRV Training',
            1,
            'Develop HRV optimization through strategic protocols and monitoring',
            'Dr. Molly Maloof - HRV optimization and stress resilience',
            ARRAY[
                'Master HRV monitoring',
                'Optimize stress response',
                'Develop adaptation protocols'
            ],
            jsonb_build_array(
                jsonb_build_object(
                    'description', 'Daily HRV tracking',
                    'verificationMethod', 'hrv_logs'
                ),
                jsonb_build_object(
                    'description', 'Response monitoring',
                    'verificationMethod', 'response_logs'
                )
            ),
            jsonb_build_object(
                'week1', 'Baseline tracking and assessment',
                'week2', 'Intervention testing',
                'week3', 'Protocol optimization'
            ),
            jsonb_build_object(
                'type', 'hrv_logs',
                'description', 'HRV training verification',
                'requiredFrequency', 'daily'
            ),
            ARRAY[
                'HRV improvement trends',
                'Response optimization',
                'Protocol effectiveness'
            ],
            ARRAY[
                'HRV reflects system resilience',
                'Focus on trends',
                'Monitor all variables'
            ]
        )
    ) AS t(name, tier, description, expert_reference, learning_objectives, requirements, implementation_protocol, verification_method, success_metrics, expert_tips)
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

    -- Insert remaining quests
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
        'eq' || row_number() OVER (),
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
        ('Movement Foundation', 'Exercise', 1, 'Establish fundamental movement patterns and joint health',
         ARRAY['patrick', 'galpin'], ARRAY['ec1', 'ec2', 'ec3']),
        ('Metabolic Health Master', 'Nutrition', 1, 'Establish fundamental nutrition practices and metabolic health',
         ARRAY['means', 'hyman'], ARRAY['nc1', 'nc2', 'nc3']),
        ('Recovery Tech Master', 'Biohacking', 1, 'Establish fundamental recovery technology practices',
         ARRAY['asprey', 'greenfield'], ARRAY['bc1', 'bc2', 'bc3'])
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
SELECT populate_remaining_library();