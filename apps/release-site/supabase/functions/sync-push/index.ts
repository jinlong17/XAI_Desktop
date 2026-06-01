import {
  normalizePushBatchRequest,
  processPushBatch,
  type PushDatabase,
  type PushRequestContext,
} from './handler.ts';
import { createPostgresSyncDatabase } from '../_shared/postgres-sync-db.ts';
import { resolveSyncRequestContext } from '../_shared/request-context.ts';

declare const Deno:
  | {
      env: {
        get(name: string): string | undefined;
      };
      serve(handler: (request: Request) => Promise<Response>): void;
    }
  | undefined;

export async function handleSyncPush(
  request: Request,
  db: PushDatabase,
  context: PushRequestContext = {},
): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'method_not_allowed' }, { status: 405 });
  }

  try {
    const requestContext = resolveSyncRequestContext(request, context);
    const response = await processPushBatch(
      db,
      normalizePushBatchRequest(await request.json(), requestContext),
    );
    return Response.json(response, { status: response.status });
  } catch (error) {
    return Response.json(
      {
        error: 'invalid_sync_push_request',
        message: error instanceof Error ? error.message : 'invalid request',
      },
      { status: 400 },
    );
  }
}

if (typeof Deno !== 'undefined') {
  Deno.serve(async (request) => {
    const databaseUrl = readDatabaseUrl();
    if (!databaseUrl) {
      return Response.json(
        { error: 'sync_push_database_url_missing' },
        { status: 503 },
      );
    }

    const db = await createPostgresSyncDatabase(databaseUrl);
    try {
      return await handleSyncPush(request, db);
    } finally {
      await db.close();
    }
  });
}

function readDatabaseUrl(): string | undefined {
  return Deno?.env.get('SUPABASE_DB_URL') ?? Deno?.env.get('DATABASE_URL');
}
