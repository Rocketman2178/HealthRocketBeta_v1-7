import React, { useState } from 'react';
import { X, Award, Zap, Clock, Brain, Moon, Activity, Apple, Database, Target, Calendar, MessageCircle, ChevronRight } from 'lucide-react';
import { getChatPath } from '../../../lib/utils/chat';
import { formatInTimeZone } from 'date-fns-tz';
import { challenges } from '../../../data';
import type { Challenge } from '../../../types/dashboard';
import { useSupabase } from '../../../contexts/SupabaseContext';

interface CurrentChallenge {
  challenge_id: string;
  status: string;
}
import { useNavigate } from 'react-router-dom';

interface ChallengeDetailsProps {
  challenge: Challenge;
  onClose: () => void;
  onStart: () => void;
  activeChallengesCount: number;
  maxChallenges: number;
  currentChallenges: CurrentChallenge[];
  hasCompletedTier0?: boolean;
}

export function ChallengeDetails({ 
  challenge, 
  onClose, 
  onStart,
  activeChallengesCount,
  maxChallenges,
  currentChallenges,
  hasCompletedTier0 = false
}: ChallengeDetailsProps) {
  const navigate = useNavigate();
  const { session } = useSupabase();
  const isAlreadyActive = currentChallenges.some(c => 
    c.challenge_id === challenge.id || c.challenge_id === challenge.challenge_id
  );
  const [loading, setLoading] = useState(false);
  const isPremiumRegistered = currentChallenges.some(c => 
    (c.challenge_id === challenge.id || c.challenge_id === challenge.challenge_id) && c.status === 'registered'
  );
  const isPremiumChallenge = challenge.isPremium;
  const requiresTier0 = challenge.tier === 1 && !hasCompletedTier0 && !challenge.isPremium;
  const nonPremiumChallengesCount = currentChallenges.filter(c => 
    !challenges.find(ch => ch.id === c.challenge_id)?.isPremium
  ).length;
  const entryFee = challenge.entryFee || 0;
  const isFreeContest = challenge.category === 'Contests' && entryFee === 0;
  const isRegistered = currentChallenges.some(c => c.challenge_id === challenge.id);

  const handleStartChallenge = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      // If this is a contest with an entry fee, handle payment
      if (challenge.category === 'Contests' && challenge.entryFee > 0) {
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
              challengeId: challenge.challenge_id || challenge.id,
              entryFee: challenge.entryFee
            })
          }
        );

        const data = await response.json();
        if (data.sessionUrl) {
          window.location.href = data.sessionUrl;
          return;
        }
      }

      // For free challenges or contests, start immediately
      await onStart();
    } catch (err) {
      console.error('Error starting challenge:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full flex flex-col max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Award className="text-orange-500" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span>{challenge.name}</span>
                {challenge.category === 'Contests' && (
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    challenge.entryFee ? 'bg-orange-500 text-white' : 'bg-lime-500/20 text-lime-500'
                  }`}>
                    {challenge.entryFee ? `$${challenge.entryFee} Entry` : 'Free Entry'}
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-8 mt-2">
                <div className="flex items-center gap-2">
                  <Target size={14} className="text-orange-500" />
                  <span className="text-xs text-gray-400">{challenge.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-orange-500" />
                  <span className="text-xs text-orange-500">+{challenge.fuelPoints} FP</span>
                </div>
                {challenge.startDate && (
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-orange-500" />
                    <span className="text-xs text-gray-400">
                      Start: {formatInTimeZone(new Date(challenge.startDate), 'America/New_York', 'M/d/yyyy')}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-orange-500" />
                  <span className="text-xs text-gray-400">{challenge.duration || 21} Days</span>
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Note for Contest Challenges */}
          {challenge.category === 'Contests' && challenge.isPremium && (
            <div className="text-orange-500 italic text-xs">
              Note: This Challenge requires the specific use of the Oura Ring to participate
            </div>
          )}

          {challenge.expertReference && (
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Reference Experts</h4>
              <div className="flex items-start gap-2 bg-gray-700/50 p-3 rounded-lg">
                <Award size={16} className="text-orange-500 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-300">{challenge.expertReference}</p>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-white mb-2">Description</h4>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-sm text-gray-300" dangerouslySetInnerHTML={{ 
                __html: challenge.tier === 0 
                  ? "Establish a simple but powerful morning routine that touches all five health categories"
                  : challenge.description
              }} />
            </div>
          </div>

          {/* How To Play (for Contest Challenges) */}
          {challenge.category === 'Contests' && challenge.howToPlay && (
            <div className="border border-orange-500/20 rounded-lg p-4 bg-orange-500/5">
              <h4 className="text-sm font-medium text-white mb-2">How To Play</h4>
              <p className="text-sm text-gray-300 mb-3">{challenge.howToPlay.description}</p>
              <ul className="space-y-2">
                {challenge.howToPlay.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!challenge.isPremium && (
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Actions</h4>
              <div className="space-y-2">
                {challenge.tier === 0 ? (
                  <>
                    <div className="bg-gray-700/50 rounded-lg p-4 border-2 border-orange-500/50">
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-start gap-2 text-sm text-gray-300">
                          <span>Complete at least 3 of these actions DAILY within 2 hours of waking:</span>
                        </li>
                        <li className="flex items-start gap-2 ml-4">
                          <Brain size={16} className="text-orange-500 mt-1 shrink-0" />
                          <span>Mindset: 2-minute gratitude reflection</span>
                        </li>
                        <li className="flex items-start gap-2 ml-4">
                          <Moon size={16} className="text-orange-500 mt-1 shrink-0" />
                          <span>Sleep: Record total sleep time or sleep quality score</span>
                        </li>
                        <li className="flex items-start gap-2 ml-4">
                          <Activity size={16} className="text-orange-500 mt-1 shrink-0" />
                          <span>Exercise: 5-minute stretch</span>
                        </li>
                        <li className="flex items-start gap-2 ml-4">
                          <Apple size={16} className="text-orange-500 mt-1 shrink-0" />
                          <span>Nutrition: Glass of water</span>
                        </li>
                        <li className="flex items-start gap-2 ml-4">
                          <Database size={16} className="text-orange-500 mt-1 shrink-0" />
                          <span>Biohacking: 5 minutes of morning sunlight exposure</span>
                        </li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    {challenge.implementationProtocol && Object.entries(challenge.implementationProtocol).map(([week, protocol]) => (
                      <div key={week} className="space-y-1">
                        <div className="text-sm text-orange-500 font-medium">
                          {week.replace(/(\d+)/, ' $1')}:
                        </div>
                        <p className="text-sm text-gray-300 whitespace-pre-line">{protocol}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-white mb-2">Requirements to Complete</h4>
            <ul className="space-y-2">
              {challenge.tier === 0 ? (
                <>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="mt-1.5">•</span>
                    <span>Submit Verification Posts in Challenge Chat</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300 ml-4">
                    <span className="mt-1.5">•</span>
                    <span><span className="text-orange-500">Week 1:</span> Selfie with morning sunlight exposure</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300 ml-4">
                    <span className="mt-1.5">•</span>
                    <span><span className="text-orange-500">Week 2:</span> Screenshot of weekly sleep score or time log</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300 ml-4">
                    <span className="mt-1.5">•</span>
                    <span><span className="text-orange-500">Week 3:</span> Three takeaway thoughts from this Challenge</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300 ml-4">
                    <span className="mt-1.5">•</span>
                    <span>
                      <span className="text-lime-500">Beta Testers Only:</span> Post 7 feedback "verification" posts. Can be positive, negative or feature request suggestions. Prizes will be given to the top 3 most valuable beta testers.
                    </span>
                  </li>
                </>
              ) : (
                challenge.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="mt-1.5">•</span>
                    <span>
                      {typeof req === 'string' ? (
                        req
                      ) : (
                        <>
                          {req.description.replace(/\((\d+)% of score\)/, '(')}
                          <span className="text-orange-500">
                            {req.description.match(/(\d+)% of score/)?.[1]}%
                          </span>
                          <span> of score</span>
                        </>
                      )}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>

          {challenge.tier !== 0 && <div>
            <h4 className="text-sm font-medium text-white mb-2">Verification Method</h4>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <p className="text-sm text-gray-300">{
                challenge.verificationMethod
                  ? typeof challenge.verificationMethod === 'string'
                    ? challenge.verificationMethod
                    : challenge.verificationMethod.description || 'Complete daily tracking and verification logs'
                  : 'Complete daily tracking and verification logs'
              }</p>
            </div>
          </div>}

          {challenge.expertTips && (
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Expert Tips</h4>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <ul className="space-y-2">
                  {challenge.expertTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Brain size={16} className="text-lime-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-300">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-400">
            {challenge.tier === 0 
              ? 'Complete this Challenge to Unlock Tier 1 Challenges'
              : !challenge.isPremium && 'Complete this challenge to progress your active Quest' || ''
            }
          </div>
        </div>

        {/* Chat Button */}
        {isAlreadyActive && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                const chatId = challenge.challenge_id || challenge.id;
                if (chatId) {
                  navigate(getChatPath(chatId));
                }
              }}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              <MessageCircle size={20} />
              <span>Access the Challenge Chat</span>
            </button>
          </div>
        )}

        {/* Fixed Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-700 bg-gray-800">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm">
              <Zap size={14} className="text-orange-500" />
              <span className="text-orange-500">+{challenge.fuelPoints} FP</span>
            </div>
            {challenge.category === 'Contests' && (
              <span className={`text-sm ${challenge.entryFee ? 'text-orange-500' : 'text-lime-500'}`}>
                {challenge.entryFee ? `Entry Fee: $${challenge.entryFee}` : 'Free Entry'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {challenge.tier === 2 && (
              <button
                className="px-4 py-1.5 bg-gray-600 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed whitespace-nowrap"
              >
                Unlocks with Tier 2 Quest
              </button>
            )}
            {challenge.tier === 1 && !hasCompletedTier0 && !challenge.isPremium ? (
              <button
                className="px-4 py-1.5 bg-gray-600 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed whitespace-nowrap"
              >
                Complete Tier 0 First
              </button>
            ) : ((challenge.tier === 0) || (challenge.tier === 1 && (hasCompletedTier0 || challenge.isPremium))) && (
              <button
                onClick={handleStartChallenge}
                disabled={(!challenge.isPremium && nonPremiumChallengesCount >= maxChallenges) || isRegistered || loading}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  (!challenge.isPremium && nonPremiumChallengesCount >= maxChallenges) || isRegistered
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600 cursor-pointer flex items-center gap-2 group'
                }`}
              >
                {isRegistered 
                  ? 'Already Registered' 
                  : (!challenge.isPremium && nonPremiumChallengesCount >= maxChallenges)
                    ? 'No Slots Available'
                    : loading
                      ? 'Processing...'
                      : challenge.category === 'Contests'
                        ? 'Register for Contest'
                        : 'Start Challenge'}
                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform ml-1" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}