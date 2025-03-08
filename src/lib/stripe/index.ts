import { supabase } from '../supabase';

export async function createPremiumChallengeSession(challengeId: string) {
  try {
    const { data, error } = await supabase.functions.invoke('create-subscription', {
      body: { 
        priceId: 'premium_challenge_tc1',
        challengeId
      }
    });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating premium challenge session:', err);
    return { error: err instanceof Error ? err.message : 'Failed to create session' };
  }
}

export async function checkPremiumChallengePayment(sessionId: string) {
  try {
    const { data, error } = await supabase.functions.invoke('check-payment-status', {
      body: { sessionId }
    });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error checking payment status:', err);
    return { error: err instanceof Error ? err.message : 'Failed to check payment' };
  }
}