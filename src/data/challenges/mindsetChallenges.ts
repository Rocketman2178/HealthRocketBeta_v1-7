import type { Challenge } from '../../types/game';

export const mindsetChallenges: Challenge[] = [
  {
    id: 'mc1',
    name: 'Focus Protocol Development',
    tier: 1,
    duration: 21,
    description: 'Establish a systematic approach to enhancing focus and cognitive performance through structured protocols and environmental optimization.',
    expertReference: 'Dr. Andrew Huberman - Focus enhancement and neural state optimization',
    learningObjectives: [
      'Understand focus mechanism',
      'Master attention control',
      'Develop sustained concentration'
    ],
    requirements: [
      {
        description: 'Daily focus blocks (starting at 25 minutes)',
        verificationMethod: 'focus_session_logs'
      },
      {
        description: 'Environment optimization',
        verificationMethod: 'environment_logs'
      }
    ],
    expertIds: ['hubermanMind'],
    implementationProtocol: {
      week1: 'Baseline assessment and setup',
      week2: 'Protocol refinement',
      week3: 'Advanced implementation'
    },
    verificationMethods: [
      {
        type: 'focus_session_logs',
        description: 'Focus tracking verification',
        requiredFrequency: 'daily'
      }
    ],
    successMetrics: [
      'Increased focus duration',
      'Reduced distractions',
      'Improved task completion'
    ],
    expertTips: [
      '"Focus is a skill that requires progressive training" - Dr. Huberman',
      'Start with shorter sessions',
      'Build systematic progression'
    ],
    fuelPoints: 50,
    status: 'available',
    category: 'Mindset'
  },
  {
    id: 'mc2',
    name: 'Meditation Foundation',
    tier: 1,
    duration: 21,
    description: 'Build a solid foundation in mindfulness meditation practice, focusing on awareness, presence, and mental clarity.',
    expertReference: 'Sam Harris - Meditation fundamentals and awareness training',
    learningObjectives: [
      'Understand meditation basics',
      'Develop consistent practice',
      'Master basic techniques'
    ],
    requirements: [
      {
        description: 'Daily meditation practice',
        verificationMethod: 'meditation_logs'
      },
      {
        description: 'Progressive duration increase',
        verificationMethod: 'practice_logs'
      }
    ],
    expertIds: ['harris'],
    implementationProtocol: {
      week1: 'Basic technique introduction',
      week2: 'Practice stabilization',
      week3: 'Technique refinement'
    },
    verificationMethods: [
      {
        type: 'meditation_logs',
        description: 'Practice verification',
        requiredFrequency: 'daily'
      }
    ],
    successMetrics: [
      'Practice consistency',
      'Duration increases',
      'Technique proficiency'
    ],
    expertTips: [
      '"Consistency matters more than duration" - Sam Harris',
      'Focus on quality over quantity',
      'Build systematic practice'
    ],
    fuelPoints: 50,
    status: 'available',
    category: 'Mindset'
  },
  {
    id: 'mc3',
    name: 'Morning Mindset Protocol',
    tier: 1,
    duration: 21,
    description: 'Develop a comprehensive morning routine that sets up optimal mental states and emotional resilience for peak daily performance.',
    expertReference: 'Tony Robbins - Peak state activation and emotional mastery',
    learningObjectives: [
      'Master state management',
      'Develop morning discipline',
      'Create success patterns'
    ],
    requirements: [
      {
        description: 'Structured morning routine',
        verificationMethod: 'routine_logs'
      },
      {
        description: 'State priming exercises',
        verificationMethod: 'practice_logs'
      }
    ],
    expertIds: ['robbins'],
    implementationProtocol: {
      week1: 'Routine establishment',
      week2: 'State mastery',
      week3: 'Protocol optimization'
    },
    verificationMethods: [
      {
        type: 'routine_logs',
        description: 'Morning routine verification',
        requiredFrequency: 'daily'
      }
    ],
    successMetrics: [
      'Routine adherence',
      'State improvement',
      'Energy optimization'
    ],
    expertTips: [
      '"Your morning creates your day" - Tony Robbins',
      'Start with basic components',
      'Build progressive complexity'
    ],
    fuelPoints: 50,
    status: 'available',
    category: 'Mindset'
  }
];