import { useContext } from 'react';
import { StripeContext } from '../contexts/StripeContext';

export function useStripe() {
  const context = useContext(StripeContext);
  
  if (context === undefined) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  
  return context;
}