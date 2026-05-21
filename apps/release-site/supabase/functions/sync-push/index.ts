import { processPushBatch, type PushDatabase } from './handler';

declare const Deno:
  | {
      serve(handler: (request: Request) => Promise<Response>): void;
    }
  | undefined;

export async function handleSyncPush(
  request: Request,
  db: PushDatabase,
): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'method_not_allowed' }, { status: 405 });
  }

  const response = await processPushBatch(db, await request.json());
  return Response.json(response, { status: response.status });
}

if (typeof Deno !== 'undefined') {
  Deno.serve(async () =>
    Response.json(
      {
        error: 'sync_push_database_adapter_not_bound',
      },
      { status: 501 },
    ),
  );
}
