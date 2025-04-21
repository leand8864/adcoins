import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { retrievePaymentIntent } from "~/services/stripe.server";
import { requireUser } from "~/services/auth.server";
import { getEscrowById, updateEscrowStatus } from "~/services/db.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser(request, 'client');
  const escrowId = params.id!;
  
  const escrow = await getEscrowById(escrowId);
  if (!escrow) {
    throw json({ error: 'Escrow not found' }, { status: 404 });
  }
  
  if (escrow.clientId !== user.id) {
    throw json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  if (escrow.status !== 'funded') {
    throw json({ error: 'Escrow not in funded state' }, { status: 400 });
  }
  
  // In a real app, process payment release with Stripe
  await updateEscrowStatus(escrowId, 'released');
  
  return redirect('/escrow?released=true');
}
