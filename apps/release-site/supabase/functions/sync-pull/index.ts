import {
  normalizePullBatchRequest,
  processPullBatch,
  type PullDatabase,
  type PullRequestContext,
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

export async function handleSyncPull(
  request: Request,
  db: PullDatabase,
  context: PullRequestContext = {},
): Promise<Response> {
  if (request.method !== 'GET') {
    return Response.json({ error: 'method_not_allowed' }, { status: 405 });
  }

  try {
    const response = await processPullBatch(
      db,
      normalizePullBatchRequest(
        new URL(request.url),
        resolveSyncRequestContext(request, context),
      ),
    );
    return Response.json(response, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        error: 'invalid_sync_pull_request',
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
        { error: 'sync_pull_database_url_missing' },
        { status: 503 },
      );
    }

    const db = await createPostgresSyncDatabase(databaseUrl);
    try {
      return await handleSyncPull(request, db);
    } finally {
      await db.close();
    }
  });
}

function readDatabaseUrl(): string | undefined {
  return Deno?.env.get('SUPABASE_DB_URL') ?? Deno?.env.get('DATABASE_URL');
}
