# push-edge-function Test Notes

Run:

```bash
pnpm --filter web test:push
pnpm --filter web check-types
```

Verified:

- ok record writes a blob and stores mutation dedup result
- resubmitting the same mutation id returns `duplicate_mutation_id` and does
  not allocate a new commit sequence
- stale base revision returns `revision_mismatch`
- conflict shadow receives incoming loser metadata
- mixed batch returns 207 with per-record statuses
- Rust envelope metadata is parsed into server columns

Deferred:

- hosted Supabase deploy
- real service_role database adapter
- concurrent write integration against Postgres
- Edge Function auth/JWT extraction
