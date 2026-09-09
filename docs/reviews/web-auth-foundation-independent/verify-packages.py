"""Pin source and every workspace package; dependencies reuse installed packages only."""
from pathlib import Path
import json, subprocess, os, tempfile, shutil
root=Path(__file__).resolve().parents[3]
output=Path(__file__).resolve().parent
snapshot=Path(tempfile.mkdtemp(prefix='xai-auth-independent-'))
try:
 archive=subprocess.run(['git','archive','cfc2d6da8f2650da490004c9bec1b3c96c665a77'],cwd=root,capture_output=True,check=True)
 subprocess.run(['tar','-x','-C',str(snapshot)],input=archive.stdout,check=True)
 os.symlink(root/'node_modules',snapshot/'node_modules')
 aliases={}
 for pkg in (snapshot/'packages').iterdir():
  if (root/'packages'/pkg.name/'node_modules').exists():os.symlink(root/'packages'/pkg.name/'node_modules',pkg/'node_modules')
  if not (pkg/'package.json').exists():continue
  data=json.loads((pkg/'package.json').read_text());export=data.get('exports',{}).get('.')
  if isinstance(export,dict):export=export.get('import') or export.get('default')
  if isinstance(export,str):aliases[data['name']]=str(pkg/export)
 aliases['react']=str(snapshot/'packages/web-auth-device-session/node_modules/react')
 for name,include,setup in [('foundation',['packages/web-auth-device-session/src/auth-generation-store.test.ts','packages/web-auth-device-session/src/auth-generation-client.test.ts','packages/web-auth-device-session/src/auth-generation-coordinator.test.ts'],False)]:
  config={'resolve':{'alias':aliases},'esbuild':{'jsx':'automatic'},'test':{'environment':'jsdom','globals':True,'include':include}}
  if setup:config['test']['setupFiles']=['./packages/web-auth-device-session/vitest.setup.ts']
  (snapshot/(name+'.config.mjs')).write_text('export default '+json.dumps(config))
  result=subprocess.run(['node',str(root/'packages/core/node_modules/vitest/vitest.mjs'),'run','--config',name+'.config.mjs'],cwd=snapshot,capture_output=True,text=True,env={**os.environ,'TZ':'America/Los_Angeles'})
  (output/(name+'-after.log')).write_text(result.stdout+result.stderr)
  print(name,result.returncode)
  if result.returncode:raise SystemExit(result.returncode)
finally:shutil.rmtree(snapshot)
