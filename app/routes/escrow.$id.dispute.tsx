import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { requireUser } from "~/services/auth.server";
import { getEscrowById, updateEscrowStatus, createDispute } from "~/services/db.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const escrowId = params.id!;
  
  const escrow = await getEscrowById(escrowId);
  if (!escrow) {
    throw json({ error: 'Escrow not found' }, { status: 404 });
  }
  
  // Only client or freelancer involved in this escrow can dispute
  if (escrow.clientId !== user.id && escrow.freelancerId !== user.id) {
    throw json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  if (escrow.status !== 'funded') {
    throw json({ error: 'Escrow not in funded state' }, { status: 400 });
  }
  
  const formData = await request.formData();
  const reason = formData.get('reason') as string;
  
  await updateEscrowStatus(escrowId, 'disputed');
  await createDispute({
    escrowId,
    raisedBy: user.id,
    reason: reason || 'No reason provided'
  });
  
  return redirect('/escrow?disputed=true');
}
