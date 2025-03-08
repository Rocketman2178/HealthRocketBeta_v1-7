import { Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useStripe } from '../../hooks/useStripe';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PlanCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
  isPopular?: boolean;
  isCurrentPlan?: boolean;
}

export function PlanCard({
  id,
  name,
  description,
  price,
  interval,
  features,
  isPopular,
  isCurrentPlan
}: PlanCardProps) {
  const [loading, setLoading] = useState(false);
  const { createSubscription } = useStripe();

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const result = await createSubscription(id);
      
      if ('error' in result) {
        throw new Error(result.error);
      }

      // Redirect to Stripe Checkout
      window.location.href = result.sessionUrl;
    } catch (err) {
      console.error('Error subscribing:', err);
      // Show error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative flex flex-col p-6 bg-gray-800 rounded-xl border ${
      isPopular ? 'border-orange-500' : 'border-gray-700'
    }`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 text-xs font-medium text-white bg-orange-500 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-5">
        <h3 className="text-xl font-bold text-white">{name}</h3>
        <p className="mt-2 text-sm text-gray-400">{description}</p>
      </div>

      <div className="mb-5">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-white">${price}</span>
          <span className="ml-1 text-gray-400">/{interval}</span>
        </div>
      </div>

      <ul className="mb-8 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-orange-500 shrink-0" />
            <span className="text-sm text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        {isCurrentPlan ? (
          <button
            disabled
            className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg opacity-50 cursor-not-allowed"
          >
            Current Plan
          </button>
        ) : (
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              'Subscribe'
            )}
          </button>
        )}
      </div>
    </div>
  );
}