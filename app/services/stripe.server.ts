import { loadStripe } from '@stripe/stripe-js';

let stripePromise: Promise<any>;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY!);
  }
  return stripePromise;
};

interface CreatePaymentIntentParams {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
  customerEmail?: string;
  description?: string;
}

export async function createPaymentIntent({
  amount,
  currency = 'usd',
  metadata = {},
  customerEmail,
  description = 'Freelancer platform payment'
}: CreatePaymentIntentParams) {
  try {
    // Validate amount
    if (amount < 50) { // Minimum $0.50
      throw new Error('Amount must be at least 50 cents');
    }

    // Prepare request body
    const body = new URLSearchParams({
      amount: amount.toString(),
      currency,
      'automatic_payment_methods[enabled]': 'true',
      description,
      ...(customerEmail && { receipt_email: customerEmail }),
      ...(Object.keys(metadata).length > 0 && { 
        metadata: JSON.stringify(metadata) 
      })
    });

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
      },
      body
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Stripe API error');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  try {
    const response = await fetch(
      `https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to retrieve payment intent');
    }

    return await response.json();
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
}
