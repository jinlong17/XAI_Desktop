# Roadmap Seed - desktop-auto-update-release-channel

> Roadmap: xai-desktop-remaining-p2-p3-future
> Phase tag: P1-Phase2
> Branch: dev

## Requirement

Add a Tauri updater and release-channel plan plus implementation suitable for internal builds. Signing, notarization, and credential gaps must be explicit gates rather than hidden assumptions.

## Hard constraints

- Do not claim external release readiness without signing/notarization evidence or an explicit disabled/update-unavailable behavior.
- Keep internal-build update channels separate from production release promises.
- Do not run ship or push release artifacts from roadmap-loop.

## Acceptance signal

Internal updater behavior is implemented or safely disabled with clear user/admin messaging, release-channel metadata is documented, and missing credentials are classified as explicit gates.

## Dependencies (advisory - manifest is authoritative)

Precondition: `desktop-phase1-rc-release-gate` SHIPPED.
