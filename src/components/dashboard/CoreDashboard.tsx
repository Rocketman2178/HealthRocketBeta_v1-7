import { useState, useEffect } from "react";
import { Trophy, Compass, Target, Zap, Radio } from 'lucide-react';
import { scrollToSection } from '../../lib/utils';
import { useCosmo } from "../../contexts/CosmoContext";
import { CompanyLogo } from "./header/CompanyLogo";
import { DashboardHeader } from "./header/DashboardHeader";
import { MyRocket } from "./rocket/MyRocket";
import { RankStatus } from "./rank/RankStatus";
import { QuestCard } from "./quest/QuestCard";
import { ChallengeGrid } from "./challenge/ChallengeGrid";
import { ContestsGrid } from "./contests/ContestsGrid";
import { DailyBoosts } from "./boosts/DailyBoosts";
import { useSupabase } from "../../contexts/SupabaseContext";
import { useDashboardData } from "../../hooks/useDashboardData";
import { usePlayerStats } from "../../hooks/usePlayerStats";
import { FPCongrats } from "../ui/fp-congrats";
import { useBoostState } from "../../hooks/useBoostState";
import { supabase } from "../../lib/supabase";
import { formatInTimeZone } from 'date-fns-tz';

export function CoreDashboard() {
  const [fpEarned, setFpEarned] = useState<number | null>(null);
  const { user } = useSupabase();
  const { showCosmo } = useCosmo();
  const {
    data,
    loading: dashboardLoading,
    refreshData,
  } = useDashboardData(user);
  const { stats, loading: statsLoading, refreshStats } = usePlayerStats(user);
  const {
    selectedBoosts,
    weeklyBoosts,
    daysUntilReset,
    completeBoost,
    isLoading: boostLoading,
  } = useBoostState(user?.id);

  // Listen for dashboard update events
  useEffect(() => {
    const handleDashboardUpdate = async () => {
      try {
        await Promise.all([refreshData(), refreshStats()]);
      } catch (err) {
        console.error("Error updating dashboard:", err);
      }
    };

    const handleUpdate = (event: Event) => {
      // Check if event has FP earned data
      if (event instanceof CustomEvent && event.detail?.fpEarned) {
        setFpEarned(event.detail.fpEarned);
      }

      if (event.type === "dashboardUpdate") {
        handleDashboardUpdate();
      }
    };

    window.addEventListener("dashboardUpdate", handleUpdate);
    return () => window.removeEventListener("dashboardUpdate", handleUpdate);
  }, [refreshData, refreshStats]);

  
  useEffect(() => {
    const NewYorkTimeZone = 'America/New_York';
    const resetBurnStreak = async () => {
      if (!user?.id) return;
      await supabase.rpc("check_and_reset_burn_streaks");
    };
  
    const scheduleReset = () => {
      const now = new Date();
      const newYorkTime = formatInTimeZone(now, NewYorkTimeZone, 'yyyy-MM-dd HH:mm:ssXXX');
      const midnight = new Date(newYorkTime);
      midnight.setHours(24, 0, 0, 0);
      const timeUntilMidnight = midnight.getTime() - now.getTime() + 60 * 1000; 
      const timeoutId = setTimeout(async () => {
        await resetBurnStreak();
        scheduleReset(); 
      }, timeUntilMidnight);
  
      return timeoutId;
    };
    const timeoutId = scheduleReset();
    return () => clearTimeout(timeoutId);
  }, [user?.id]); 
  // Handle closing the FP congrats modal
  const handleCloseModal = () => {
    setFpEarned(null);
  };

  // Show loading state while data is being fetched
  if ((dashboardLoading || statsLoading) && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Ensure we have data before rendering
  if (!data) {
    return null;
  }

  return (
    <div className="relative">
      {fpEarned !== null && (
        <FPCongrats fpEarned={fpEarned} onClose={handleCloseModal} />
      )}
      <CompanyLogo />
      <div className="mb-4">
        <DashboardHeader
        healthSpanYears={data.healthSpanYears}
        healthScore={data.healthScore}
        level={stats.level}
        nextLevelPoints={stats.nextLevelPoints}
        />
      </div>
      {/* Navigation Bar */}
      <div className="sticky top-0 z-40 bg-black/20 backdrop-blur-sm py-2 mb-4">
        <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollToSection('leaderboard', 'start')}
              className="flex items-center justify-center w-10 h-10 border border-orange-500/50 text-orange-500 rounded-full bg-black/20 backdrop-blur-sm hover:bg-orange-500 hover:text-white transition-colors shadow-lg"
              title="Leaderboard"
            >
              <Trophy size={18} />
            </button>
            <button
              onClick={() => scrollToSection('quests', 'start')}
              className="flex items-center justify-center w-10 h-10 border border-orange-500/50 text-orange-500 rounded-full bg-black/20 backdrop-blur-sm hover:bg-orange-500 hover:text-white transition-colors shadow-lg"
              title="Quests"
            >
              <Compass size={18} />
            </button>
            <button
              onClick={() => scrollToSection('challenges', 'start')}
              className="flex items-center justify-center w-10 h-10 border border-orange-500/50 text-orange-500 rounded-full bg-black/20 backdrop-blur-sm hover:bg-orange-500 hover:text-white transition-colors shadow-lg"
              title="Challenges"
            >
              <Target size={18} />
            </button>
            <button
              onClick={() => scrollToSection('boosts', 'start')}
              className="flex items-center justify-center w-10 h-10 border border-orange-500/50 text-orange-500 rounded-full bg-black/20 backdrop-blur-sm hover:bg-orange-500 hover:text-white transition-colors shadow-lg"
              title="Boosts"
            >
              <Zap size={18} />
            </button>
          </div>
          <button
            onClick={showCosmo}
            className="flex items-center gap-2 px-4 py-2 border border-orange-500/50 text-orange-500 rounded-full bg-black/20 backdrop-blur-sm hover:bg-orange-500 hover:text-white transition-colors shadow-lg"
          >
            <Radio size={18} />
            <span>Launch Cosmo</span>
          </button>
        </div>
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-4">
        <MyRocket
          level={stats.level}
          fuelPoints={stats.fuelPoints}
          nextLevelPoints={stats.nextLevelPoints}
        />
        <RankStatus />
        <QuestCard userId={user?.id} categoryScores={data.categoryScores} />

        <ChallengeGrid
          userId={user?.id}
          categoryScores={data.categoryScores}
          verificationRequirements={data.verificationRequirements}
        />
        <ContestsGrid
          userId={user?.id}
          categoryScores={data.categoryScores}
        />
        <DailyBoosts
          burnStreak={stats.burnStreak}
          completedBoosts={data.completedBoosts}
          selectedBoosts={selectedBoosts}
          weeklyBoosts={weeklyBoosts}
          daysUntilReset={daysUntilReset}
          onCompleteBoost={completeBoost}
        />
      </main>
    </div>
  );
}
