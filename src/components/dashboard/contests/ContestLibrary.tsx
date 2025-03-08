import React from 'react';
import { X, Award, Zap, ChevronDown, ChevronUp, Brain, Moon, Activity, Apple, Database, Clock, CheckCircle2, Calendar, Target } from 'lucide-react';
import { ContestDetails } from './ContestDetails';
import { Progress } from '../../ui/progress';
import { challenges } from '../../../data';
import { supabase } from '../../../lib/supabase';
import { formatInTimeZone } from 'date-fns-tz';
import { contestChallenges } from '../../../data/challenges/contestChallenges';
import type { Challenge } from '../../../types/dashboard';

interface ContestLibraryProps {
  userId: string | undefined;
  categoryScores: Record<string, number>;
  onClose: () => void;
  currentChallenges: Challenge[];
  onStartChallenge: (challengeId: string) => Promise<void>;
  activeChallengesCount: number;
}

export function ContestLibrary({ 
  userId, 
  categoryScores, 
  onClose,
  currentChallenges,
  onStartChallenge,
  activeChallengesCount
}: ContestLibraryProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [selectedContest, setSelectedContest] = React.useState<Challenge | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [contests, setContests] = React.useState<Challenge[]>([]);
  const [error, setError] = React.useState<Error | null>(null);

  // Fetch upcoming contests on mount
  React.useEffect(() => {
    const fetchUpcomingContests = async () => {
      try {
        setError(null);
        const { data, error } = await supabase.rpc('get_upcoming_contests', {
          p_limit: 10
        });
        if (error) throw error;

        // Create a map for more efficient duplicate detection
        const uniqueContests = new Map();

        // Map contest data to challenges and eliminate duplicates in a single pass
        data.forEach(contest => {
          const contestDetails = contestChallenges.find(c => c.id === contest.challenge_id);
          if (contestDetails && !uniqueContests.has(contest.challenge_id)) {
            uniqueContests.set(contest.challenge_id, {
              ...contestDetails,
              id: contest.challenge_id,
              startDate: contest.start_date,
              entryFee: contest.entry_fee,
              minPlayers: contest.min_players,
              category: contest.health_category
            });
          }
        });

        // Convert map values to array
        setContests(Array.from(uniqueContests.values()));
      } catch (err) {
        console.error('Error fetching upcoming contests:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch contests'));
      }
    };

    fetchUpcomingContests();
  }, []);

  // Get all available contests from data files
  const availableContests = React.useMemo(() => {
    return contestChallenges
      .map(contest => ({
        ...contest,
        status: 'available'
      }));
  }, []);

  React.useEffect(() => {
    setLoading(false);
  }, [userId]);

  const categories = [
    { id: 'mindset', name: 'Mindset', icon: Brain },
    { id: 'sleep', name: 'Sleep', icon: Moon },
    { id: 'exercise', name: 'Exercise', icon: Activity },
    { id: 'nutrition', name: 'Nutrition', icon: Apple },
    { id: 'biohacking', name: 'Biohacking', icon: Database }
  ];

  const filteredContests = React.useMemo(() => {
    if (!selectedCategory) return contests;
    return contests.filter(contest => 
      contest.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [selectedCategory, contests]);

  const renderContest = (contest: Challenge) => {
    const startDate = contest.startDate ? new Date(contest.startDate) : null;
    const hasStarted = startDate ? startDate <= new Date() : true;
    const isRegistered = currentChallenges.some(c => 
      c.challenge_id === contest.id || c.challenge_id === contest.challenge_id
    );

    return (
      <div className="w-full text-left p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <Zap className="text-orange-500" size={14} />
            <span className="text-sm font-medium">+{contest.fuelPoints} FP</span>
            <span className={`text-xs px-2 py-0.5 rounded ${
              contest.entryFee ? 'bg-orange-500/10 text-orange-500' : 'bg-lime-500/10 text-lime-500'
            }`}>
              {contest.entryFee ? `Entry Fee: $${contest.entryFee}` : 'Free Entry'}
            </span>
          </div>
        </div>
        <h3 className="font-bold text-white">{contest.name}</h3>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-orange-500" />
            <span className="text-sm text-gray-400">{contest.category}</span>
          </div>
          {startDate && (
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-orange-500" />
              <span className="text-sm text-gray-400">
                {formatInTimeZone(startDate, 'America/New_York', 'M/d/yyyy')}
              </span>
            </div>
          )}
          {isRegistered && (
            <span className="text-xs bg-lime-500/20 px-2 py-0.5 rounded text-lime-500">
              Registered
            </span>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-white"></div>
      </div>
    );
  }

  const handleStartContest = async (contestId: string) => {
    try {
      setLoading(true);
      await onStartChallenge(contestId);
      onClose();
    } catch (err) {
      console.error('Failed to start contest', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Target className="text-orange-500" size={20} />
            <div>
              <h2 className="text-xl font-bold text-white">Available Contests</h2>
              <p className="text-sm text-gray-300 mt-1">Select a Category to Explore</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 p-4 border-b border-gray-700">
          {categories.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedCategory(selectedCategory === id ? null : id)}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors text-center ${
                selectedCategory === id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Icon size={16} />
              <span className="text-xs">{name}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Show upcoming contests first when no category selected */}
          {!selectedCategory && contests.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Upcoming Contests</h3>
              <div className="space-y-3">
                {contests.map(contest => (
                  <div
                    key={contest.id}
                    onClick={() => setSelectedContest(contest)}
                    className="bg-gray-700/50 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700/70 transition-colors"
                  >
                    {renderContest(contest)}
                  </div>
                ))}
              </div>
            </div>
          )}

          { selectedCategory && filteredContests.map(contest => (
            <div
              key={contest.id}
              onClick={() => setSelectedContest(contest)}
              className="bg-gray-700/50 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700/70 transition-colors"
            >
              {renderContest(contest)}
            </div>
          ))}
        </div>
      </div>

      {selectedContest && (
        <ContestDetails
          contest={selectedContest}
          onClose={() => setSelectedContest(null)}
          onStart={() => handleStartContest(selectedContest.id)}
          activeChallengesCount={activeChallengesCount}
          maxChallenges={2}
          currentChallenges={currentChallenges.map(c => ({
            challenge_id: c.challenge_id,
            status: c.status
          }))}
        />
      )}
    </div>
  );
}