# Board to canonical Tasks writer: D1 independent entry baseline

Parent/non-author checks against fixed 94f1183, isolated git archive. This is the approved D1 ordinary-writer contract in 7b95133, not a change to Board/Tasks product scope or cross-key atomicity guarantees.

Four assertions: 2 correct FAIL / 2 PASS. With explicit canonical activation, linking a valid Board card fails at the task phase for both a physically absent Tasks record and a valid existing envelope. Both still use the old synchronous writer. Expected final behavior is a canonical Tasks write preserving existing receipts, one linked task, a completed Board acknowledgement, and idempotent repeat without changing Tasks bytes.

Controls confirm that both physical JSON null and envelope data:null refuse before writing the Board intent and preserve original bytes. Keep these passing controls while converting the command to async intent -> Tasks -> acknowledgement. The regression does not authorize restoring a synchronous bypass.

```sh
node docs/reviews/web-board-canonical-link-independent/verify-fixed.mjs 94f1183
```

Evidence: board-link-94f1183.log. Real command and storage are used in jsdom; lock scheduling is injected. This baseline is not an actual Board UI/native concurrency test. Subsequent verification must still cover failed intent/task/ack recovery, captured source/owner revalidation after awaits, queued external changes, and actual Module pending/error behavior. No whole D1 or numbered item is accepted here.
