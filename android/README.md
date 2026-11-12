# Trilha Concursos para Android

Aplicativo Android nativo com WebView para a plataforma publicada em https://trilha-concursos-pedro.pages.dev/. Requer Android 8 ou superior e internet. Usa as mesmas contas, progresso, aulas, chat, anexos e notificações internas do site. Atualizações do site aparecem no aplicativo sem gerar novo APK.

## Versão 1.0.2

- Pacote: `br.com.pedrosetti.trilhaconcursos`
- Versão: 1.0.2, código 3
- SDK mínimo 26, alvo 35
- Permissões: internet e microfone (solicitado somente ao gravar áudio)
- Seleção de arquivos pelo seletor do Android; imagens, PDFs e áudios são validados no servidor.
- Downloads autenticados por DownloadManager. Links externos, incluindo o YouTube, abrem no aplicativo apropriado.
- Notificações de mensagens aparecem dentro do aplicativo. Não há serviço de push para avisar com o aplicativo encerrado.
- Não inclui senha, token de sessão, chave privada de assinatura ou credencial do banco.

## Compilar

Use JDK 17 e Android SDK 35. Defina `ANDROID_HOME` ou crie `local.properties` com `sdk.dir` local. Configure, de forma privada, `TRILHA_KEYSTORE`, `TRILHA_STORE_PASSWORD` e `TRILHA_KEY_PASSWORD`; o alias é `trilha`. Execute `gradlew.bat assembleRelease` no Windows ou o Gradle 8.9 equivalente. O Android Gradle Plugin é 8.7.3.

Preserve a chave de assinatura original em backup privado para gerar atualizações instaláveis sobre esta versão. Não versionar nem distribuir a chave com o código público.

O APK de distribuição deve passar em `apksigner verify --verbose`. A primeira versão foi compilada e passou pelo lint de release e pela verificação de assinatura. O comportamento físico não foi testado em aparelho Android nesta entrega.
