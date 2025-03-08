import type { Challenge } from '../../types/game';

export const exerciseChallenges: Challenge[] = [
  {
    id: 'ec1',
    name: 'Movement Pattern Mastery',
    tier: 1,
    duration: 21,
    description: 'Master fundamental movement patterns for optimal joint health and performance.',
    expertReference: 'Ben Patrick - Movement pattern optimization and joint health',
    learningObjectives: [
      'Understand movement mechanics',
      'Master basic patterns',
      'Develop joint control'
    ],
    requirements: [
      {
        description: 'Daily movement practice',
        verificationMethod: 'movement_logs'
      },
      {
        description: 'Pattern progression',
        verificationMethod: 'pattern_logs'
      },
      {
        description: 'Joint preparation',
        verificationMethod: 'joint_logs'
      }
    ],
    expertIds: ['patrick'],
    implementationProtocol: {
      week1: 'Movement assessment and baseline',
      week2: 'Pattern development and control',
      week3: 'Integration and flow mastery'
    },
    verificationMethods: [
      {
        type: 'movement_logs',
        description: 'Movement pattern verification',
        requiredFrequency: 'daily'
      }
    ],
    successMetrics: [
      'Movement quality score >85%',
      'Joint mobility improvements',
      'Pattern mastery assessment'
    ],
    expertTips: [
      '"Quality movement precedes loading" - Ben Patrick',
      'Focus on control before speed',
      'Build systematic progression'
    ],
    fuelPoints: 50,
    status: 'available',
    category: 'Exercise'
  },
  {
    id: 'ec2',
    name: 'Joint Health Protocol',
    tier: 1,
    duration: 21,
    description: 'Develop comprehensive joint health through strategic mobility and stability work.',
    expertReference: 'Ben Patrick - Joint health optimization and mobility development',
    learningObjectives: [
      'Master joint preparation',
      'Optimize mobility work',
      'Develop stability systems'
    ],
    requirements: [
      {
        description: 'Sauna protocols',
        verificationMethod: 'sauna_logs'
      },
      {
        description: 'Temperature tracking',
        verificationMethod: 'temp_logs'
      },
      {
        description: 'Recovery monitoring',
        verificationMethod: 'recovery_logs'
      }
    ],
    expertIds: ['patrick'],
    implementationProtocol: {
      week1: 'Baseline assessment',
      week2: 'Protocol progression',
      week3: 'Advanced integration'
    },
    verificationMethods: [
      {
        type: 'joint_logs',
        description: 'Joint health verification',
        requiredFrequency: 'daily'
      }
    ],
    successMetrics: [
      'Protocol completion rate',
      'Heat tolerance improvement',
      'Recovery enhancement'
    ],
    expertTips: [
      '"Heat adaptation requires progression" - Ben Patrick',
      'Monitor all variables',
      'Track recovery patterns'
    ],
    fuelPoints: 50,
    status: 'available',
    category: 'Exercise'
  },
  {
    id: 'ec3',
    name: 'Basic Strength Foundation',
    tier: 1,
    duration: 21,
    description: 'Establish foundational strength practices through proper movement patterns.',
    expertReference: 'Dr. Andy Galpin - Foundational strength development and movement mastery',
    learningObjectives: [
      'Master basic lifts',
      'Develop movement quality',
      'Build strength foundation'
    ],
    requirements: [
      {
        description: 'Pattern practice',
        verificationMethod: 'pattern_logs'
      },
      {
        description: 'Progressive loading',
        verificationMethod: 'loading_logs'
      },
      {
        description: 'Form mastery',
        verificationMethod: 'form_logs'
      }
    ],
    expertIds: ['galpin'],
    implementationProtocol: {
      week1: 'Movement pattern mastery',
      week2: 'Loading progression',
      week3: 'Integration practice'
    },
    verificationMethods: [
      {
        type: 'strength_logs',
        description: 'Strength development verification',
        requiredFrequency: 'daily'
      }
    ],
    successMetrics: [
      'Form mastery score >90%',
      'Strength progression rate',
      'Recovery optimization'
    ],
    expertTips: [
      '"Form mastery enables progress" - Dr. Galpin',
      'Build systematic loading',
      'Monitor recovery capacity'
    ],
    fuelPoints: 50,
    status: 'available',
    category: 'Exercise'
  }
];