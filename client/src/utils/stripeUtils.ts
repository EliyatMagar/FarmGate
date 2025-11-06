// utils/stripeUtils.ts

let stripePromise: Promise<any> | null = null;
let stripeInstance: any = null;

export const loadStripeScript = (publishableKey: string): Promise<any> => {
  // Return existing promise if available
  if (stripePromise) {
    return stripePromise;
  }

  stripePromise = new Promise((resolve, reject) => {
    // Check if Stripe is already loaded and we have an instance
    if (stripeInstance) {
      console.log('✅ Stripe instance already available');
      resolve(stripeInstance);
      return;
    }

    // Check if Stripe class is available but no instance created
    if ((window as any).Stripe) {
      console.log('✅ Stripe class available, creating new instance');
      stripeInstance = (window as any).Stripe(publishableKey);
      resolve(stripeInstance);
      return;
    }

    // Load Stripe script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('✅ Stripe script loaded successfully');
      try {
        // Create Stripe instance
        stripeInstance = (window as any).Stripe(publishableKey);
        
        if (!stripeInstance) {
          throw new Error('Failed to create Stripe instance');
        }
        
        console.log('✅ Stripe instance created successfully');
        resolve(stripeInstance);
      } catch (error) {
        console.error('❌ Failed to create Stripe instance:', error);
        reject(new Error('Failed to initialize Stripe payment gateway'));
      }
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load Stripe script');
      stripePromise = null; // Reset promise on error
      reject(new Error('Failed to load Stripe payment gateway'));
    };
    
    // Add to document head
    document.head.appendChild(script);
  });

  return stripePromise;
};

export const createStripePaymentForm = async (
  publishableKey: string, 
  options: {
    clientSecret: string;
    appearance?: any;
    returnUrl?: string;
  }
) => {
  try {
    console.log('🔄 Creating Stripe payment form...');
    
    const stripe = await loadStripeScript(publishableKey);
    
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    // Create elements with proper error handling
    const elementsOptions = {
      clientSecret: options.clientSecret,
      appearance: options.appearance || {
        theme: 'stripe' as const,
        variables: {
          colorPrimary: '#006400',
          colorBackground: '#ffffff',
          colorText: '#30313d',
          colorDanger: '#df1b41',
          fontFamily: 'Ideal Sans, system-ui, sans-serif',
          spacingUnit: '4px',
          borderRadius: '4px',
        },
        rules: {
          '.Input': {
            border: '1px solid #e1e5e9',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '16px'
          }
        }
      },
      loader: 'always' as const,
      fonts: [
        {
          cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
        },
      ]
    };

    const elements = stripe.elements(elementsOptions);

    // Create payment element with simplified options
    const paymentElement = elements.create('payment', {
      layout: {
        type: 'tabs' as const,
        defaultCollapsed: false,
      },
      fields: {
        billingDetails: {
          name: 'never' as const,
          email: 'never' as const,
          phone: 'never' as const,
          address: {
            country: 'never' as const,
            postalCode: 'never' as const,
          },
        },
      },
      wallets: {
        applePay: 'never' as const,
        googlePay: 'never' as const,
      }
    });

    console.log('✅ Stripe payment element created successfully');
    
    return {
      stripe,
      elements,
      paymentElement
    };
  } catch (error) {
    console.error('❌ Stripe initialization error:', error);
    
    // Reset stripe promise on error to allow retry
    stripePromise = null;
    stripeInstance = null;
    
    throw new Error('Failed to initialize Stripe payment form');
  }
};

export const confirmStripePayment = async (
  stripe: any, 
  elements: any, 
  redirectUrl?: string
) => {
  try {
    console.log('🔄 Confirming Stripe payment...');
    
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: redirectUrl || `${window.location.origin}/payment-success`,
        payment_method_data: {
          // Add any additional payment method data if needed
        }
      },
      redirect: 'if_required'
    });

    if (error) {
      console.error('❌ Stripe payment confirmation error:', error);
      
      // Handle specific error types
      let userMessage = 'Payment confirmation failed';
      
      switch (error.type) {
        case 'validation_error':
          userMessage = 'Please check your payment details and try again.';
          break;
        case 'card_error':
          userMessage = `Card error: ${error.message}`;
          break;
        case 'invalid_request_error':
          userMessage = 'Invalid payment request. Please try again.';
          break;
        default:
          userMessage = error.message || userMessage;
      }
      
      throw new Error(userMessage);
    }

    console.log('✅ Stripe payment confirmed successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Stripe payment error:', error);
    throw error;
  }
};

// Cleanup function to reset Stripe state
export const cleanupStripe = () => {
  console.log('🧹 Cleaning up Stripe...');
  stripePromise = null;
  stripeInstance = null;
};

// Utility to check if Stripe is loaded
export const isStripeLoaded = (): boolean => {
  return !!(window as any).Stripe;
};

// Utility to get current Stripe instance
export const getStripeInstance = () => {
  return stripeInstance;
};