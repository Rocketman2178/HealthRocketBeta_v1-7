import type { Quest } from '../../types/game';

export const exerciseQuests: Quest[] = [
  // Tier 1 Quests
  {
    id: 'eq1',
    tier: 1,
    name: 'Movement Foundation',
    focus: 'Basic movement quality',
    description: 'Establish fundamental movement patterns and joint health protocols.',
    expertIds: ['patrick', 'galpin'],
    challengeIds: ['ec1', 'ec2', 'ec3'],
    requirements: {
      challengesRequired: 2,
      dailyBoostsRequired: 45,
      prerequisites: []
    },
    verificationMethods: [
      {
        type: 'daily_logs',
        description: 'Movement screening videos',
        requiredFrequency: 'daily'
      }
    ],
    fuelPoints: 150,
    status: 'available',
    duration: 90,
    category: 'Exercise'
  },
  {
    id: 'eq2',
    tier: 1,
    name: 'Performance Foundation',
    focus: 'Basic performance development',
    description: 'Establish fundamental performance practices through progressive protocols.',
    expertIds: ['attia', 'galpin'],
    challengeIds: ['ec4', 'ec5', 'ec6'],
    requirements: {
      challengesRequired: 2,
      dailyBoostsRequired: 45,
      prerequisites: []
    },
    verificationMethods: [
      {
        type: 'daily_logs',
        description: 'Heart rate data',
        requiredFrequency: 'daily'
      }
    ],
    fuelPoints: 150,
    status: 'available',
    duration: 90,
    category: 'Exercise'
  },
  {
    id: 'eq3',
    tier: 1,
    name: 'Recovery Foundation',
    focus: 'Basic recovery optimization',
    description: 'Establish foundational recovery practices and monitoring protocols.',
    expertIds: ['lyon', 'attia'],
    challengeIds: ['ec7', 'ec8', 'ec9'],
    requirements: {
      challengesRequired: 2,
      dailyBoostsRequired: 45,
      prerequisites: []
    },
    verificationMethods: [
      {
        type: 'daily_logs',
        description: 'Recovery metrics',
        requiredFrequency: 'daily'
      }
    ],
    fuelPoints: 150,
    status: 'available',
    duration: 90,
    category: 'Exercise'
  }
];