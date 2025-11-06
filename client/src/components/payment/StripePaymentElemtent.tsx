// components/payment/StripePaymentElement.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useStripeContext } from '../../context/StripeContext'

interface StripePaymentElementProps {
  clientSecret: string;
  onReady?: () => void;
  onError?: (error: string) => void;
}

export const StripePaymentElement: React.FC<StripePaymentElementProps> = ({
  clientSecret,
  onReady,
  onError
}) => {
  const { stripe, isLoaded, error: stripeError } = useStripeContext();
  const [elements, setElements] = useState<any>(null);
  const [paymentElement, setPaymentElement] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Cleanup will be handled by the component unmount
    };
  }, []);

  // Initialize Elements
  useEffect(() => {
    if (!isLoaded || !stripe || !clientSecret || !mountedRef.current) return;

    const initializeElements = async () => {
      try {
        // Create new elements instance
        const elementsInstance = stripe.elements({
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#10B981',
              colorBackground: '#ffffff',
              colorText: '#30313d',
              colorDanger: '#df1b41',
              fontFamily: 'Inter, system-ui, sans-serif',
              spacingUnit: '4px',
              borderRadius: '8px',
            }
          }
        });

        setElements(elementsInstance);

        // Create payment element
        const paymentElementInstance = elementsInstance.create('payment', {
          layout: {
            type: 'tabs',
            defaultCollapsed: false,
          }
        });

        setPaymentElement(paymentElementInstance);

      } catch (err: any) {
        console.error('Failed to initialize Stripe elements:', err);
        onError?.(err.message);
      }
    };

    initializeElements();
  }, [stripe, isLoaded, clientSecret, onError]);

  // Mount payment element
  useEffect(() => {
    if (!paymentElement || !elementRef.current || !mountedRef.current) return;

    const mountElement = async () => {
      try {
        // Clear any existing content
        if (elementRef.current) {
          elementRef.current.innerHTML = '';
        }

        await paymentElement.mount('#stripe-payment-element');
        
        if (mountedRef.current) {
          setIsMounted(true);
          onReady?.();
        }
      } catch (err: any) {
        console.error('Failed to mount payment element:', err);
        onError?.(err.message);
      }
    };

    mountElement();

    // Cleanup function
    return () => {
      if (paymentElement && mountedRef.current) {
        try {
          paymentElement.unmount();
        } catch (err) {
          // Ignore unmount errors as element might already be unmounted
          console.log('Payment element already unmounted');
        }
      }
    };
  }, [paymentElement, onReady, onError]);

  // Handle Stripe context errors
  useEffect(() => {
    if (stripeError && onError) {
      onError(stripeError);
    }
  }, [stripeError, onError]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading payment gateway...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div 
        id="stripe-payment-element" 
        ref={elementRef}
        className="min-h-[200px]"
      />
      {isMounted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-green-500">✅</span>
            <p className="text-sm text-green-700">
              Payment form loaded successfully
            </p>
          </div>
        </div>
      )}
    </div>
  );
};