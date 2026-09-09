# REL-04 independent verification — local account/device exports

Date: 2026-09-09. Module: web. Verdict: **PASS for the bounded export UI/API change**. This is not full REL-04 lifecycle acceptance or release approval.

## Baseline and method

Reviewed implementation: Settings UI `55d826e`, storage API `60a1b6e`. Final browser run uses immutable Git archive `62f7bfc855acd5ef9e0d5b1de57c00ded896b7ab`, which contains both. Every `@repo` import resolves to the archive; installed dependency packages are reused without modifying dependencies. Concurrent working-tree REL-05/REL-06 edits are not bundled or counted as verified.

Run `node docs/reviews/web-data-export-independent/verify-browser-export.mjs`. The default source revision is pinned; `REL04_VERIFY_REF` explicitly selects another revision. Actual Chrome 152.0.7977.83 runs with an isolated temporary profile, local HTTP fixture server and temporary download folder. Source accountPane, DeviceRecoveryExport, Settings shell, CSS and export APIs are real. WebAuthSessionProvider is mounted with no configured server; synthetic account scope is activated directly. The harness invokes no hosted auth, account deletion or production data.

Downloads use normal Blob URLs and real anchors; Chrome writes JSON files, then Node reads and parses them. No URL.createObjectURL/anchor-click/export API mock is used. Parsed fixture strings are compared against separately declared originals, not implementation expressions. Download files/profile are removed after the check; manifest logs and reproducible fixtures are retained in this directory.

## Results

| Check | Independent observed result |
| --- | --- |
| Default controls | Both legacy-history and retained-archive checkboxes unchecked. Disclosure opens with native Enter key after focus. |
| Account A file | Three records: Time Tracker, Bookkeeping, Metrics; current generation only. An A credential-named record is omitted with manifest reason and visible feedback. Previous A generation, B content, device preferences and unowned history absent. |
| Original strings | Time Tracker whitespace, decimal spelling, escaped newline and Chinese text survive JSON file parsing unchanged. Device layout, legacy raw string and safe archive envelope whitespace preserved. |
| Default device file | Declared bookkeeping layout and timer-display preferences only; both history sections empty. |
| Legacy-only choice | Unowned original record included, archive section empty. Credential-named and unclassified fixtures excluded with manifest reasons. |
| Archives-only choice | Safe unassigned archive included as original raw string, legacy section empty. Credential-containing, malformed and duplicate-field archive envelopes wholly excluded. |
| Both choices | Explicitly selected legacy and safe archive included; five fixture omissions recorded (three unsafe archives, one credential-named key, one unclassified key). UI explains omissions and says original data is unchanged. |
| Account replacement | After activating B, still-mounted A account and device export handlers both show errors and produce no file. After remount, B export contains only its own record. |
| Source preservation | Complete synthetic localStorage key/value snapshot equals initial snapshot after all six downloads and account replacement. |
| Narrow screen | 390px viewport and document width both 390px, including Chinese render. Disclosure target 64.4px, history labels 61.2px, all three export/management buttons 44px high. Native keyboard focus visible. |
| Visual review | English and Chinese device-export screenshots inspected. Text wraps, controls and exclusion copy remain readable, and device history stays secondary to account export. |

Evidence: `20260909-browser-export.log`, `390px-export-en.png`, `390px-export-zh.png`, and `verify-browser-export.mjs`.

The harness preparation required correcting CDP Enter text and handling Chrome's same-name download replacement; these were harness defects, not product defects. The synthetic `xai_lang` fixture is intentionally unclassified in the current registry and is excluded; it is not asserted to be a live device-preference key. Final PASS was rerun from the pinned archive after these corrections.

## Non-blocking UI suggestion

The current-account export and data-management buttons sit immediately adjacent when wrapped to separate rows. Add a small vertical action gap in a later UI pass to improve visual grouping; targets already meet 44px and there is no overlap. The mobile Settings navigation consumes substantial vertical space before the account content; this predates the export change and belongs to the broader Settings audit.

## Explicit limits / remaining acceptance

- This validates selected record families and actual downloads; exhaustive registry completeness, deletion and migration across every active feature remain the REL-04 inventory/other verification work. Do not extrapolate six files to all-data lifecycle coverage.
- No JSON import/restore is implemented or claimed. Both UI and manifest explicitly say restore is unsupported; an export request is not a cloud backup.
- No native IDB failure, browser-process crash recovery, cloud deletion, other-browser behavior or real authenticated deployment was exercised here. REL-06 deletion durability/participants/cross-tab gates remain separate.
- Export exclusion protects classified key families; this run is not an exhaustive adversarial proof about arbitrary custom-preference names or sensitive content inside otherwise allowed user records.
- CSS checks cover the actual Settings shell at 390px with package token styles, not the complete production AppRail/router host or every viewport.
- No cross-vendor PASS is claimed; prior Claude authentication was unavailable. Parent owns the full TODO ledger and release decision. No product code or author tests modified by this verification.
