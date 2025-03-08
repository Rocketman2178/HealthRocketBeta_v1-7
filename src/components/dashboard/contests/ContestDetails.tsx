import React, { useState } from 'react';
import { X, Award, Zap, Clock, Users, Trophy, AlertTriangle, Check, Target } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { getChatPath } from '../../../lib/utils/chat';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../../../contexts/SupabaseContext';
import { Progress } from '../../ui/progress';
import type { Challenge } from '../../../types/dashboard';

interface ContestDetailsProps {
  contest: Challenge;
  onClose: () => void;
  onStart: () => void;
  activeChallengesCount: number;
  maxChallenges: number;
  currentChallenges: { challenge_id: string; status: string; }[];
}

export function ContestDetails({
  contest,
  onClose,
  onStart,
  activeChallengesCount,
  maxChallenges,
  currentChallenges
}: ContestDetailsProps) {
  const navigate = useNavigate();
  const { session } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredPlayers, setRegisteredPlayers] = useState<any[]>([]);

  // Calculate time until start
  const startDate = new Date(contest.startDate);
  const now = new Date();
  const timeUntilStart = startDate.getTime() - now.getTime();
  const daysUntilStart = Math.ceil(timeUntilStart / (1000 * 60 * 60 * 24));

  // Check if already registered
  const isRegistered = currentChallenges.some(c => 
    c.challenge_id === contest.id && c.status === 'registered'
  );

  const handleStartContest = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      // If contest has entry fee, handle payment
      if (contest.entryFee > 0) {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-premium-challenge-session`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session}`,
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ 
              challengeId: contest.id,
              entryFee: contest.entryFee
            })
          }
        );

        const data = await response.json();
        if (data.sessionUrl) {
          window.location.href = data.sessionUrl;
          return;
        }
      }

      // For free contests, start immediately
      await onStart();
    } catch (err) {
      console.error('Error starting contest:', err);
      setError('Failed to start contest. Please try again.');
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
                <h3 className="text-lg font-semibold text-white">{contest.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  contest.entryFee ? 'bg-orange-500 text-white' : 'bg-lime-500/20 text-lime-500'
                }`}>
                  {contest.entryFee ? `$${contest.entryFee} Entry` : 'Free Entry'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-400">{contest.category}</span>
                <span className="text-sm text-gray-400">•</span>
                <div className="flex items-center gap-1 text-orange-500">
                  <Trophy size={14} />
                  <span className="text-sm">+{contest.fuelPoints} FP</span>
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
              {contest.isPremium ? 
                "This Contest requires the specific use of the Oura Ring to participate" :
                "This is a free contest open to all players"}
            </p>
          </div>

          {/* Contest Status */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-orange-500" />
                <span className="text-sm text-gray-300">Starts in {daysUntilStart} days</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-orange-500" />
                <span className="text-sm text-gray-300">
                  {registeredPlayers.length}/{contest.minPlayers} Players Registered
                </span>
              </div>
            </div>
            <Progress 
              value={registeredPlayers.length} 
              max={contest.minPlayers}
              className="bg-gray-700 h-2" 
            />
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-white mb-2">Description</h4>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div 
                className="text-sm text-gray-300 whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: contest.description }}
              />
            </div>
          </div>

          {/* How To Play */}
          {contest.howToPlay && (
            <div className="border border-orange-500/20 rounded-lg p-4 bg-orange-500/5">
              <h4 className="text-sm font-medium text-white mb-2">How To Play</h4>
              <p className="text-sm text-gray-300 mb-3">{contest.howToPlay.description}</p>
              <ul className="space-y-2">
                {contest.howToPlay.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          <div>
            <h4 className="text-sm font-medium text-white mb-2">Requirements</h4>
            <ul className="space-y-2">
              {contest.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>
                    {typeof req === 'string' ? req : req.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Expert Tips */}
          {contest.expertTips && (
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Expert Tips</h4>
              <ul className="space-y-2">
                {contest.expertTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check size={14} className="text-lime-500 mt-1" />
                    <span className="text-sm text-gray-300">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-700 bg-gray-800">
          <div className="flex items-center gap-1 text-sm">
            <Zap size={14} className="text-orange-500" />
            <span className="text-orange-500">+{contest.fuelPoints} FP</span>
          </div>
          <button
            onClick={handleStartContest}
            disabled={loading || isRegistered}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              isRegistered
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {loading ? 'Processing...' : isRegistered ? 'Already Registered' : 'Register Now'}
          </button>
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