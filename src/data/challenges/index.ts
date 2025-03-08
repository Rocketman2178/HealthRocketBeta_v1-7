import { sleepChallenges } from './sleepChallenges';
import { mindsetChallenges } from './mindsetChallenges';
import { nutritionChallenges } from './nutritionChallenges';
import { exerciseChallenges } from './exerciseChallenges';
import { biohackingChallenges } from './biohackingChallenges';
import { contestChallenges } from './contestChallenges';
import { tier0Challenge } from './tier0Challenge';
import type { Challenge } from '../../types/game';

// Export contest challenges separately
export { contestChallenges };

// Export tier0Challenge separately
export { tier0Challenge };

// Export all challenges including Tier 0
export const challenges: Challenge[] = [
  tier0Challenge,
  ...sleepChallenges,
  ...mindsetChallenges,
  ...nutritionChallenges,
  ...exerciseChallenges,
  ...biohackingChallenges
];