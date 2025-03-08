import { sleepChallenges } from './challenges/sleepChallenges';
import { mindsetChallenges } from './challenges/mindsetChallenges';
import { nutritionChallenges } from './challenges/nutritionChallenges';
import { exerciseChallenges } from './challenges/exerciseChallenges';
import { biohackingChallenges } from './challenges/biohackingChallenges';
import { contestChallenges } from './challenges/contestChallenges';
import { tier0Challenge } from './challenges/tier0Challenge';
import type { Challenge } from '../types/game';

// Export quests
export { quests } from './quests';

// Export boosts
export { boosts } from './boosts';

// Export experts
export { experts } from './experts';

// Export nutrition-specific items
export { nutritionQuests } from './quests/nutritionQuests';
export { nutritionChallenges } from './challenges/nutritionChallenges';

// Export contest challenges separately
export { contestChallenges };

// Export tier0Challenge separately
export { tier0Challenge };

// Combine all regular challenges
export const challenges: Challenge[] = [
  tier0Challenge,
  ...sleepChallenges,
  ...mindsetChallenges,
  ...nutritionChallenges,
  ...exerciseChallenges,
  ...biohackingChallenges,
  ...contestChallenges
];