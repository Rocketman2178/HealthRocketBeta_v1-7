import type { Quest } from '../../types/game';

export const nutritionQuests: Quest[] = [
  // Tier 1 Quests
  {
    id: 'nq1',
    tier: 1,
    name: 'Metabolic Health Master',
    focus: 'Basic metabolic optimization',
    description: 'Establish fundamental nutrition practices and metabolic health protocols.',
    expertIds: ['means', 'hyman'],
    challengeIds: ['nc1', 'nc2', 'nc3'],
    requirements: {
      challengesRequired: 2,
      dailyBoostsRequired: 45,
      prerequisites: []
    },
    verificationMethods: [
      {
        type: 'daily_logs',
        description: 'Glucose monitoring data',
        requiredFrequency: 'daily'
      }
    ],
    fuelPoints: 150,
    status: 'available',
    duration: 90,
    category: 'Nutrition'
  },
  {
    id: 'nq2',
    tier: 1,
    name: 'Anti-Inflammatory Foundation',
    focus: 'Inflammation reduction',
    description: 'Develop fundamental anti-inflammatory nutrition practices and monitoring protocols.',
    expertIds: ['gundry', 'kresser'],
    challengeIds: ['nc4', 'nc5', 'nc6'],
    requirements: {
      challengesRequired: 2,
      dailyBoostsRequired: 45,
      prerequisites: []
    },
    verificationMethods: [
      {
        type: 'daily_logs',
        description: 'Food elimination logs',
        requiredFrequency: 'daily'
      }
    ],
    fuelPoints: 150,
    status: 'available',
    duration: 90,
    category: 'Nutrition'
  },
  {
    id: 'nq3',
    tier: 1,
    name: 'Performance Nutrition Foundation',
    focus: 'Performance optimization',
    description: 'Establish fundamental performance nutrition practices and timing protocols.',
    expertIds: ['patrick', 'means'],
    challengeIds: ['nc7', 'nc8', 'nc9'],
    requirements: {
      challengesRequired: 2,
      dailyBoostsRequired: 45,
      prerequisites: []
    },
    verificationMethods: [
      {
        type: 'daily_logs',
        description: 'Protein timing logs',
        requiredFrequency: 'daily'
      }
    ],
    fuelPoints: 150,
    status: 'available',
    duration: 90,
    category: 'Nutrition'
  }
];