// contexts/StripeContext.tsx
import React, { createContext, useContext, useRef, useEffect } from 'react';
import { loadStripeScript } from '../utils/stripeUtils';

interface StripeContextType {
  stripe: any;
  isLoaded: boolean;
  error: string | null;
}

const StripeContext = createContext<StripeContextType | null>(null);

export const StripeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const stripeRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        
        if (!publishableKey || publishableKey === 'your_stripe_publishable_key') {
          throw new Error('Stripe publishable key is not configured.');
        }

        stripeRef.current = await loadStripeScript(publishableKey);
        setIsLoaded(true);
      } catch (err: any) {
        setError(err.message);
        setIsLoaded(false);
      }
    };

    initializeStripe();
  }, []);

  return (
    <StripeContext.Provider value={{
      stripe: stripeRef.current,
      isLoaded,
      error
    }}>
      {children}
    </StripeContext.Provider>
  );
};

export const useStripeContext = () => {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error('useStripeContext must be used within a StripeProvider');
  }
  return context;
};