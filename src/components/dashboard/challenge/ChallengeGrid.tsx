import { useState, useEffect } from 'react';
import { Award,History, Target } from 'lucide-react';
import { Card } from '../../ui/card';
import { ChallengeCard } from './ChallengeCard';
import { ChallengeLibrary } from './ChallengeLibrary';
import { challenges } from '../../../data';
import { RecommendedChallenges } from './RecommendedChallenges';
import { CompletedChallengesModal } from './CompletedChallengesModal';
import { useChallengeManager } from '../../../hooks/useChallengeManager';
import { useCompletedActivities } from '../../../hooks/useCompletedActivities';
import { quests } from '../../../data';
import { Quest } from '../../../types/game';

interface ChallengeGridProps {
  userId: string | undefined;
  categoryScores: Record<string, number>;
}

export function ChallengeGrid({ userId, categoryScores }: ChallengeGridProps) {
  const [showLibrary, setShowLibrary] = useState(false);
  const [recommendedChallenges, setRecommendedChallenges] = useState<string[]>([]);
  const [activeQuestDetails, setActiveQuestDetails] = useState<Quest | null>(null);
  const [showCompletedChallenges, setShowCompletedChallenges] = useState(false);
  const { data: completedActivities } = useCompletedActivities(userId);
  const {
    activeChallenges, 
    loading, 
    startChallenge, 
    cancelChallenge
  } = useChallengeManager(userId);

  // Calculate non-premium active challenges count
  const nonPremiumChallengesCount = activeChallenges.filter(c => 
    !challenges.find(ch => ch.id === c.challenge_id)?.isPremium
  ).length;

  // Listen for quest selection events
  useEffect(() => {
    // Listen for openChallengeLibrary event
    const handleOpenLibrary = () => {
      setShowLibrary(true);
    };

    window.addEventListener('openChallengeLibrary', handleOpenLibrary);

    const handleQuestSelected = (event: CustomEvent) => {
      const { questId, challengeIds } = event.detail;
      const questDetails = quests.find(q => q.id === questId);
      if (questDetails) {
        setRecommendedChallenges(challengeIds || []);
        setActiveQuestDetails(questDetails);
      }
    };

    const handleQuestCanceled = () => {
      setRecommendedChallenges([]);
      setActiveQuestDetails(null);
    };

    window.addEventListener('questSelected', handleQuestSelected as EventListener);
    window.addEventListener('questCanceled', handleQuestCanceled as EventListener);

    return () => {
      window.removeEventListener('openChallengeLibrary', handleOpenLibrary);
      window.removeEventListener('questSelected', handleQuestSelected as EventListener);
      window.removeEventListener('questCanceled', handleQuestCanceled as EventListener);
    };
  }, [setRecommendedChallenges, setActiveQuestDetails]);

  const maxChallenges = 2;
  const activeChallengeCount = activeChallenges.length;

  if (loading && activeChallenges.length === 0) {
    return (
      <Card className="animate-pulse">
        <div className="h-32 bg-gray-700/50 rounded-lg"></div>
      </Card>
    );
  }
  
  return (
    <div  id="challenges" className="space-y-4 scroll-mt-20">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white">Challenges</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            {nonPremiumChallengesCount}/2 Challenges
            {activeChallenges.length - nonPremiumChallengesCount > 0 && (
              <span className="text-xs text-gray-500 ml-1">(+{activeChallenges.length - nonPremiumChallengesCount} Contest)</span>
            )}
          </span>
          <button
            onClick={() => setShowLibrary(true)}
            className="text-sm text-orange-500 hover:text-orange-400"
          >
            View All
          </button>
        </div>
      </div>
      
      {/* Active Challenges */}
      {activeChallenges.length > 0 ? (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Target className="text-orange-500" size={20} />
              <h3 className="text-sm font-medium text-white">Active Challenges</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeChallenges.map(challenge => {
              // Find full challenge details including isPremium flag
              const challengeDetails = challenges.find(c => c.id === challenge.challenge_id);
              const enrichedChallenge = {
                ...challenge,
                isPremium: challengeDetails?.isPremium || false
              };
              
              return (
                <ChallengeCard
                  userId={userId}
                  key={`${challenge.id}-${challenge.name}`}
                  challenge={enrichedChallenge}
                  activeQuest={activeQuestDetails}
                  onCancel={(challengeId) => cancelChallenge(challengeId)}
                />
              );
            })}
          </div>
        </Card>
      ) : (
        <Card className="relative">
          <div className="flex flex-col items-center justify-center py-2.5 space-y-1.5">
            <div className="flex items-center gap-2">
              <Award className="text-orange-500" size={24} />
              <h3 className="text-lg font-medium text-white">No Active Challenges</h3>
            </div>
            <button
              onClick={() => setShowLibrary(true)}
              className="flex items-center gap-2 px-3.5 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Award size={16} />
              Select a Challenge
            </button>
          </div>
        </Card>
      )}
      
      {/* Show Recommended Challenges if there's an active quest */}
      {activeQuestDetails && recommendedChallenges.length > 0 && activeChallengeCount < maxChallenges && (
        <RecommendedChallenges
          challengeIds={recommendedChallenges}
          onStartChallenge={startChallenge}
          currentChallenges={activeChallenges.map(c => ({ 
            challenge_id: c.challenge_id,
            status: c.status
          }))}
          activeChallengesCount={activeChallengeCount}
        />
      )}
      
      <div className="text-xs text-gray-400 italic text-center">
        Unlock More Challenges After Completion
      </div>
      
      {/* Completed Challenges Section */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <Award className="text-orange-500" size={16} />
              <span>Completed Challenges ({completedActivities.challengesCompleted})</span>
            </h3>
          </div>
          <button
            onClick={() => setShowCompletedChallenges(true)}
            className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-400 transition-colors"
          >
            <History size={14} />
            <span>View History</span>
          </button>
        </div>
      </Card>

      {showCompletedChallenges && (
        <CompletedChallengesModal
          onClose={() => setShowCompletedChallenges(false)}
        />
      )}

      {showLibrary && (
        <ChallengeLibrary
          userId={userId}
          categoryScores={categoryScores}
          recommendedChallenges={activeQuestDetails?.challengeIds || []}
          currentChallenges={activeChallenges}
          onClose={() => setShowLibrary(false)}
          onStartChallenge={startChallenge}
          activeChallengesCount={activeChallenges.length}
        />
      )}
    </div>
  );
}