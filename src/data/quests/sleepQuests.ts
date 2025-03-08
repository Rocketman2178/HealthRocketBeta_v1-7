import type { Quest } from '../../types/game';

export const sleepQuests: Quest[] = [
  {
    id: 'sq1',
    tier: 1,
    name: 'Sleep Quality Foundation',
    focus: 'Basic sleep optimization',
    description: 'Establish fundamental sleep habits and environment optimization for consistent quality rest.',
    expertIds: ['walker', 'parsley'],
    challengeIds: ['sc1', 'sc2', 'sc3'],
    requirements: {
      challengesRequired: 2,
      dailyBoostsRequired: 45,
      prerequisites: []
    },
    verificationMethods: [
      {
        type: 'sleep_tracker_data',
        description: 'Sleep tracking verification',
        requiredFrequency: 'daily'
      }
    ],
    fuelPoints: 150,
    status: 'available',
    duration: 90,
    category: 'Sleep'
  },
  {
    id: 'sq2',
    tier: 1,
    name: 'Circadian Reset',
    focus: 'Rhythm optimization',
    description: 'Align daily activities with natural circadian rhythms for optimal sleep-wake cycles.',
    expertIds: ['hubermanMind', 'breus'],
    challengeIds: ['sc4', 'sc5', 'sc6'],
    requirements: {
      challengesRequired: 2,
      dailyBoostsRequired: 45,
      prerequisites: []
    },
    verificationMethods: [
      {
        type: 'daily_logs',
        description: 'Light exposure logs',
        requiredFrequency: 'daily'
      }
    ],
    fuelPoints: 150,
    status: 'available',
    duration: 90,
    category: 'Sleep'
  },
  {
    id: 'sq3',
    tier: 1,
    name: 'Recovery Foundation',
    focus: 'Basic recovery optimization',
    description: 'Establish fundamental recovery tracking and optimization protocols.',
    expertIds: ['parsley', 'pardi'],
    challengeIds: ['sc7', 'sc8', 'sc9'],
    requirements: {
      challengesRequired: 2,
      dailyBoostsRequired: 45,
      prerequisites: []
    },
    verificationMethods: [
      {
        type: 'sleep_tracker_data',
        description: 'Sleep tracking verification',
        requiredFrequency: 'daily'
      }
    ],
    fuelPoints: 150,
    status: 'available',
    duration: 90,
    category: 'Sleep'
  }
];