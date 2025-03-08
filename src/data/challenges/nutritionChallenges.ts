import type { Challenge } from '../../types/game';

export const nutritionChallenges: Challenge[] = [
  {
    id: 'nc1',
    name: 'Glucose Guardian',
    tier: 1,
    duration: 21,
    description: 'Master glucose response patterns through strategic food choices and timing.',
    expertReference: 'Dr. Casey Means - Glucose optimization and metabolic health',
    learningObjectives: [
      'Understand glucose dynamics',
      'Master response patterns',
      'Develop optimal timing'
    ],
    requirements: [
      {
        description: 'Daily glucose monitoring',
        verificationMethod: 'glucose_logs'
      },
      {
        description: 'Food response tracking',
        verificationMethod: 'response_logs'
      },
      {
        description: 'Pattern identification',
        verificationMethod: 'pattern_logs'
      }
    ],
    expertIds: ['means'],
    implementationProtocol: {
      week1: 'Baseline monitoring and pattern identification',
      week2: 'Strategic intervention testing',
      week3: 'Protocol optimization and habits'
    },
    verificationMethods: [
      {
        type: 'glucose_logs',
        description: 'Glucose tracking verification',
        requiredFrequency: 'daily'
      }
    ],
    successMetrics: [
      'Post-meal glucose <120mg/dL',
      'Daily variability <15mg/dL',
      'Pattern recognition >90%'
    ],
    expertTips: [
      '"Glucose stability is the foundation" - Dr. Means',
      'Track meal timing impact',
      'Monitor exercise effects'
    ],
    fuelPoints: 50,
    status: 'available',
    category: 'Nutrition'
  },
  {
    id: 'nc2',
    name: 'Nutrient Density Protocol',
    tier: 1,
    duration: 21,
    description: 'Optimize nutrient intake through strategic food selection and preparation methods.',
    expertReference: 'Dr. Rhonda Patrick - Nutrient optimization and absorption enhancement',
    learningObjectives: [
      'Master food quality assessment',
      'Optimize preparation methods',
      'Maximize nutrient absorption'
    ],
    requirements: [
      {
        description: 'Daily nutrient tracking',
        verificationMethod: 'nutrient_logs'
      },
      {
        description: 'Food quality assessment',
        verificationMethod: 'quality_logs'
      },
      {
        description: 'Preparation optimization',
        verificationMethod: 'prep_logs'
      }
    ],
    expertIds: ['patrick'],
    implementationProtocol: {
      week1: 'Food quality baseline and assessment',
      week2: 'Preparation method optimization',
      week3: 'Absorption protocol mastery'
    },
    verificationMethods: [
      {
        type: 'nutrient_logs',
        description: 'Nutrient tracking verification',
        requiredFrequency: 'daily'
      }
    ],
    successMetrics: [
      'Micronutrient targets met',
      'Preparation mastery score',
      'Quality consistency >90%'
    ],
    expertTips: [
      '"Quality drives outcomes" - Dr. Patrick',
      'Focus on food synergies',
      'Track absorption factors'
    ],
    fuelPoints: 50,
    status: 'available',
    category: 'Nutrition'
  },
  {
    id: 'nc3',
    name: 'Meal Timing Master',
    tier: 1,
    duration: 21,
    description: 'Develop optimal meal timing strategies for enhanced metabolic health.',
    expertReference: 'Dr. Mark Hyman - Metabolic optimization through strategic timing',
    learningObjectives: [
      'Master meal timing',
      'Optimize feeding windows',
      'Enhance metabolic flexibility'
    ],
    requirements: [
      {
        description: 'Consistent meal timing',
        verificationMethod: 'timing_logs'
      },
      {
        description: 'Window optimization',
        verificationMethod: 'window_logs'
      },
      {
        description: 'Response tracking',
        verificationMethod: 'response_logs'
      }
    ],
    expertIds: ['hyman'],
    implementationProtocol: {
      week1: 'Timing baseline and assessment',
      week2: 'Window optimization',
      week3: 'Pattern mastery'
    },
    verificationMethods: [
      {
        type: 'timing_logs',
        description: 'Meal timing verification',
        requiredFrequency: 'daily'
      }
    ],
    successMetrics: [
      'Timing consistency >90%',
      'Energy stability score',
      'Metabolic adaptation'
    ],
    expertTips: [
      '"Timing is as important as content" - Dr. Hyman',
      'Monitor energy patterns',
      'Track adaptation signs'
    ],
    fuelPoints: 50,
    status: 'available',
    category: 'Nutrition'
  }
];