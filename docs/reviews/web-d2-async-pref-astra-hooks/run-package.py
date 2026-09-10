#!/usr/bin/env python3
"""Archive fixed storage source, run original author hook suite/package/types independently."""
import pathlib, subprocess, tempfile, sys
owned=pathlib.Path(__file__).resolve().parent;repo=owned.parents[2]; revision=sys.argv[1]
commit=subprocess.check_output(['git','rev-parse',revision],cwd=repo,text=True).strip();root=pathlib.Path(tempfile.mkdtemp(prefix='astra-hooks-package-'))
proc=subprocess.Popen(['git','archive',commit],cwd=repo,stdout=subprocess.PIPE);subprocess.run(['tar','-x','-C',str(root)],stdin=proc.stdout,check=True);proc.stdout.close();assert proc.wait()==0
for source in [repo/'node_modules',*repo.glob('packages/*/node_modules')]:
 if source.exists() and (root/source.relative_to(repo)).parent.exists():(root/source.relative_to(repo)).symlink_to(source,target_is_directory=True)
binaries=repo/'packages/plugin-web-storage/node_modules/.bin'; failed=False
for suffix,command in [('author-hooks',['vitest','run','src/__tests__/usePrefAsync.contract.test.tsx','--reporter=verbose']),('package',['vitest','run']),('types',['tsc','--noEmit'])]:
 with (owned/f'independent-{revision}-{suffix}.log').open('w') as out:
  out.write(f'Independent Astra execution; product={commit}; archive={root}; original package source/tests, no overlay\n');out.flush()
  result=subprocess.run([str(binaries/command[0]),*command[1:]],cwd=root/'packages/plugin-web-storage',stdout=out,stderr=subprocess.STDOUT)
  out.write(f'EXIT_CODE={result.returncode}\n');failed|=result.returncode!=0
 print(suffix,result.returncode,flush=True)
sys.exit(1 if failed else 0)
