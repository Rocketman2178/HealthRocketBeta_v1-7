import React from 'react';
import { useCosmo } from '../../contexts/CosmoContext';
import { useSupabase } from '../../contexts/SupabaseContext';
import { CosmoModal } from './CosmoModal';
import { useEffect } from 'react';

export function CosmoContainer() {
  const { state, showCosmo } = useCosmo();
  const { user } = useSupabase();

  // Show Cosmo when onboarding completes
  useEffect(() => {
    const handleOnboardingComplete = () => {
      showCosmo();
    };

    window.addEventListener('onboardingCompleted', handleOnboardingComplete);
    return () => window.removeEventListener('onboardingCompleted', handleOnboardingComplete);
  }, [showCosmo]);

  if (!state.isEnabled || !user) {
    return null;
  }

  return <CosmoModal />;
}