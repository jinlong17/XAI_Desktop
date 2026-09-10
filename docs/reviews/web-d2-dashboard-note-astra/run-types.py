#!/usr/bin/env python3
"""Pinned Dashboard types: all workspace product imports alias into git archive."""
import json,pathlib,subprocess,sys,tempfile
owned=pathlib.Path(__file__).resolve().parent;repo=owned.parents[2];revision=sys.argv[1]
commit=subprocess.check_output(['git','rev-parse',revision],cwd=repo,text=True).strip();root=pathlib.Path(tempfile.mkdtemp(prefix='astra-dashboard-types-'))
p=subprocess.Popen(['git','archive',commit],cwd=repo,stdout=subprocess.PIPE);subprocess.run(['tar','-x','-C',str(root)],stdin=p.stdout,check=True);p.stdout.close();assert p.wait()==0
for source in [repo/'node_modules',*repo.glob('packages/*/node_modules')]:
 target=root/source.relative_to(repo)
 if source.exists() and target.parent.exists():target.symlink_to(source,target_is_directory=True)
aliases=[];paths={}
for manifest in (root/'packages').glob('*/package.json'):
 package=json.loads(manifest.read_text())
 for export,value in package.get('exports',{}).items():
  target=value if isinstance(value,str) else value.get('import',value.get('default')) if isinstance(value,dict) else None
  if isinstance(target,str) and '*' not in export:
   name=package['name']+('' if export=='.' else export[1:]);resolved=str(manifest.parent/target);aliases.append({'find':name,'replacement':resolved});paths[name]=[resolved]
aliases.sort(key=lambda v:-len(v['find']))
settings=root/'packages/xai-web-dashboard-grid';bin=repo/'packages/xai-web-dashboard-grid/node_modules/.bin'
config=settings/'astra-fixed.config.mjs';config.write_text('export default '+json.dumps({'root':str(settings),'resolve':{'alias':aliases},'esbuild':{'jsx':'automatic'},'test':{'environment':'jsdom','globals':True,'setupFiles':['./vitest.setup.ts'],'include':['src/__tests__/**/*.{test,spec}.{ts,tsx}']}}))
types=settings/'tsconfig.astra-fixed.json';types.write_text(json.dumps({'extends':'./tsconfig.json','compilerOptions':{'baseUrl':str(root),'paths':paths}}))
failed=False
for label,command in [('dashboard-types',[str(bin/'tsc'),'--noEmit','-p',str(types)])]:
 with (owned/f'independent-{revision}-{label}.log').open('w') as out:
  out.write(f'Independent Astra product={commit} archive={root}; fixed workspace aliases; no product overlay\n');out.flush();r=subprocess.run(command,cwd=settings,stdout=out,stderr=subprocess.STDOUT);out.write(f'EXIT_CODE={r.returncode}\n');failed|=r.returncode!=0
 print(label,r.returncode,flush=True)
sys.exit(1 if failed else 0)
