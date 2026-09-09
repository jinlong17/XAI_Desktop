"""Run the original two assertions unchanged against a fixed repository snapshot."""
import io, json, pathlib, shutil, subprocess, tarfile, tempfile
root = pathlib.Path(__file__).resolve().parents[3]
revision = 'e45f78e'
with tempfile.TemporaryDirectory(prefix='xai-ai-original-') as temporary:
    snapshot = pathlib.Path(temporary).resolve()
    archive = subprocess.check_output(['git', 'archive', revision], cwd=root)
    with tarfile.open(fileobj=io.BytesIO(archive)) as content:
        content.extractall(snapshot)  # Trusted local git archive; supports the bundled Python version.
    (snapshot/'node_modules').symlink_to(root/'node_modules', target_is_directory=True)
    aliases = {}
    for package in (snapshot/'packages').iterdir():
        manifest = package/'package.json'
        if not manifest.exists(): continue
        pkg = json.loads(manifest.read_text())
        (package/'node_modules').symlink_to(root/'packages'/package.name/'node_modules', target_is_directory=True)
        for name, target in pkg.get('exports', {}).items():
            if isinstance(target, dict): target = target.get('import', target.get('default'))
            if not isinstance(target, str) or '*' in name: continue
            aliases[pkg['name'] + ('' if name == '.' else name[1:])] = str(package/target)
    config = snapshot/'docs/reviews/web-ai-tool-write-receipts/verify.config.mjs'
    source = config.read_text().replace('alias: { react:', 'alias: { ...'+json.dumps(aliases)+', react:')
    config.write_text(source)
    print('Fixed revision:', revision, 'Original save-contract.test.tsx unchanged; workspace aliases resolve into snapshot.', flush=True)
    command = [str(root/'packages/xai-web-tasks/node_modules/.bin/vitest'), 'run', '--root', str(snapshot), '--config', str(config)]
    result = subprocess.run(command, cwd=snapshot)
    raise SystemExit(result.returncode)
