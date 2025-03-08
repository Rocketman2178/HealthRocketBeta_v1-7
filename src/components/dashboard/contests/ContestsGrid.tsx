import { useState, useEffect } from 'react';
import { Award, History, Target } from 'lucide-react';
import { Card } from '../../ui/card';
import { ChallengeCard } from '../challenge/ChallengeCard';
import { ContestLibrary } from './ContestLibrary';
import { contestChallenges } from '../../../data/challenges/contestChallenges';
import { CompletedChallengesModal } from '../challenge/CompletedChallengesModal';
import { useChallengeManager } from '../../../hooks/useChallengeManager';
import { useCompletedActivities } from '../../../hooks/useCompletedActivities';

interface ContestsGridProps {
  userId: string | undefined;
  categoryScores: Record<string, number>;
}

export function ContestsGrid({ userId, categoryScores }: ContestsGridProps) {
  const [showLibrary, setShowLibrary] = useState(false);
  const [showCompletedContests, setShowCompletedContests] = useState(false);
  const { data: completedActivities } = useCompletedActivities(userId);
  const {
    activeChallenges,
    loading,
    startChallenge,
    cancelChallenge
  } = useChallengeManager(userId);

  // Filter for contest challenges only
  const activeContests = activeChallenges.filter(c => {
    const contestDetails = contestChallenges.find(ch => 
      ch.id === c.challenge_id || ch.id === c.id
    );
    return !!contestDetails;
  });

  if (loading && activeContests.length === 0) {
    return (
      <Card className="animate-pulse">
        <div className="h-32 bg-gray-700/50 rounded-lg"></div>
      </Card>
    );
  }

  return (
    <div id="contests" className="space-y-4 scroll-mt-20">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white">Contests</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{activeContests.length} Active</span>
          <button
            onClick={() => setShowLibrary(true)}
            className="text-sm text-orange-500 hover:text-orange-400"
          >
            View All
          </button>
        </div>
      </div>

      {/* Active Contests */}
      {activeContests.length > 0 ? (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Target className="text-orange-500" size={20} />
              <h3 className="text-sm font-medium text-white">Active Contests</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeContests.map(contest => {
              const contestDetails = contestChallenges.find(c => 
                c.id === contest.challenge_id || c.id === contest.id
              );
              const enrichedContest = {
                ...contest,
                isPremium: contestDetails?.isPremium || false,
                entryFee: contestDetails?.entryFee || 0,
                category: 'Contests'
              };

              return (
                <ChallengeCard
                  userId={userId}
                  key={`${contest.id}-${contest.name}`}
                  challenge={enrichedContest}
                  onCancel={(contestId) => cancelChallenge(contestId)}
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
              <h3 className="text-lg font-medium text-white">No Active Contests</h3>
            </div>
            <button
              onClick={() => setShowLibrary(true)}
              className="flex items-center gap-2 px-3.5 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Award size={16} />
              Join a Contest
            </button>
          </div>
        </Card>
      )}

      {/* Completed Contests Section */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <Award className="text-orange-500" size={16} />
              <span>Completed Contests</span>
            </h3>
          </div>
          <button
            onClick={() => setShowCompletedContests(true)}
            className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-400 transition-colors"
          >
            <History size={14} />
            <span>View History</span>
          </button>
        </div>
      </Card>

      {showCompletedContests && (
        <CompletedChallengesModal
          onClose={() => setShowCompletedContests(false)}
        />
      )}

      {showLibrary && (
        <ContestLibrary
          userId={userId}
          categoryScores={categoryScores}
          currentChallenges={activeChallenges}
          onClose={() => setShowLibrary(false)}
          onStartChallenge={startChallenge}
          activeChallengesCount={activeContests.length}
        />
      )}
    </div>
  );
}