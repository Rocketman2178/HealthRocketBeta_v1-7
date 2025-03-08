import type { Challenge } from '../../types/game';

export const biohackingChallenges: Challenge[] = [
  // Tier 1 Challenges
  {
    id: 'bc1',
    name: 'Cold Adaptation',
    tier: 1,
    duration: 21,
    description: 'Master progressive cold exposure for enhanced recovery and resilience.',
    expertReference: 'Ben Greenfield - Cold exposure optimization and adaptation protocols',
    learningObjectives: [
      'Understand cold adaptation',
      'Master exposure protocols',
      'Develop systematic progression'
    ],
    requirements: [
      {
        description: 'Daily cold exposure',
        verificationMethod: 'exposure_logs'
      },
      {
        description: 'Temperature monitoring',
        verificationMethod: 'temp_logs'
      },
      {
        description: 'Response tracking',
        verificationMethod: 'response_logs'
      }
    ],
    expertIds: ['greenfield'],
    implementationProtocol: {
      week1: 'Baseline assessment and gradual exposure',
      week2: 'Protocol progression and adaptation',
      week3: 'Advanced integration and optimization'
    },
    verificationMethods: [
      {
        type: 'cold_exposure_logs',
        description: 'Cold exposure verification',
        requiredFrequency: 'daily'
      }
    ],
    successMetrics: [
      'Exposure duration targets',
      'Temperature adaptation scores',
      'Recovery enhancement metrics'
    ],
    expertTips: [
      '"Cold builds resilience systematically" - Ben Greenfield',
      'Progress gradually',
      'Monitor recovery markers'
    ],
    fuelPoints: 50,
    status: 'available',
    category: 'Biohacking'
  },
  {
    id: 'bc2',
    name: 'HRV Training',
    tier: 1,
    duration: 21,
    description: 'Develop HRV optimization through strategic protocols and monitoring.',
    expertReference: 'Dr. Molly Maloof - HRV optimization and stress resilience',
    learningObjectives: [
      'Master HRV monitoring',
      'Optimize stress response',
      'Develop adaptation protocols'
    ],
    requirements: [
      {
        description: 'Daily HRV tracking',
        verificationMethod: 'hrv_logs'
      },
      {
        description: 'Response monitoring',
        verificationMethod: 'response_logs'
      },
      {
        description: 'Protocol implementation',
        verificationMethod: 'protocol_logs'
      }
    ],
    expertIds: ['maloof'],
    implementationProtocol: {
      week1: 'Baseline tracking and assessment',
      week2: 'Intervention testing',
      week3: 'Protocol optimization'
    },
    verificationMethods: [
      {
        type: 'hrv_logs',
        description: 'HRV training verification',
        requiredFrequency: 'daily'
      }
    ],
    successMetrics: [
      'HRV improvement trends',
      'Response optimization',
      'Protocol effectiveness'
    ],
    expertTips: [
      '"HRV reflects system resilience" - Dr. Maloof',
      'Focus on trends',
      'Monitor all variables'
    ],
    fuelPoints: 50,
    status: 'available',
    category: 'Biohacking'
  },
  {
    id: 'bc3',
    name: 'Red Light Therapy',
    tier: 1,
    duration: 21,
    description: 'Optimize recovery through strategic red light exposure protocols.',
    expertReference: 'Dave Asprey - Red light therapy optimization and timing',
    learningObjectives: [
      'Master light therapy',
      'Optimize exposure timing',
      'Develop strategic protocols'
    ],
    requirements: [
      {
        description: 'Daily light sessions',
        verificationMethod: 'session_logs'
      },
      {
        description: 'Timing optimization',
        verificationMethod: 'timing_logs'
      },
      {
        description: 'Response tracking',
        verificationMethod: 'response_logs'
      }
    ],
    expertIds: ['asprey'],
    implementationProtocol: {
      week1: 'Protocol establishment',
      week2: 'Timing optimization',
      week3: 'System integration'
    },
    verificationMethods: [
      {
        type: 'light_therapy_logs',
        description: 'Light therapy verification',
        requiredFrequency: 'daily'
      }
    ],
    successMetrics: [
      'Session adherence >90%',
      'Response optimization',
      'Recovery enhancement'
    ],
    expertTips: [
      '"Timing amplifies effectiveness" - Dave Asprey',
      'Monitor response patterns',
      'Track all variables'
    ],
    fuelPoints: 50,
    status: 'available',
    category: 'Biohacking'
  }
];