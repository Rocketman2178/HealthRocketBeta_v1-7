import { createContext, useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import { supabase } from "../lib/supabase";

interface StripeContextType {
  stripe: Stripe | null;
  loading: boolean;
  createSubscription: (
    priceId: string
  ) => Promise<{ sessionId: string } | { error: string }>;
  cancelSubscription: () => Promise<{ success: boolean; error?: string }>;
  updatePaymentMethod: () => Promise<{ sessionId: string } | { error: string }>;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export function StripeProvider({ children }: { children: React.ReactNode }) {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initStripe = async () => {
      const stripeInstance = await stripePromise;
      setStripe(stripeInstance);
      setLoading(false);
    };

    initStripe();
  }, []);

  const createSubscription = async (priceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-subscription",
        {
          body: { priceId },
        }
      );

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error creating subscription:", err);
      return { error: "Failed to create subscription" };
    }
  };

  const cancelSubscription = async () => {
    try {
      const { error } = await supabase.functions.invoke("cancel-subscription");

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error("Error canceling subscription:", err);
      return { success: false, error: "Failed to cancel subscription" };
    }
  };

  const updatePaymentMethod = async () => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "update-payment-method"
      );

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error updating payment method:", err);
      return { error: "Failed to update payment method" };
    }
  };

  return (
    <StripeContext.Provider
      value={{
        stripe,
        loading,
        createSubscription,
        cancelSubscription,
        updatePaymentMethod,
      }}
    >
      {children}
    </StripeContext.Provider>
  );
}
