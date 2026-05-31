# Roadmap Seed Brief - account-sync-site-entry-contract

## Requirement

Define the official website and account-entry contract for Account Cloud Sync. Site should support login/account entry, release and download context, account status messaging, and public sync/security claims without becoming a product data surface.

## Hard Constraints

- Site is PROPOSED and requires operator confirmation before implementation.
- Site may link to account entry, downloads, release notes, update metadata, and status information, but must not host private product state or sync payloads.
- Account and auth entry points must reuse the shared account/device/session contract.
- Security claims must be traceable to ADR-0013, sync-v1 PRD, and technical requirements, not marketing-only wording.

## Acceptance Signal

- A site boundary document lists allowed site data, forbidden data, account entry flow, download/release integration, and sync/security messaging sources.
- Any future Site implementation is routed through `codex/site/<feature>` only after operator activation.
