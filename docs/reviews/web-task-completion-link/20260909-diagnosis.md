# TASK-02 diagnosis / implementation strategy

Scope: web Tasks and Board link completion/lifecycle; Statistics consumer belongs to parent. Before source inspection confirmed the original T05 move/source loss is already fixed by spreading the task. Correct-expectation reproduction: 1 existing control PASS, 4 FAIL (done lookup, Board list movement identity, missing completedAt, link retry clobbering existing data). Original broad audit file was characterization; this focused file asserts desired behavior.

Completion ABI: optional UTC ISO completedAt on false/absent→true; repeated true preserves timestamp, legacy true without a timestamp remains undated; undo removes timestamp; re-completion records a new instant; movement/metadata edits preserve it. Legacy completed[] implies true only when done is missing; explicit false returns to normal tasks. All user completion routes use the shared reducer transition. Stats must keep undated completion in current totals without guessing dates.

Stable source is boardId+cardId; listId remains last-known location metadata. Board archive/restore preserves card identity/link; Tasks do not become uncompleted merely because their source is archived. Existing old deterministic task IDs remain valid; retries preserve existing task changes and completion.

Board create-link currently writes Task then Board through unchecked setters. Fix uses an additive, persisted pending intent in BoardCard.taskLink: save intent first, idempotently ensure Task second, acknowledge Board last. A failed step reports partial/failed state with explicit retry; reopening retains intent. This is not a cross-key atomic transaction. Captured owner guards prevent old A handlers acting on B. No global storage key or account cloud-sync expansion is needed.

Status: BUG_FIX / FIX_IN_PROGRESS. Evidence and regression tests will accompany sub-fix commits. TASK-02 is not closed until independent end-to-end verification. Cross-vendor verification not performed.
