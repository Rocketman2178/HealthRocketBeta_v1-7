import type { Challenge } from '../../types/game';

export const contestChallenges: Challenge[] = [
  {
    id: 'tc1',
    name: 'Oura Sleep Challenge',
    tier: 1,
    duration: 21,
    category: 'Sleep',
    description: `In every Premium Contest Challenge:

The top 10% performer(s) share 75% of the available reward pool, which could mean:

<div class="space-y-2 mt-2">
  <div class="flex items-start gap-2">
    <span class="text-orange-500 mt-1">•</span>
    <span class="text-orange-500">20 players: $450 each for top 2 players (6X return)</span>
  </div>
  <div class="flex items-start gap-2">
    <span class="text-orange-500 mt-1">•</span>
    <span class="text-orange-500">8 players: $360 for top player (4X return)</span>
  </div>
  <div class="flex items-start gap-2">
    <span class="text-orange-500 mt-1">•</span>
    <span class="text-orange-500">Plus: Score in the top 50% and earn your entry fee back</span>
  </div>
</div>`,
    expertReference: 'Health Rocket Team - Gamifying Health to Increase HealthSpan',
    learningObjectives: [
      'Master sleep optimization',
      'Develop consistent sleep tracking',
      'Build sleep-focused habits'
    ],
    requirements: [
      {
        description: 'Daily Oura Ring sleep score verification (40% of score)',
        verificationMethod: 'verification_posts',
        weight: 40
      },
      {
        description: 'Daily Sleep boost completion (40% of score)',
        verificationMethod: 'boost_completion',
        weight: 40
      },
      {
        description: 'Bonus points for the most nights above 85 Sleep Score (20% of score)',
        verificationMethod: 'bonus_points',
        weight: 20
      }
    ],
    implementationProtocol: {
      week1: 'Establish baseline sleep tracking and daily verification routine',
      week2: 'Focus on sleep score optimization and consistency',
      week3: 'Maximize high-quality sleep nights (85+ scores)'
    },
    howToPlay: {
      description: 'Join this premium contest to compete for prizes while optimizing your sleep quality:',
      steps: [
        'Register with $75 entry fee to secure your spot',
        'Post daily Oura Ring sleep score screenshots in the Challenge Chat',
        'Complete at least one Sleep category boost daily',
        'Aim for sleep scores above 85 for bonus points',
        'Track your progress on the leaderboard',
        'Top 10% share 75% of prize pool, top 50% get entry fee back'
      ]
    },
    relatedCategories:["Sleep"],
    successMetrics: [
      'Daily verification posts (0/21)',
      'Daily Sleep boosts (0/21)',
      'Bonus points for scores above 85'
    ],
    expertTips: [
      'Maintain consistent sleep/wake times',
      'Optimize bedroom temperature (65-67°F)',
      'Limit blue light exposure before bed',
      'Practice relaxation techniques',
      'Track and optimize your sleep latency'
    ],
    fuelPoints: 100,
    status: 'available',
    isPremium: true,
    entryFee: 75,
    minPlayers: 8,
    startDate: '2025-02-14T05:00:00.000Z'  // 12:00 AM EST = 5:00 AM UTC
  }
];