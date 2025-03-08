import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Zap, Ban, Users, CheckCircle2 } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { getChatPath } from '../../../lib/utils/chat';
import { Card } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { ChallengeMessageButton } from './ChallengeMessageButton';
import { ChallengeCancelConfirm } from './ChallengeCancelConfirm';
import { quests } from '../../../data';
import type { Challenge, Quest } from '../../../types/dashboard';
import { supabase } from '../../../lib/supabase';

interface ChallengeCardProps {
  userId:string|undefined;
  challenge: Challenge;
  activeQuest?: Quest | null;
  onCancel?: (id: string) => void;
}

export function ChallengeCard({ userId,challenge, activeQuest, onCancel }: ChallengeCardProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [boostCount,setBoostCount] = useState<number>(challenge?.boostCount||0);
  const [DailyCompletedDate,setDailyCompletedDate] = useState<string>(challenge?.last_daily_boost_completed_date);
  const navigate = useNavigate();
  const isPremiumChallenge = challenge.isPremium;
  const startDate = challenge.startDate ? new Date(challenge.startDate) : null;
  const hasStarted = startDate ? startDate <= new Date() : true;
  const entryFee = challenge.entryFee || 0;
  const isFreeContest = challenge.category === 'Contests' && entryFee === 0;

  // Get appropriate days display text
  const getDaysDisplay = () => {
    if (isPremiumChallenge && startDate && !hasStarted) {
      const estNow = new Date(formatInTimeZone(new Date(), 'America/New_York', 'yyyy-MM-dd HH:mm:ssXXX'));
      const daysUntilStart = Math.ceil((startDate.getTime() - estNow.getTime()) / (1000 * 60 * 60 * 24));
      return `${daysUntilStart} Days Until Start`;
    }
    return `${challenge.daysRemaining} Days Left`;
  };
  const NewYorkTimeZone = 'America/New_York';
  const incrementBoost = async () => {
    try {
      const { data, error: dbError } = await supabase
        .from("challenges")
        .select("boost_count")
        .eq("user_id", userId)
        .eq("challenge_id", challenge.challenge_id)
        .maybeSingle();
  
      if (dbError) {
        console.error("Error fetching challenge:", dbError);
        return;
      }
  
      if (!data) {
        console.warn("Challenge not found for the given user and challenge ID.");
        return;
      }
  
      const currentBoostCount = data.boost_count ?? 0; 
     
      const now = new Date();
      const newYorkTime = formatInTimeZone(now, NewYorkTimeZone, 'yyyy-MM-dd');
      const {error } = await supabase
        .from("challenges")
        .update({ boost_count: currentBoostCount +1 , last_daily_boost_completed_date: newYorkTime })
        .eq("user_id", userId)
        .eq("challenge_id", challenge.challenge_id)
      if (error) {
        console.error("Error updating challenge:", error);
        return;
      }
      setBoostCount(currentBoostCount+1);
      setDailyCompletedDate(newYorkTime);
    } catch (err) {
      console.error("Unexpected error in incrementBoost:", err);
    }
  };


  useEffect(() => {
    const handleDashboardUpdate = async () => {
      try {
        const now = new Date();
        const newYorkTime = formatInTimeZone(now, NewYorkTimeZone, 'yyyy-MM-dd');
        if(DailyCompletedDate !== newYorkTime){

          await Promise.all([incrementBoost()]);
        }
      } catch (err) {
        console.error("Error updating dashboard:", err);
      }
    };

    const handleUpdate = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.updatedPart ==="boost" && challenge?.relatedCategories?.includes(event?.detail?.category) && event.type === "dashboardUpdate" ) {
        handleDashboardUpdate();
      }
    };

    window.addEventListener("dashboardUpdate", handleUpdate);
    return () => window.removeEventListener("dashboardUpdate", handleUpdate);
  }, [incrementBoost]);

  // Fetch active players
  useEffect(() => {
    const fetchActivePlayers = async () => {
      try {
        const { data: count, error } = await supabase.rpc(
          'get_challenge_players_count',
          { p_challenge_id: challenge.challenge_id }
        );

        if (error) throw error;
        setPlayerCount(count || 0);
      } catch (err) {
        console.error('Error fetching players:', err);
      }
    };

    fetchActivePlayers();
  }, [challenge.challenge_id]);

  const handleCancel = async () => {
    if (onCancel) {
      await onCancel(challenge.challenge_id);
      window.dispatchEvent(new CustomEvent('challengeCanceled'));
    }
  };

  const isRecommended = activeQuest && quests.find(
    q => q.id === activeQuest.id && q.challengeIds?.includes(challenge.id)
  );

  return (
    <>
      <Card>
        <div 
          onClick={() => navigate(`/challenge/${challenge.challenge_id}`)}
          className="cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <Award className="text-orange-500" size={24} />
              <div className="min-w-0">
                <h3 className="font-bold text-white truncate">{challenge.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-400">{challenge.category}</span>
                  <span className="text-sm text-gray-400">•</span>
                  {challenge.category === 'Contests' && (
                    <span className={`text-xs px-2 py-0.5 rounded ${challenge.entryFee ? 'bg-orange-500/10 text-orange-500' : 'bg-lime-500/10 text-lime-500'}`}>
                      {challenge.entryFee ? `Entry Fee: $${challenge.entryFee}` : 'Free Entry'}
                    </span>
                  )}
                  <span className="text-sm text-orange-500">+{challenge.fuelPoints} FP</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ChallengeMessageButton challengeId={challenge.challenge_id} size={24} hideCount />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(getChatPath(challenge.challenge_id));
                }}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <Users size={14} />
                <span>{playerCount} Players</span>
              </button>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    {isPremiumChallenge && startDate && !hasStarted && (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-400">Start Date</span>
                        <span className="text-xs text-orange-500">
                          {formatInTimeZone(startDate, 'America/New_York', 'M/d/yyyy')}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-orange-500">{getDaysDisplay().split(' ')[0]}</span>
                      <span className="text-gray-400">{getDaysDisplay().split(' ').slice(1).join(' ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Progress 
              value={challenge.progress}
              max={100}
              className="bg-gray-700 h-2"
            />
            <div className="flex justify-between text-xs mt-1">
              <div className="flex items-center gap-3">
                {challenge.isPremium ? (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Boosts</span>
                    <span className="text-orange-500">{boostCount}/21</span>
                  </div>
                ) : (
                  <span className="text-gray-400">Progress</span>
                )}
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-1 text-lime-500">
                  <CheckCircle2 size={12} />
                  <span>
                    {challenge.verification_count || 0}/
                    {challenge.isPremium ? 21 : (challenge.verifications_required || 3)} Verified
                  </span>
                </div>
                {onCancel && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCancelConfirm(true);
                    }}
                    className="text-gray-500 hover:text-gray-400"
                    title="Cancel Challenge"
                  >
                    <Ban size={14} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Zap className="text-orange-500" size={14} />
                <span className="text-orange-500">+{challenge.fuelPoints} FP</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {showCancelConfirm && (
        <ChallengeCancelConfirm
          onConfirm={handleCancel}
          onClose={() => setShowCancelConfirm(false)}
        />
      )}

    </>
  );
}