#!/usr/bin/env python3
"""Run independent tests against archived product only; no live product overlay."""
import hashlib, pathlib, subprocess, sys, tempfile
repo=pathlib.Path(__file__).resolve().parents[3]
owned=pathlib.Path(__file__).resolve().parent
revision=sys.argv[1] if len(sys.argv)>1 else '5ed9329'
commit=subprocess.check_output(['git','rev-parse',revision],cwd=repo,text=True).strip()
root=pathlib.Path(tempfile.mkdtemp(prefix='astra-pref-engine-'))
archive=subprocess.Popen(['git','archive',commit],cwd=repo,stdout=subprocess.PIPE)
subprocess.run(['tar','-x','-C',str(root)],stdin=archive.stdout,check=True)
archive.stdout.close(); assert archive.wait()==0
for source in [repo/'node_modules',*repo.glob('packages/*/node_modules')]:
    if source.exists():
        target=root/source.relative_to(repo)
        if target.parent.exists(): target.symlink_to(source,target_is_directory=True)
test=owned/'engine.test.ts'
(root/'packages/plugin-web-storage/src/__tests__/astraEngine.test.ts').write_bytes(test.read_bytes())
print(f'INDEPENDENT ASTRA product={commit} archive={root} test_sha256={hashlib.sha256(test.read_bytes()).hexdigest()}',flush=True)
result=subprocess.run([str(repo/'packages/plugin-web-storage/node_modules/.bin/vitest'),'run','src/__tests__/astraEngine.test.ts','--reporter=verbose'],cwd=root/'packages/plugin-web-storage')
print(f'EXIT_CODE={result.returncode}',flush=True)
sys.exit(result.returncode)
