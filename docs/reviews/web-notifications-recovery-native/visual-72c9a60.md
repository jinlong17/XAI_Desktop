# Notifications visual correction and bounded acceptance

Parent inspected actual 6b90b22 desktop screenshot and found circular stretched switch tracks / vertically displaced knobs. Initial generic hit-target geometry passed; it was insufficient for visual acceptance. Added specific unchanged toggle-state oracle: fixed6b90b22 correctly FAILS `Knob not vertically centered`.

Terra CSS-only72c9a60 repairs independent .notif-pane selectors; DateTime selectors and global Toggle rules unchanged. Parent exact before oracle passes initial, inverted, restored states on all five switches: 44x44 hitbox,36x20 track,16x16 knob, vertical center delta0. Trusted clicks work in all states.

EN and ZH geometry at375/414/768/1024/1440 passes control containment, hit testing and >=44px targets. Screenshots retained. Parent manually inspected fixed1440 EN and375 ZH against before1440: track and knob now correctly centered, text/actions readable, no overlapping controls in inspected views. This is scoped visual acceptance, not a claim that every screen's visual design or the complete hidden/dialog/focus contract is accepted.

Spark attempt for this bounded CSS task failed before execution with `agents.max_threads cannot be set when multi_agent_v2 is enabled`; this was a launch compatibility failure, not quota exhaustion. Actual implementer is Terra, parent independent reviewer Astra. No fallback output is labelled Spark.

Separate fixed6b90b22 Web types/lint, Settings types/lint and storage types all PASS; receipt ../web-date-time-recovery-independent/types-lint-6b90b22-notifications.log. CSS-only72c9a60 does not change these TypeScript sources. Later Notifications field-error correction needs its own verification.
