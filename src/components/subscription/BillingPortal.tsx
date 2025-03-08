import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { useStripe } from '../../hooks/useStripe';

export function BillingPortal() {
  const [loading, setLoading] = useState(false);
  const { updatePaymentMethod } = useStripe();

  const handleUpdatePayment = async () => {
    try {
      setLoading(true);
      const result = await updatePaymentMethod();
      
      if ('error' in result) {
        throw new Error(result.error);
      }

      // Redirect to Stripe Customer Portal
      window.location.href = result.url;
    } catch (err) {
      console.error('Error updating payment method:', err);
      // Show error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-orange-500" />
          <h3 className="text-sm font-medium text-white">Payment Method</h3>
        </div>
        <button
          onClick={handleUpdatePayment}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            'Update Payment'
          )}
        </button>
      </div>
    </div>
  );
}