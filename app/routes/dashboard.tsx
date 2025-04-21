import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Freelancer Dashboard" },
    { name: "description", content: "Manage your freelance work" },
  ];
};

export async function loader() {
  return json({
    activeContracts: [
      {
        id: "1",
        title: "Website Development",
        client: "Acme Corp",
        amount: 2500,
        status: "in-progress",
      },
    ],
    balance: 1200,
  });
}

export default function Dashboard() {
  const { activeContracts, balance } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Freelancer Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Account Balance</h2>
          <p className="text-2xl">${balance.toLocaleString()}</p>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Active Contracts</h2>
          {activeContracts.length > 0 ? (
            <ul className="space-y-4">
              {activeContracts.map((contract) => (
                <li key={contract.id} className="border-b pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{contract.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Client: {contract.client}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${contract.amount.toLocaleString()}</p>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                        {contract.status}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No active contracts</p>
          )}
        </div>
      </div>
    </div>
  );
}
