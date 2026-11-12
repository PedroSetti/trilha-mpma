from pathlib import Path
import argparse,shutil,zipfile,json,re,subprocess,sys
parser=argparse.ArgumentParser();parser.add_argument('--origin',default='https://trilha-concursos-pedro.pages.dev');args=parser.parse_args()
if not re.fullmatch(r'https://[a-z0-9-]+\.pages\.dev',args.origin):raise ValueError('Use the exact owned Cloudflare Pages production origin')
root=Path(__file__).resolve().parent.parent
repository=(root/'server/study').exists()
if repository:
 subprocess.run([sys.executable,str(root/'frontend/build.py')],check=True)
source=root/('frontend/dist' if repository else 'work/netlify-trilha');out=root/('frontend/cloudflare-dist' if repository else 'work/cloudflare-trilha');out.mkdir(exist_ok=True)
shutil.copytree(source,out,dirs_exist_ok=True)
(out/'_worker.js').write_text((root/('frontend/cloudflare-worker.mjs' if repository else 'work/cloudflare-worker.mjs')).read_text(encoding='utf-8'),encoding='utf-8')
(out/'_routes.json').write_text(json.dumps({'version':1,'include':['/api/*'],'exclude':[]},indent=2),encoding='utf-8')
(out/'_redirects').write_text('/auth/* / 302\n/entrar / 302\n/entrar/ / 302\n',encoding='utf-8')
(out/'_headers').write_text('''/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
/
  Cache-Control: no-cache
/study/
  Cache-Control: no-cache
/study/account-boot.js
  Cache-Control: no-cache
''',encoding='utf-8')
# Unhandled routes must not silently serve the app entry point.
(out/'404.html').write_text('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Página não encontrada</title><h1>Página não encontrada</h1><p><a href="/">Voltar à Trilha Concursos</a></p></html>',encoding='utf-8')
target=root/('frontend/trilha-cloudflare.zip' if repository else 'outputs/Trilha_Cloudflare_Pages.zip')
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as z:
 for p in out.rglob('*'):
  if p.is_file():z.write(p,p.relative_to(out).as_posix())
with zipfile.ZipFile(target) as z:assert z.testzip() is None
print('Cloudflare Pages package ready:',target.name,';',len(list(out.rglob('*'))),'entries; intended origin:',args.origin)
