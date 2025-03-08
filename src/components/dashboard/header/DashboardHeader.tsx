import React, { useState, useEffect } from 'react';
import { Heart, Activity, Rocket, Info, Crown, Gift, Target, Sparkles, X, Palette, Trophy } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { HealthDashboard } from '../../health/HealthDashboard';
import { Tooltip } from '../../ui/tooltip';
import { useHealthAssessment } from '../../../hooks/useHealthAssessment';
import { useSupabase } from '../../../contexts/SupabaseContext';
import { useCosmo } from '../../../contexts/CosmoContext';

interface LevelUpModalProps {
  level: number;
  onClose: () => void;
}

function LevelUpModal({ level, onClose }: LevelUpModalProps) {
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

interface DashboardHeaderProps {
  healthSpanYears: number;
  healthScore: number;
  nextLevelPoints: number;
  level: number;
}

export function DashboardHeader({ 
  healthSpanYears, 
  healthScore, 
  nextLevelPoints,
  level
}: DashboardHeaderProps) {
  const [showHealthDashboard, setShowHealthDashboard] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [hasSeenLevelModal, setHasSeenLevelModal] = useState(() => {
    return localStorage.getItem('hasSeenLevelModal') === 'true';
  });
  const { user } = useSupabase();
  const { showCosmo } = useCosmo();
  const { canUpdate } = useHealthAssessment(user?.id);

  const handleShowLevelModal = () => {
    setShowLevelModal(true);
    setHasSeenLevelModal(true);
    localStorage.setItem('hasSeenLevelModal', 'true');
  };

  return (
    <div  id="rocket">
      <div className="bg-gray-800 py-4 sm:py-5 border-b border-gray-700 relative">
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="flex items-center justify-center gap-3 sm:gap-6">
            {/* Beta indicator */}
            <div className="absolute -top-5 right-4">
              <div className="bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-medium text-orange-500 border border-orange-500/30">
                v1.6 Beta
              </div>
            </div>
            <button 
              onClick={() => setShowHealthDashboard(true)}
              className="flex-1 max-w-[200px]"
            >
              <MetricCard
                icon={<Heart size={20} className="text-orange-500" />}
                label="+HealthSpan"
                value={`${healthSpanYears} years`}
                showNotification={canUpdate}
              />
            </button>
            <button 
              onClick={() => setShowHealthDashboard(true)}
              className="flex-1 max-w-[200px]"
            >
              <MetricCard
                icon={<Activity size={20} className="text-lime-500" />}
                label="HealthScore"
                value={healthScore.toString()}
                showNotification={canUpdate}
              />
            </button>
            <button 
              onClick={handleShowLevelModal}
              className="flex-1 max-w-[200px]"
            >
              <MetricCard
                icon={<Rocket size={20} className="text-orange-500" />}
                label="Level"
                value={level.toString()}
                showClickIndicator={!hasSeenLevelModal}
              />
            </button>
          </div>
        </div>
        
      </div>

      {showHealthDashboard && (
        <HealthDashboard
          healthSpanYears={healthSpanYears}
          healthScore={healthScore}
          nextLevelFP={nextLevelPoints}
          onClose={() => setShowHealthDashboard(false)}
        />
      )}
      {showLevelModal && (
        <LevelUpModal
          level={level}
          onClose={() => setShowLevelModal(false)}
        />
      )}
    </div>
  );
}
