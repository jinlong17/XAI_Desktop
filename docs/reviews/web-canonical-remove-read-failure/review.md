# Canonical legacy removal must fail closed on a failed read

Fixed product: `fb3ae2f`. Module: web. Independent diagnosis using an isolated git archive, real jsdom Storage, captured account scope and a synthetic exact-key SecurityError on getItem only.

Result: 1 correct FAIL / 1 control PASS. On the read-failure path, removePref invokes actual removeItem once and the previously persisted valid canonical envelope becomes null. With readable storage, the same envelope is correctly protected against the legacy removal. The log reports both the unexpected removal count and actual missing bytes.

Root cause: removePref obtains its baseline through readRawPref, whose compatibility contract collapses read failure to null. canonicalWriteBlocked treats null as missing and authorizes removal. A fail-closed removal guard cannot use this lossy reader. Refuse removal if the required read fails; preserve the established behavior of unrelated keys and supported legacy removal. Final D async/reset conversion must also propagate real failure rather than pretending UI reset succeeded.

Run:

```sh
node docs/reviews/web-canonical-remove-read-failure/verify-fixed.mjs fb3ae2f
```

Original desired preservation assertions and raw output are retained. This is a synthetic storage fault, not a claim that every real browser SecurityError allows subsequent removeItem. No product code changed. B1 data-protection acceptance and complete AI-02 remain open pending repair and independent revalidation.

## Independent repair recheck

Fixed product `7b584b3`, unchanged original assertions: 2/2 PASS, exit 0. On a failed canonical read no removal is invoked and exact envelope bytes survive; the readable-envelope rejection control still passes. After log: `independent-7b584b3.log`; the original `independent.log` retains the fb3ae2f failure. The runner now uses revision-suffixed logs to preserve before evidence on later rechecks. This closes only this failed-read removal defect; B1 independent review, B2–D and full AI-02 remain separate.
