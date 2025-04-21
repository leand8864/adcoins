import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Elements } from "@stripe/stripe-js-react";
import { loadStripe } from "@stripe/stripe-js";
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import CheckoutForm from "~/components/CheckoutForm";
import { createPaymentIntent } from "~/services/stripe.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Payment" },
    { name: "description", content: "Secure payment processing" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  // In a real app, get these values from the contract/escrow
  const amount = 1000; // $10.00 in cents
  const contractId = 'sample-contract-123'; // Get from URL params
  
  try {
    const paymentIntent = await createPaymentIntent({
      amount,
      metadata: {
        contractId,
        platform: 'freelancer-app'
      },
      description: `Payment for contract ${contractId}`
    });
    
    const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY!);
    return json({ 
      stripePromise,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount / 100 // Convert to dollars
    });
  } catch (error) {
    console.error('Failed to create payment intent:', error);
    return redirect('/payment-error');
  }
}

export default function Payment() {
  const { stripePromise, clientSecret, amount } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Payment</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-2xl mx-auto">
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm amount={amount} />
        </Elements>
      </div>
    </div>
  );
}
