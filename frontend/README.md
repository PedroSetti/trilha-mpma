# Frontend estático no Netlify

O Netlify entrega a entrada e os arquivos de estudo por CDN. Somente `/api/*` é encaminhado ao backend Render. Cadastro, sessão, progresso, foto, usuários e mensagens continuam protegidos pelos controles do servidor. Não inclua dados de conta em arquivos estáticos.

## Gerar publicação

Na pasta `server`, execute `npm ci` e `npm install --no-save --package-lock=false esbuild`. Em seguida:

```sh
node node_modules/esbuild/bin/esbuild static-auth-entry.js --bundle --platform=browser --format=iife --minify --outfile=../frontend/dist/auth-client.js
```

Na raiz, execute `python frontend/build.py`. Envie `frontend/trilha-netlify.zip` ao projeto Netlify existente `trilha-concursos-pedro`. O build requer apenas a biblioteca padrão do Python. Os arquivos de estudo vêm de `server/study`.

Uma publicação somente no Render não atualiza os arquivos estáticos do Netlify. Após alterações em aulas, interface ou cliente, gere e publique o ZIP novamente. Preserve a regra de proxy de `/api/*`; não crie redirecionamento de `/study` para ele mesmo (o Netlify normaliza barras).

## Recursos e limites da operação gratuita

- O HTML da entrada abre pelo CDN sem depender da inicialização do Render.
- Após inatividade, o backend gratuito pode levar tempo para responder ao primeiro login ou outra operação. Não há garantia de disponibilidade ou latência de plano pago.
- O Call Adm usa ticket autenticado de 60 segundos, enviado apenas no cabeçalho Authorization, para uma conexão SSE direta ao Render. Isso evita buffering do proxy. O servidor valida o papel e restringe o aluno à própria conversa. Há reconexão e consulta de recuperação; mensagens persistidas não dependem apenas do evento em memória.
- O envio aparece imediatamente com estado pendente. A confirmação e a entrega dependem de conexão e processamento. Não há promessa de entrega sem internet.
- YouTube incorporado não garante reprodução com tela bloqueada. O usuário pode abrir o aplicativo oficial; recursos de segundo plano dependem da conta, aplicativo e dispositivo.
- Fotos didáticas têm fonte, autoria e licença em `learning-media.js`. Foram redimensionadas, sem alteração de conteúdo. Preserve os créditos ao redistribuir.
- O banco de estudo tem 393 tópicos do programa e complementos para os 128 blocos originais, cobrindo 521 unidades. Resumos autorais não substituem normas integrais, documentação ou treinamento profissional.

## Verificação após publicar

Confirme entrada estática, redirecionamento do painel sem sessão, login real, progresso e foto preservados, Call Adm conectado, isolamento de conversas, teoria e resposta em aula, carregamento de foto, botão fechar e layout móvel claro/escuro. Nunca grave senha, token, cookie ou `.env` no repositório ou ZIP distribuído.
