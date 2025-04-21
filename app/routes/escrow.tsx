import { json } from "@remix-run/node";
import { useLoaderData, Link, Form } from "@remix-run/react";
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { retrievePaymentIntent } from "~/services/stripe.server";
import { requireUser } from "~/services/auth.server";
import { getEscrowsByUser } from "~/services/db.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Escrow Management" },
    { name: "description", content: "Manage escrow payments" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const escrows = await getEscrowsByUser(user.id);

  // Enhance with Stripe data
  const enhancedEscrows = await Promise.all(escrows.map(async escrow => {
    if (!escrow.paymentIntentId) return escrow;
    
    try {
      const paymentIntent = await retrievePaymentIntent(escrow.paymentIntentId);
      return {
        ...escrow,
        paymentStatus: paymentIntent.status,
        lastPaymentError: paymentIntent.last_payment_error?.message
      };
    } catch (error) {
      console.error(`Failed to fetch payment intent ${escrow.paymentIntentId}:`, error);
      return escrow;
    }
  }));

  return json({ escrows: enhancedEscrows, currentUser: user });
}

export default function Escrow() {
  const { escrows, currentUser } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Escrow Management</h1>
      
      <div className="space-y-6">
        {escrows.map(escrow => (
          <div key={escrow.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{escrow.title}</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Contract ID: {escrow.contractId}
                </p>
                <div className="mt-2">
                  <p><span className="font-medium">Client:</span> {escrow.clientId}</p>
                  <p><span className="font-medium">Freelancer:</span> {escrow.freelancerId}</p>
                  <p><span className="font-medium">Amount:</span> ${escrow.amount.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs ${
                  escrow.status === 'funded' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                  escrow.status === 'released' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                  escrow.status === 'disputed' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}>
                  {escrow.status}
                </span>
                {escrow.paymentStatus && (
                  <div className="mt-1 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Payment: </span>
                    <span className={
                      escrow.paymentStatus === 'succeeded' ? 'text-green-500 dark:text-green-400' :
                      escrow.paymentStatus === 'requires_payment_method' ? 'text-red-500 dark:text-red-400' :
                      'text-yellow-500 dark:text-yellow-400'
                    }>
                      {escrow.paymentStatus}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              {escrow.status === 'pending' && currentUser.role === 'client' && (
                <Link
                  to={`/payment?contractId=${escrow.contractId}&amount=${escrow.amount}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Fund Escrow
                </Link>
              )}
              
              {escrow.status === 'funded' && currentUser.role === 'client' && (
                <>
                  <Form method="post" action={`/escrow/${escrow.id}/release`}>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Release Payment
                    </button>
                  </Form>
                  <Form method="post" action={`/escrow/${escrow.id}/dispute`}>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                      Raise Dispute
                    </button>
                  </Form>
                </>
              )}
              
              {escrow.status === 'disputed' && currentUser.role === 'admin' && (
                <Link
                  to={`/escrow/${escrow.id}/resolve`}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Resolve Dispute
                </Link>
              )}
              
              {escrow.status === 'disputed' && 
                (currentUser.role === 'client' || currentUser.role === 'freelancer') && (
                <div className="text-sm text-yellow-600 dark:text-yellow-400">
                  Dispute in progress
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
