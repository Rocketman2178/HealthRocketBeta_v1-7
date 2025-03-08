import type { Challenge } from '../../types/game';

export const sleepChallenges: Challenge[] = [
  // Sleep Quality Foundation Challenges
  {
    id: 'sc1',
    name: 'Sleep Schedule Mastery',
    tier: 1,
    duration: 21,
    description: 'Establish a consistent sleep schedule that aligns with your circadian rhythm, creating a foundation for optimal sleep quality.',
    expertReference: 'Dr. Matthew Walker - Sleep consistency and circadian rhythm optimization',
    learningObjectives: [
      'Understand sleep timing consistency',
      'Master schedule adjustment techniques',
      'Learn to maintain timing through different scenarios'
    ],
    requirements: [
      {
        description: 'Fixed bedtime/wake time (±30 min window)',
        verificationMethod: 'sleep_tracker_data'
      },
      {
        description: 'Weekend consistency (no more than 1-hour deviation)',
        verificationMethod: 'sleep_tracker_data'
      },
      {
        description: 'Minimum 7 hours sleep opportunity',
        verificationMethod: 'sleep_tracker_data'
      }
    ],
    expertIds: ['walker'],
    implementationProtocol: {
      week1: 'Establish baseline and set target times',
      week2: 'Refine schedule and handle disruptions',
      week3: 'Master consistency and optimization'
    },
    verificationMethods: [
      {
        type: 'sleep_tracker_data',
        description: 'Sleep tracking verification',
        requiredFrequency: 'daily'
      }
    ],
    successMetrics: [
      '90% adherence to sleep/wake times',
      'Consistent weekend timing',
      'Improved sleep onset latency'
    ],
    expertTips: [
      '"The timing of sleep is nearly as important as the quantity" - Dr. Walker',
      'Start with your wake time and work backwards',
      'Use morning light to anchor your rhythm'
    ],
    fuelPoints: 50,
    status: 'available',
    category: 'Sleep'
  },
  {
    id: 'sc2',
    name: 'Recovery Environment Setup',
    tier: 1,
    duration: 21,
    description: 'Create an optimal sleep environment that supports deep recovery by controlling key environmental factors that influence sleep quality.',
    expertReference: 'Dr. Kirk Parsley - Sleep environment optimization for recovery',
    learningObjectives: [
      'Understand environmental impact on sleep quality',
      'Master temperature regulation for sleep',
      'Optimize light and sound control'
    ],
    requirements: [
      {
        description: 'Temperature optimization (65-67°F/18-19°C)',
        verificationMethod: 'environment_logs'
      },
      {
        description: 'Complete darkness during sleep',
        verificationMethod: 'environment_logs'
      },
      {
        description: 'Noise reduction/masking',
        verificationMethod: 'environment_logs'
      }
    ],
    expertIds: ['parsley'],
    implementationProtocol: {
      week1: 'Assessment and baseline setup',
      week2: 'Fine-tune environmental controls',
      week3: 'Optimize and maintain conditions'
    },
    verificationMethods: [
      {
        type: 'environment_logs',
        description: 'Environment tracking verification',
        requiredFrequency: 'daily'
      }
    ],
    successMetrics: [
      'Consistent temperature maintenance',
      'Complete darkness achievement',
      'Reduced environmental disruptions'
    ],
    expertTips: [
      '"Your bedroom should be a cave: cool, dark, and quiet" - Dr. Parsley',
      'Test different temperatures within range',
      'Use blackout solutions for complete darkness'
    ],
    fuelPoints: 50,
    status: 'available',
    category: 'Sleep'
  },
  {
    id: 'sc3',
    name: 'Evening Wind-Down Protocol',
    tier: 1,
    duration: 21,
    description: 'Develop a comprehensive evening routine that prepares your body and mind for optimal sleep.',
    expertReference: 'Dr. Matthew Walker & Dr. Kirk Parsley - Evening routine optimization',
    learningObjectives: [
      'Understand sleep pressure and wind-down importance',
      'Master digital sunset techniques',
      'Develop effective relaxation practices'
    ],
    requirements: [
      {
        description: '2-hour pre-sleep routine',
        verificationMethod: 'evening_routine_logs'
      },
      {
        description: 'Complete screen elimination 90 minutes before bed',
        verificationMethod: 'device_tracking'
      },
      {
        description: 'Structured relaxation practice',
        verificationMethod: 'practice_logs'
      }
    ],
    expertIds: ['walker', 'parsley'],
    implementationProtocol: {
      week1: 'Establish basic routine framework',
      week2: 'Add relaxation techniques',
      week3: 'Optimize and personalize protocol'
    },
    verificationMethods: [
      {
        type: 'evening_routine_logs',
        description: 'Evening routine verification',
        requiredFrequency: 'daily'
      }
    ],
    successMetrics: [
      '90% routine completion rate',
      'Screen-free success rate',
      'Reduced sleep onset time'
    ],
    expertTips: [
      '"The power of routine is in its predictability" - Dr. Walker',
      'Begin with light stretching or reading',
      'Maintain routine even on weekends'
    ],
    fuelPoints: 50,
    status: 'available',
    category: 'Sleep'
  }
];