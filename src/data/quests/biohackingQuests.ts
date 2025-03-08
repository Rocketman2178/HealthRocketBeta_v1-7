import type { Quest } from '../../types/game';

export const biohackingQuests: Quest[] = [
  // Tier 1 Quests
  {
    id: 'bq1',
    tier: 1,
    name: 'Recovery Tech Master',
    focus: 'Basic recovery optimization',
    description: 'Establish fundamental recovery technology practices and protocols.',
    expertIds: ['asprey', 'greenfield'],
    challengeIds: ['bc1', 'bc2', 'bc3'],
    requirements: {
      challengesRequired: 2,
      dailyBoostsRequired: 45,
      prerequisites: []
    },
    verificationMethods: [
      {
        type: 'daily_logs',
        description: 'Temperature logs',
        requiredFrequency: 'daily'
      }
    ],
    fuelPoints: 150,
    status: 'available',
    duration: 90,
    category: 'Biohacking'
  },
  {
    id: 'bq2',
    tier: 1,
    name: 'Stress Resilience',
    focus: 'Stress management optimization',
    description: 'Develop fundamental stress resilience through technology and protocols.',
    expertIds: ['maloof', 'land'],
    challengeIds: ['bc4', 'bc5', 'bc6'],
    requirements: {
      challengesRequired: 2,
      dailyBoostsRequired: 45,
      prerequisites: []
    },
    verificationMethods: [
      {
        type: 'daily_logs',
        description: 'Temperature logs',
        requiredFrequency: 'daily'
      }
    ],
    fuelPoints: 150,
    status: 'available',
    duration: 90,
    category: 'Biohacking'
  },
  {
    id: 'bq3',
    tier: 1,
    name: 'Performance Technology',
    focus: 'Basic performance enhancement',
    description: 'Establish fundamental performance enhancement through strategic technology use.',
    expertIds: ['asprey', 'sinclair'],
    challengeIds: ['bc7', 'bc8', 'bc9'],
    requirements: {
      challengesRequired: 2,
      dailyBoostsRequired: 45,
      prerequisites: []
    },
    verificationMethods: [
      {
        type: 'daily_logs',
        description: 'Sleep metrics',
        requiredFrequency: 'daily'
      }
    ],
    fuelPoints: 150,
    status: 'available',
    duration: 90,
    category: 'Biohacking'
  }
];