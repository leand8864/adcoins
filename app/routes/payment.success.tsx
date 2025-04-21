import { json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Payment Success" },
    { name: "description", content: "Payment completed successfully" },
  ];
};

export default function PaymentSuccess() {
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-2xl mx-auto text-center">
        <div className="text-green-500 text-5xl mb-4">✓</div>
        <h1 className="text-3xl font-bold mb-4">Payment Successful</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your payment has been processed successfully. A receipt has been sent to your email.
        </p>
        <Link
          to="/dashboard"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
