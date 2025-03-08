import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { challenges, contestChallenges } from '../data';
import type { Challenge } from '../types/dashboard';
import { DatabaseError } from '../lib/errors';
import { useSupabase } from '../contexts/SupabaseContext';

export function useChallengeManager(userId: string | undefined) {
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { session } = useSupabase();

  const cancelChallenge = async (challengeId: string) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);

      const { error: dbError } = await supabase
        .from('challenges')
        .delete()
        .eq('user_id', userId)
        .eq('challenge_id', challengeId);

      if (dbError) throw dbError;

      // Refresh challenges list
      await fetchActiveChallenges();
      
      // Trigger dashboard refresh
      window.dispatchEvent(new CustomEvent('dashboardUpdate'));
    } catch (err) {
      console.error('Error canceling challenge:', err);
      setError(err instanceof Error ? err : new DatabaseError('Failed to cancel challenge'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const startChallenge = async (challengeId: string) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);

      // Check if this is a contest challenge
      const isContest = contestChallenges.find(c => c.id === challengeId);
      
      if (isContest) {
        // For contests, we need to create a registration first
        const { data: contestData, error: contestError } = await supabase
          .from('contests')
          .select('id, entry_fee')
          .eq('challenge_id', challengeId)
          .single();

        if (contestError) throw contestError;

        // If contest has entry fee, process through Stripe
        if (contestData.entry_fee > 0) {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-premium-challenge-session`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session}`
              },
              body: JSON.stringify({ 
                contestId: contestData.id,
                challengeId
              })
            }
          );

          const data = await response.json();
          if (data.error) throw new Error(data.error);
          if (data.sessionUrl) {
            window.location.href = data.sessionUrl;
            return;
          }
        }
      }

      // Check if challenge is already active
      const { data: existingChallenge } = await supabase
        .from('challenges')
        .select('id')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId.toString())
        .maybeSingle();

      if (existingChallenge) {
        throw new Error('Challenge already active');
      }

      // Initialize verification requirements
      const startDate = new Date();
      const verificationRequirements = {
        week1: {
          required: 1,
          completed: 0,
          deadline: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        week2: {
          required: 1,
          completed: 0,
          deadline: new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString()
        },
        week3: {
          required: 1,
          completed: 0,
          deadline: new Date(startDate.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString()
        }
      };

      // Create challenge in database
      const { data, error: dbError } = await supabase
        .from('challenges')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          status: 'active',
          progress: 0,
          started_at: startDate.toISOString(),
          verification_requirements: verificationRequirements
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Trigger refresh
      await fetchActiveChallenges();
      window.dispatchEvent(new CustomEvent('dashboardUpdate'));
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start challenge';
      console.error('Error starting challenge:', errorMessage);
      setError(err instanceof Error ? err : new DatabaseError('Failed to start challenge'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Calculate days remaining for a challenge
  const calculateDaysRemaining = (startDate: string, duration: number): number => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Normalize to start of day
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize to start of day
    const daysPassed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, duration - daysPassed);
  };

  // Fetch active challenges from Supabase
  const fetchActiveChallenges = async () => {
    if (!userId) {
      setLoading(false);
      setActiveChallenges([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) throw error;

      // Map database records to Challenge type
      const mappedChallenges = (data || []).map(dbChallenge => {
        const details = challenges.find(c => c.id === dbChallenge.challenge_id);
        if (!details) return null;
        
        // Calculate progress based on verification count
        const verificationProgress = Math.min(
          ((dbChallenge.verification_count || 0) / (dbChallenge.verifications_required || 3)) * 100,
          100
        );

        return {
          id: dbChallenge?.id,
          challenge_id: dbChallenge?.challenge_id,
          name: details?.name,
          category: details?.category,
          relatedCategories:details?.relatedCategories ||[],
          description: details?.description,
          expertReference: details?.expertReference,
          requirements: details?.requirements,
          verificationMethod: details?.verificationMethod,
          expertTips: details?.expertTips,
          fuelPoints: details?.fuelPoints,
          duration: details?.duration,
          progress: verificationProgress,
          verification_count: dbChallenge.verification_count || 0,
          verifications_required: dbChallenge.verifications_required || 3,
          daysRemaining: calculateDaysRemaining(dbChallenge.started_at, details.duration || 21),
          boostCount:dbChallenge?.boost_count || 0,
          last_daily_boost_completed_date:dbChallenge?.last_daily_boost_completed_date
        };
      }).filter(Boolean) as Challenge[];

      setActiveChallenges(mappedChallenges);
    } catch (err) {
      console.error('Error fetching active challenges:', err);
      setError(err instanceof Error ? err : new DatabaseError('Failed to fetch active challenges'));
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchActiveChallenges();
  }, [userId]);

  return {
    activeChallenges,
    loading,
    error,
    startChallenge,
    cancelChallenge,
    fetchActiveChallenges
  };
}