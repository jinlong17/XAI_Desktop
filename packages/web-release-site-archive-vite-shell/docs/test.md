# web-release-site-archive-vite-shell — Test Plan

## Validation Strategy

This planning row is docs-only. Validation focuses on path decisions, contract completeness, and implementation readiness for the later scaffold build.

## Unit / Build Coverage To Prepare

When this feature is implemented, the build row should validate:

1. `pnpm --filter @repo/web dev` starts the Vite host.
2. `pnpm --filter @repo/web build` emits Vite output successfully.
3. `pnpm --filter @repo/web check-types` passes with the new host scaffold.
4. root `pnpm dev` / `turbo run dev` pick up the canonical host but do not pick up the archive package as a default app target.
5. root `turbo run build` and `turbo run check-types` do not break `apps/docs` or desktop packages and do not require the archived Next app to behave like a product build.

## Contract Coverage

Planning review should confirm:

1. `docs/reviews/web-release-site-archive-vite-shell/20260521-feature-brief.md` exists and reflects the roadmap seed.
2. `docs/reviews/web-release-site-archive-vite-shell/20260521-discovery-review.md` clearly recommends one archive/new-host split.
3. `packages/web-release-site-archive-vite-shell/docs/{design,api,test,dev_log}.md` exist.
4. The plan freezes:
   - `apps/web` => canonical Vite `@repo/web`
   - archived Next shell => `apps/release-site/`
   - archived workspace package => `@repo/release-site-archive` with demoted `archive:*` scripts only
   - thin-host boundary => routes/providers/sw hooks/injection only
   - root command behavior => `pnpm dev` / `turbo run build` do not treat the archive as product truth

## Per-Phase Verification Gates

### Phase 1 — Archive move and classification

- `test -d apps/release-site/app/console`
- `test -f apps/release-site/README.md`
- `rg -n \"@repo/release-site-archive|archive-only|historical static mock|@repo/web\" apps/release-site/package.json apps/release-site/README.md`
- `jq '.scripts' apps/release-site/package.json`
  - acceptance: no standard `dev`, `build`, or `start`

### Phase 2 — Canonical Vite host scaffold

- `test -f apps/web/index.html`
- `test -f apps/web/src/main.tsx`
- `rg -n '\"name\": \"@repo/web\"|vite|src/main.tsx' apps/web/package.json apps/web/vite.config.ts apps/web/src/main.tsx`
- `test ! -d apps/web/app`

### Phase 3 — Turbo/workspace command alignment

- `rg -n 'dist/\\*\\*|\\.next/\\*\\*' turbo.json`
- `pnpm --filter @repo/web build`
- `pnpm --filter @repo/web check-types`
- `turbo run build`
- acceptance:
  - `@repo/web` is the only default browser host target
  - `apps/release-site` is excluded from primary root `dev` / `build` flows

## Suggested Checks

```bash
test -f docs/reviews/web-release-site-archive-vite-shell/20260521-feature-brief.md
test -f docs/reviews/web-release-site-archive-vite-shell/20260521-discovery-review.md
test -f packages/web-release-site-archive-vite-shell/docs/design.md
test -f packages/web-release-site-archive-vite-shell/docs/api.md
test -f packages/web-release-site-archive-vite-shell/docs/test.md
test -f packages/web-release-site-archive-vite-shell/docs/dev_log.md
rg -n "@repo/web|@repo/release-site-archive|apps/release-site|archive-only|thin shell|/app/\\*" docs/reviews/web-release-site-archive-vite-shell/20260521-discovery-review.md packages/web-release-site-archive-vite-shell/docs/design.md packages/web-release-site-archive-vite-shell/docs/api.md packages/web-release-site-archive-vite-shell/docs/test.md
```

## Mock Strategy

None in this planning row. Later implementation rows may use placeholder routes or provider stubs, but this feature only defines where those mocks may live.

## Acceptance Focus

- Reviewers can tell exactly which directory becomes the real Web host and which directory becomes archive/reference-only.
- Later build work has an executable one-phase-at-a-time task list with fixed file boundaries, command behavior, and gates.
- The docs make it explicit that the old static `/console` mock is not the future product truth source and cannot re-enter root workflows through standard scripts.
