import React, { useState } from 'react';
import { X, Award, Zap, Clock, Users, Trophy, AlertTriangle, Check } from 'lucide-react';
import { useStripe } from '../../../hooks/useStripe';
import { useSupabase } from '../../../contexts/SupabaseContext';
import { supabase } from '../../../lib/supabase';
import type { Challenge } from '../../../types/dashboard';

interface PremiumChallengeDetailsProps {
  challenge: Challenge;
  onClose: () => void;
  onStart: () => void;
  activeChallengesCount: number;
  maxChallenges: number;
  currentChallenges: { challenge_id: string; status: string; }[];
}

export function PremiumChallengeDetails({
  challenge,
  onClose,
  onStart,
  activeChallengesCount,
  maxChallenges,
  currentChallenges
}: PremiumChallengeDetailsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createSubscription } = useStripe();
  const { user } = useSupabase();
  const [registeredPlayers, setRegisteredPlayers] = useState<any[]>([]);
  const [isBetaTester, setIsBetaTester] = useState(false);

  // Calculate time until start
  const startDate = new Date(challenge.startDate);
  const now = new Date();
  const timeUntilStart = startDate.getTime() - now.getTime();
  const daysUntilStart = Math.ceil(timeUntilStart / (1000 * 60 * 60 * 24));

  // Check if already registered
  const isRegistered = currentChallenges.some(c => 
    c.challenge_id === challenge.id && c.status === 'registered'
  );

  // Fetch registered players
  React.useEffect(() => {
    const fetchRegisteredPlayers = async () => {
      const { data, error } = await supabase
        .from('premium_challenge_registrations')
        .select('user_id, users(name, avatar_url)')
        .eq('premium_challenge_id', challenge.id);

      if (!error && data) {
        setRegisteredPlayers(data);
      }
    };

    fetchRegisteredPlayers();
  }, [challenge.id]);

  // Check if user is beta tester
  React.useEffect(() => {
    const checkBetaStatus = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('users')
        .select('is_beta_tester')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setIsBetaTester(data.is_beta_tester);
      }
    };

    checkBetaStatus();
  }, [user]);

  const handleStartChallenge = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      if (isBetaTester) {
        // Beta testers can bypass payment
        onStart();
        return;
      }

      // Create Stripe Checkout session
      const result = await createSubscription('premium_challenge_tc1');
      
      if ('error' in result) {
        throw new Error(result.error);
      }

      // Redirect to Stripe Checkout
      window.location.href = result.sessionUrl;
    } catch (err) {
      console.error('Error starting challenge:', err);
      setError(err instanceof Error ? err.message : 'Failed to start challenge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Trophy className="text-orange-500" size={24} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">{challenge.name}</h3>
                <span className="text-xs bg-orange-500 px-2 py-0.5 rounded-full text-white">
                  Premium
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-400">{challenge.category}</span>
                <span className="text-sm text-gray-400">•</span>
                <div className="flex items-center gap-1 text-orange-500">
                  <Trophy size={14} />
                  <span className="text-sm">${challenge.entryFee} Entry</span>
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Important Note */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-orange-500 mb-2">
              <AlertTriangle size={16} />
              <span className="font-medium">Important Note</span>
            </div>
            <p className="text-sm text-gray-300">
              This Challenge requires the specific use of the Oura Ring to participate
            </p>
          </div>

          {/* Challenge Status */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-orange-500" />
                <span className="text-sm text-gray-300">Starts in {daysUntilStart} days</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-orange-500" />
                <span className="text-sm text-gray-300">
                  {registeredPlayers.length}/{challenge.minPlayers} Players Registered
                </span>
              </div>
            </div>
            <Progress 
              value={registeredPlayers.length} 
              max={challenge.minPlayers}
              className="bg-gray-700 h-2" 
            />
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-white mb-2">Description</h4>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-300 whitespace-pre-line">
                {challenge.description}
              </p>
            </div>
          </div>

          {/* Expert Reference */}
          {challenge.expertReference && (
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Reference Experts</h4>
              <div className="flex items-start gap-2 bg-gray-700/50 p-4 rounded-lg">
                <Award size={16} className="text-orange-500 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-300">{challenge.expertReference}</p>
              </div>
            </div>
          )}

          {/* Scoring System */}
          <div>
            <h4 className="text-sm font-medium text-white mb-2">Scoring System</h4>
            <div className="bg-gray-700/50 rounded-lg p-4 space-y-4">
              <div>
                <div className="text-sm text-gray-300 font-medium mb-2">Daily Verification (50%)</div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-lime-500" />
                  <span className="text-sm text-gray-400">Post daily Oura Ring Sleep Score screenshot</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-300 font-medium mb-2">Daily Boosts (50%)</div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-lime-500" />
                  <span className="text-sm text-gray-400">Complete at least one Sleep category boost daily</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-300 font-medium mb-2">Bonus Points</div>
                <div className="flex items-center gap-2">
                  <Trophy size={14} className="text-orange-500" />
                  <span className="text-sm text-gray-400">Additional points for nights with 85+ sleep score</span>
                </div>
              </div>
            </div>
          </div>

          {/* Expert Tips */}
          {challenge.expertTips && (
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Expert Tips</h4>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <ul className="space-y-2">
                  {challenge.expertTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Award size={14} className="text-orange-500 mt-1 shrink-0" />
                      <span className="text-sm text-gray-300">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-700 bg-gray-800">
          <div className="flex items-center gap-1 text-sm">
            <Zap size={14} className="text-orange-500" />
            <span className="text-orange-500">+{challenge.fuelPoints} FP</span>
          </div>
          <div className="flex items-center gap-3">
            {isBetaTester && (
              <button
                onClick={onStart}
                className="px-4 py-2 text-sm bg-lime-500 text-white rounded-lg hover:bg-lime-600"
              >
                Bypass for Beta Testers
              </button>
            )}
            <button
              onClick={handleStartChallenge}
              disabled={loading || isRegistered || activeChallengesCount >= maxChallenges}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                isRegistered
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : activeChallengesCount >= maxChallenges
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {loading ? 'Processing...' : isRegistered ? 'Already Registered' : 'Register Now'}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border-t border-red-500/20">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}