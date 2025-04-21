import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { requireUser } from "~/services/auth.server";
import { getEscrowById, resolveDispute, updateEscrowStatus } from "~/services/db.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Resolve Dispute" },
    { name: "description", content: "Resolve escrow dispute" },
  ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireUser(request, 'admin');
  const escrowId = params.id!;
  
  const escrow = await getEscrowById(escrowId);
  if (!escrow || escrow.status !== 'disputed') {
    throw json({ error: 'Escrow not in disputed state' }, { status: 400 });
  }
  
  // In real app, fetch dispute details from DB
  return json({
    escrowId,
    dispute: {
      reason: "Work not delivered as agreed",
      raisedBy: escrow.clientId,
      raisedAt: escrow.disputedAt
    }
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser(request, 'admin');
  const escrowId = params.id!;
  
  const formData = await request.formData();
  const resolution = formData.get('resolution') as string;
  const notes = formData.get('notes') as string;
  
  // In real app, process payment based on resolution
  await resolveDispute(escrowId, `${resolution}: ${notes}`, user.id);
  
  if (resolution === 'release_to_freelancer') {
    await updateEscrowStatus(escrowId, 'released');
  } else if (resolution === 'refund_to_client') {
    await updateEscrowStatus(escrowId, 'refunded');
  }
  
  return redirect('/escrow?resolved=true');
}

export default function ResolveDispute() {
  const { escrowId, dispute } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Resolve Dispute</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {/* ... existing dispute details UI ... */}
        
        <Form method="post" className="space-y-4">
          {/* ... existing form fields ... */}
        </Form>
      </div>
    </div>
  );
}
