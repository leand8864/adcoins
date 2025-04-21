import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Clients" },
    { name: "description", content: "Manage your clients" },
  ];
};

export async function loader() {
  return json({
    clients: [
      {
        id: "1",
        name: "Acme Corp",
        email: "contact@acme.com",
        projects: 3,
        totalSpent: 7500,
      },
      {
        id: "2",
        name: "Startup XYZ",
        email: "hello@startupxyz.com",
        projects: 1,
        totalSpent: 1800,
      },
    ],
  });
}

export default function Clients() {
  const { clients } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Link
          to="/clients/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Client
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Projects
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Total Spent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {clients.map((client) => (
              <tr key={client.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium">{client.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {client.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {client.projects}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ${client.totalSpent.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    to={`/clients/${client.id}`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-600"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
