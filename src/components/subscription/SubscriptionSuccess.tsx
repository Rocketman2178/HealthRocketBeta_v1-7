import React, { useEffect } from 'react';
import { Check, X, Rocket, Trophy, Gift } from 'lucide-react';
import { useSupabase } from '../../contexts/SupabaseContext';

interface SubscriptionSuccessProps {
  onClose: () => void;
}

export function SubscriptionSuccess({ onClose }: SubscriptionSuccessProps) {
  const { user } = useSupabase();

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-2xl border border-orange-500/20">
        <div className="p-6 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-lime-500/20 rounded-full flex items-center justify-center mx-auto">
              <Check className="text-lime-500" size={40} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome to Pro Plan!
          </h2>
          <p className="text-gray-300 mb-6">
            Your account has been successfully upgraded
          </p>

          {/* Benefits */}
          <div className="space-y-4 mb-8">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center justify-center gap-2">
                <Trophy className="text-orange-500" size={20} />
                <span>Pro Benefits Unlocked</span>
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-300">
                  <Gift size={16} className="text-orange-500 shrink-0" />
                  <span>Monthly Prize Pool Eligibility</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <Rocket size={16} className="text-orange-500 shrink-0" />
                  <span>Tier 2 Boosts & Challenges</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <Trophy size={16} className="text-orange-500 shrink-0" />
                  <span>Premium Contest Challenges</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Continue to Game
          </button>
        </div>
      </div>
    </div>
  );
}