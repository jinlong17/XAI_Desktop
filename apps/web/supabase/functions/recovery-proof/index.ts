import {
  issueRecoveryChallenge,
  verifyRecoveryPatch,
  type RecoveryProofDatabase,
  type RecoveryProofVerifier,
} from './handler';

declare const Deno:
  | {
      serve(handler: (request: Request) => Promise<Response>): void;
    }
  | undefined;

export async function handleRecoveryProof(
  request: Request,
  db: RecoveryProofDatabase,
  verifier: RecoveryProofVerifier,
): Promise<Response> {
  const url = new URL(request.url);
  const accountId = request.headers.get('x-account-id') ?? '';

  if (request.method === 'POST' && url.pathname.endsWith('/auth/recovery_challenge')) {
    return Response.json(await issueRecoveryChallenge({ db }, accountId));
  }

  if (request.method === 'PATCH' && url.pathname.endsWith('/auth/me')) {
    return Response.json(await verifyRecoveryPatch({ db, verifier }, await request.json()));
  }

  return Response.json({ error: 'method_not_allowed' }, { status: 405 });
}

if (typeof Deno !== 'undefined') {
  Deno.serve(async () =>
    Response.json(
      {
        error: 'recovery_proof_database_adapter_not_bound',
      },
      { status: 501 },
    ),
  );
}
