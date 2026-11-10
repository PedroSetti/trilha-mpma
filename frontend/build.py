from pathlib import Path
import re,shutil,zipfile
root=Path(__file__).resolve().parent.parent
out=root/'frontend/dist'
out.mkdir(parents=True,exist_ok=True)
page=(root/'server/app/auth/[view]/page.js').read_text(encoding='utf-8')
css=page.split('<style>{`',1)[1].split('`}</style>',1)[0]
(out/'auth.css').write_text(css+'\n.error{color:#8c3535}.privacy{font-size:12px}button[hidden]{display:none}',encoding='utf-8')
html='''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Trilha Concursos</title><meta name="description" content="Seu espaço de estudos para concursos"><link rel="stylesheet" href="/auth.css?v=1"></head><body><main class="auth"><section class="story"><div class="brand">↗ trilha.</div><span class="eyebrow">SEU PRÓXIMO CAPÍTULO</span><h1>Seu futuro começa<br>com o estudo de hoje.</h1><p>Videoaulas, cronograma, revisões e simulados. Um espaço para organizar sua preparação, uma sessão de cada vez.</p></section><section class="panel"><span class="eyebrow">SEU ESPAÇO DE ESTUDOS</span><h2 id="auth-title">Bom ter você por aqui.</h2><p class="muted" id="auth-intro">Entre na sua conta para continuar a preparação.</p><form id="auth-form"><label>E-mail<input type="email" name="email" autocomplete="email" required></label><label>Senha<input type="password" name="password" autocomplete="current-password" required></label><button>Entrar</button></form><div class="error" role="alert" id="auth-message"></div><button class="switch" id="forgot-password">Esqueci minha senha</button><button class="switch" id="auth-switch">Ainda não tem conta? Cadastre-se →</button><p class="privacy">Seu progresso e sua foto ficam vinculados à sua conta. As videoaulas são reproduzidas pelo YouTube.</p></section></main><script src="/auth-client.js?v=1" defer></script></body></html>'''
for name in ['index.html','entrar.html']:(out/name).write_text(html,encoding='utf-8')
shutil.copytree(root/'server/study',out/'study',dirs_exist_ok=True)
(out/'_redirects').write_text('''/api/* https://trilha-concursos-pedro.onrender.com/api/:splat 200!
/auth/* /entrar.html 200!
/entrar /entrar.html 200!
/entrar/ /entrar.html 200!


''',encoding='utf-8')
(out/'_headers').write_text('''/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
/index.html
  Cache-Control: no-cache
/entrar.html
  Cache-Control: no-cache
/study/index.html
  Cache-Control: no-cache
''',encoding='utf-8')
with zipfile.ZipFile(root/'frontend/trilha-netlify.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in out.rglob('*'):
  if p.is_file():z.write(p,p.relative_to(out).as_posix())
print('Static frontend packaged:',len(list(out.rglob('*'))),'entries')
