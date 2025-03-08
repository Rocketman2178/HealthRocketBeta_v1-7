import type { Quest } from '../../types/game';

export const mindsetQuests: Quest[] = [
  {
    id: 'mq1',
    tier: 1,
    name: 'Mental Clarity Foundation',
    focus: 'Basic cognitive optimization',
    description: 'Establish fundamental mindset practices and cognitive enhancement protocols.',
    expertIds: ['hubermanMind', 'harris'],
    challengeIds: ['mc1', 'mc2', 'mc3'],
    requirements: {
      challengesRequired: 2,
      dailyBoostsRequired: 45,
      prerequisites: []
    },
    verificationMethods: [
      {
        type: 'daily_logs',
        description: 'Focus session logs',
        requiredFrequency: 'daily'
      }
    ],
    fuelPoints: 150,
    status: 'available',
    duration: 90,
    category: 'Mindset'
  },
  {
    id: 'mq2',
    tier: 1,
    name: 'Emotional Mastery',
    focus: 'Emotional intelligence and resilience',
    description: 'Develop advanced emotional control and resilience strategies.',
    expertIds: ['robbins', 'dispenza'],
    challengeIds: ['mc4', 'mc5', 'mc6'],
    requirements: {
      challengesRequired: 2,
      dailyBoostsRequired: 45,
      prerequisites: []
    },
    verificationMethods: [
      {
        type: 'daily_logs',
        description: 'State change logs',
        requiredFrequency: 'daily'
      }
    ],
    fuelPoints: 150,
    status: 'available',
    duration: 90,
    category: 'Mindset'
  },
  {
    id: 'mq3',
    tier: 1,
    name: 'Growth Mindset Integration',
    focus: 'Belief system optimization',
    description: 'Develop and integrate growth-oriented belief systems and practices.',
    expertIds: ['dweck', 'dispenza'],
    challengeIds: ['mc7', 'mc8', 'mc9'],
    requirements: {
      challengesRequired: 2,
      dailyBoostsRequired: 45,
      prerequisites: []
    },
    verificationMethods: [
      {
        type: 'daily_logs',
        description: 'Challenge logs',
        requiredFrequency: 'daily'
      }
    ],
    fuelPoints: 150,
    status: 'available',
    duration: 90,
    category: 'Mindset'
  }
];