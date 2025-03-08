import { supabase } from '../lib/supabase/client';
import { useState, useEffect } from 'react';
import type { Database } from '../types/supabase';

type User = Database['public']['Tables']['users']['Row'];

export function useUser(userId: string | undefined) {
  const [userData, setUserData] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState<Error | null>(null);
  const [healthData, setHealthData] = useState<any>(null);

  async function fetchUser() {
    if (!userId) {
      setUserData(null);
      setHealthData(null);
      setUserLoading(false);
      return;
    }

    try {
      // Fetch user data
      const { data: newUserData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }
      newUserData && setUserData(newUserData)
      
      // Fetch latest health assessment using new function
      const { data: latestHealth, error: healthError } = await supabase
        .rpc('get_latest_health_assessment', {
          p_user_id: userId
        });

      if (healthError && healthError.code !== 'PGRST116') {
        throw healthError;
      }

      setHealthData(latestHealth?.[0] || null);

    } catch (err) {
      console.error('Error fetching user data:', err);
      setUserError(err instanceof Error ? err : new Error('Failed to fetch user data'));
    } finally {
      setUserLoading(false);
    }
  }
  // Reset state when userId changes
  useEffect(() => {
    if (!userId) {
      setUserData(null);
      setHealthData(null);
      setUserLoading(false);
      return;
    }
    fetchUser();
  }, [userId]);

  return {
    userData,
    userLoading,
    userError,
    healthData,
    isLoading: userLoading,
    fetchUser
  };
}