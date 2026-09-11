# Actual launcher retest after87d1e3f

User-provided87d1e3f removed the V2 max_threads incompatibility and was already included in the parent branch push. This retest used scripts/cowork/run_spark.py for both roles; no product code was edited.

First executions launched Spark but violated the single-child contract: dispatcher forwarded its own orchestration wrapper and each child attempted nested delegation. Exit0 and correct final CSS did not establish role-boundary success. Before JSONL retained. Model self-report was unreliable; runtime turn_context is authoritative.

Follow-up fix: exact role/fork/message JSON payload, explicit instruction to forward only contract text, per-invocation agents.max_depth1. Project max_depth2/concurrency4 and role permissions unchanged. Launcher reports failures to parent; existing parent policy permits GPT-5.5 only on actual Spark quota exhaustion.

Both corrected runs exit0. Runtime assertions verify one exact named-role spawn, fork_turns none, child model gpt-5.3-codex-spark, zero child spawn calls. Message contains all original task text and no wrapper; dispatcher omitted the final newline, so this is not byte-identical prompt transport. Explorer27files/72bindings/52setters/20readers matches JSON. UI complete fixture bytes match min-height44px with colorblue/newline preserved; original32px was the only changed value.

Terra independently reviewed subprocess arguments, scope and permission preservation; compile/diff checks passed. Natural-language dispatcher still requires outcome monitoring; these runs verify actual behavior rather than promising infallibility. Quota fallback was not exercised. Raw before/after JSONL and launcher-runtime-evidence.json accompany this receipt; full model-catalog stderr/auth information excluded.
