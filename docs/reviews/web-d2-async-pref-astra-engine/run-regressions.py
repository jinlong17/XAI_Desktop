#!/usr/bin/env python3
"""Reuse established independent archive runners; redirect all new logs here."""
import pathlib, subprocess, sys
owned=pathlib.Path(__file__).resolve().parent
repo=owned.parents[2]
fixtures=repo/'docs/reviews/web-board-workspace-astra-review'
revision=sys.argv[1]
groups=[('verify-c-primitive.mjs','c-primitive-independent'),('verify-c-primitive.mjs','c-primitive-boundaries'),('verify-d1.mjs','d1-shared-independent'),('verify-d2.mjs','d2-foundation-independent'),('verify-d2.mjs','d2-deletion-admission'),('verify-c-primitive.mjs','c-storage-package')]
import json
failed=False
for runner,suite in groups:
    source=(fixtures/runner).read_text()
    source=source.replace("const root = fileURLToPath(new URL('../../../', import.meta.url));",f'const root = {json.dumps(str(repo))};')
    source=source.replace("const evidence = fileURLToPath(new URL('./', import.meta.url));",f'const evidence = {json.dumps(str(fixtures))}; const output = {json.dumps(str(owned))};')
    source=source.replace('writeFileSync(join(evidence,name','writeFileSync(join(output,name')
    result=subprocess.run(['node','--input-type=module','-',revision,suite,'astra-engine'],input=source,text=True,cwd=repo)
    failed=failed or result.returncode!=0
sys.exit(1 if failed else 0)
