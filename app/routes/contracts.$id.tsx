import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Contract Details" },
    { name: "description", content: "View contract details" },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const contractId = params.id;
  
  // In a real app, this would fetch from your database
  const contract = {
    id: contractId,
    title: "Website Development",
    client: "Acme Corp",
    amount: 2500,
    status: "active",
    startDate: "2023-10-15",
    endDate: "2023-12-15",
    description: "Build a responsive website with CMS integration",
    milestones: [
      {
        id: "1",
        name: "Design Approval",
        amount: 500,
        completed: true,
      },
      {
        id: "2",
        name: "Frontend Development",
        amount: 1000,
        completed: false,
      },
      {
        id: "3",
        name: "Backend Integration",
        amount: 1000,
        completed: false,
      },
    ],
  };

  return json({ contract });
}

export default function ContractDetails() {
  const { contract } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{contract.title}</h1>
        <Link
          to="/contracts"
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Back to Contracts
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Contract Details</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Client:</span> {contract.client}</p>
              <p><span className="font-medium">Amount:</span> ${contract.amount.toLocaleString()}</p>
              <p><span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  contract.status === "active"
                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                    : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                }`}>
                  {contract.status}
                </span>
              </p>
              <p><span className="font-medium">Dates:</span> {contract.startDate} to {contract.endDate}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-600 dark:text-gray-400">{contract.description}</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Milestones</h2>
          <div className="space-y-4">
            {contract.milestones.map((milestone) => (
              <div key={milestone.id} className="border-b pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{milestone.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Amount: ${milestone.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      milestone.completed
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    }`}>
                      {milestone.completed ? "Completed" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
