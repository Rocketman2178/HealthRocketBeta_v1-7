import React, { useState, useEffect } from 'react';
import { Rocket, Info, Trophy, X, Crown, Gift, Target, Palette, Sparkles, Zap } from 'lucide-react';
import { Card } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Tooltip } from '../../ui/tooltip';
import { useSupabase } from '../../../contexts/SupabaseContext';
import { usePlayerStats } from '../../../hooks/usePlayerStats';

interface RocketInfoModalProps {
  level: number;
  onClose: () => void;
}

function RocketInfoModal({ level, onClose }: RocketInfoModalProps) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="text-orange-500" size={28} />
            <h2 className="text-2xl font-bold text-white">Blastoff!</h2>
          </div>
          <p className="text-lg text-gray-300">You've reached Level {level}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Gift className="text-orange-500" size={20} />
            <span>Keep Earning FP to Unlock</span>
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Target size={18} className="text-orange-500 mt-1 shrink-0" />
                  <div>
                    <p className="text-white">New Features at Higher Levels</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Palette size={18} className="text-orange-500 mt-1 shrink-0" />
                  <div>
                    <p className="text-white">Custom Rocket Colors, Decals & Effects</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Trophy size={18} className="text-orange-500 mt-1 shrink-0" />
                  <div>
                    <p className="text-white">New Challenges & Quests</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LevelUpModalProps {
  level: number;
  onClose: () => void;
}

function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 text-center space-y-4">
        <div className="text-4xl font-bold text-orange-500 mb-2">BLASTOFF! 🚀</div>
        <h2 className="text-2xl font-bold text-white">
          Level {level} Achieved!
        </h2>
        <div className="space-y-4 mt-4">
          <p className="text-gray-300">
            Keep earning FP to unlock:
          </p>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 justify-center text-gray-300">
              <Target size={18} className="text-orange-500" />
              <span>New Features at Higher Levels</span>
            </li>
            <li className="flex items-center gap-2 justify-center text-gray-300">
              <Palette size={18} className="text-orange-500" />
              <span>Custom Rocket Colors, Decals & Effects</span>
            </li>
            <li className="flex items-center gap-2 justify-center text-gray-300">
              <Sparkles size={18} className="text-orange-500" />
              <span>New Challenges & Quests</span>
            </li>
          </ul>
        </div>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors mt-4"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

interface MyRocketProps {
  nextLevelPoints: number;
  level: number;
  fuelPoints: number;
}

export function MyRocket({ 
  nextLevelPoints,
  level,
  fuelPoints
}: MyRocketProps) {
  const { user } = useSupabase();
  const { stats, loading, showLevelUpModal, setShowLevelUpModal } = usePlayerStats(user?.id);
  const [showRocketInfo, setShowRocketInfo] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  // Calculate progress percentage and FP needed using fuel_points
  const progressPercentage = Math.min(100, Math.max(0, (fuelPoints / nextLevelPoints) * 100));
  const fpNeeded = Math.max(0, nextLevelPoints - fuelPoints);
  const readyToLevelUp = progressPercentage >= 100;

  const handleLaunch = async () => {
    if (isLaunching) return;
    setIsLaunching(true);

    if (!user) {
      setIsLaunching(false);
      return;
    }

    try {
      // Call the level up function
      const { data, error } = await supabase.rpc('handle_level_up', {
        p_user_id: user.id,
        p_current_fp: fuelPoints
      });

      if (error) throw error;

      // Show celebration modal
      setShowLevelUpModal(true);

      // Trigger dashboard refresh
      window.dispatchEvent(new CustomEvent('dashboardUpdate'));
    } catch (err) {
      console.error('Error leveling up:', err);
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">My Rocket</h2>
        </div>

        <Card>
          <div className="flex gap-4">
            {/* Progress Info - Left Side (66%) */}
            <div className="flex-1">
              {/* Launch Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Rocket className="text-orange-500" size={16} />
                    <span className="text-sm text-gray-400">Launch Progress</span>                    
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Zap className="text-orange-500" size={14} />
                    <span className="text-orange-500 font-medium">{progressPercentage.toFixed(1)}%</span>
                    <button
                      onClick={() => setShowRocketInfo(true)}
                      className="text-gray-400 hover:text-gray-300 ml-1"
                    >
                      <Info size={14} />
                    </button>
                  </div>
                </div>
                <Progress 
                  value={fuelPoints} 
                  max={nextLevelPoints} 
                  className="bg-gray-700 h-3" 
                />
                <div className="flex justify-between mt-1.5">
                  {readyToLevelUp ? (
                    <button
                      onClick={handleLaunch}
                      disabled={isLaunching}
                      className="text-sm text-orange-500 hover:text-orange-400 flex items-center gap-1"
                    >
                      <span>{isLaunching ? 'Launching...' : 'Launch My Rocket'}</span>
                      <Rocket size={14} className="animate-bounce" />
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">{fpNeeded} FP needed</span>
                  )}
                  <span className="text-xs text-gray-400">{fuelPoints} / {nextLevelPoints} FP</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Rocket Info Modal */}
      {showRocketInfo && (
        <RocketInfoModal
          level={level}
          onClose={() => setShowRocketInfo(false)}
        />
      )}
      
      {/* Level Up Celebration Modal */}
      {showLevelUpModal && (
        <LevelUpModal
          level={level}
          onClose={() => setShowLevelUpModal(false)}
        />
      )}
    </>
  );
}