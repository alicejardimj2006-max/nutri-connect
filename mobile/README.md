# App Android do NutriConnect

App nativo (Capacitor 8) que abre o site publicado (`https://nutri-connect.netlify.app`) numa casca
Android, com ícone, tela de abertura, barra de status, botão voltar e tela "sem conexão"
(`www/offline.html`). Toda melhoria publicada no site chega ao app na hora, sem nova versão na
loja. O site reconhece o app pelo user agent (`NutriConnectApp/…`, ver `isNativeApp()` em
`src/lib/push.ts`) e usa os recursos nativos pela ponte do Capacitor (`window.Capacitor`).

- ID do pacote (permanente na Play Store): `br.com.nutriconnect.app`
- Configuração: `capacitor.config.json`
- Ícone e abertura: imagens de origem em `assets/`; para regerar, `npm run assets`.

## Gerar o APK de teste

Não precisa instalar nada no computador: o GitHub Actions ("App Android") gera um APK a cada
mudança em `mobile/`, ou pelo botão **Run workflow** na aba **Actions** do repositório. Baixe o
arquivo em **Artifacts**, descompacte e abra o `app-debug.apk` no celular (permita "instalar
apps desconhecidos" quando o Android pedir).

Para compilar localmente: Java 21 + Android SDK, `npm ci`, `npx cap sync android` e
`cd android && ./gradlew assembleDebug`.
