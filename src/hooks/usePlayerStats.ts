import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { calculateNextLevelPoints } from '../lib/utils';

interface PlayerStats {
  level: number;
  fuelPoints: number;
  burnStreak: number;
  nextLevelPoints: number;
}

export function usePlayerStats(user: User | null) {
  const [stats, setStats] = useState<PlayerStats>({
    level: 1,
    fuelPoints: 0,
    burnStreak: 0,
    nextLevelPoints: calculateNextLevelPoints(1)
  });
  const [loading, setLoading] = useState(true);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);

  const fetchStats = async () => {
    try {
      if (!user) {
        const defaultStats = {
          level: 1,
          fuelPoints: 0,
          burnStreak: 0,
          nextLevelPoints: calculateNextLevelPoints(1)
        };
        setStats(defaultStats);
        setLoading(false);
        return;
      }

      // Get user stats first
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('level, fuel_points, burn_streak')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // Check for level up event
      const { data: levelUpResult, error: levelUpError } = await supabase
        .rpc('handle_level_up', {
          p_user_id: user.id,
          p_current_fp: userData?.fuel_points || 0
        });

      if (levelUpError) throw levelUpError;

      // Show level up modal if indicated
      if (levelUpResult?.leveled_up) {
        setShowLevelUpModal(true);
      }

      // Use user data or defaults
      const level = userData?.level || 1;
      const totalFP = userData?.fuel_points || 0;

      const newStats = {
        level,
        fuelPoints: totalFP,
        burnStreak: userData?.burn_streak || 0,
        nextLevelPoints: calculateNextLevelPoints(level)
      };
      
      setStats(newStats);
      return newStats;

    } catch (err) {
      // Only throw for non-PGRST116 errors
      if (err instanceof Error && !err.message.includes('PGRST116')) {
        console.error('Error fetching player stats:', err);
        // Set default stats on error
        const defaultStats = {
          level: 1,
          fuelPoints: 0,
          burnStreak: 0,
          nextLevelPoints: calculateNextLevelPoints(1)
        };
        setStats(defaultStats);
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    return await fetchStats();
  };

  useEffect(() => {
    if (user?.id) {
      fetchStats();
    }
  }, [user]);

  return {
    stats,
    loading,
    showLevelUpModal,
    setShowLevelUpModal,
    refreshStats,
  };
}