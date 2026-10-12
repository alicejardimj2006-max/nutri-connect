// Service worker do NutriConnect (app instalável). Só cuida das notificações push:
// mostra o aviso que a Edge Function push-send manda e, no toque, abre a página certa.
// Não guarda páginas em cache: o app continua sempre atualizado.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "NutriConnect";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      tag: data.tag,
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-96.png",
      data: { url: data.url || "/notificacoes" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const path = (event.notification.data && event.notification.data.url) || "/notificacoes";
  const target = new URL(path, self.location.origin).href;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      // Já tem o app aberto: leva essa janela para a página do aviso.
      for (const client of windows) {
        if (new URL(client.url).origin !== self.location.origin) continue;
        await client.focus();
        if ("navigate" in client) await client.navigate(target);
        return;
      }
      await self.clients.openWindow(target);
    })(),
  );
});

// A inscrição pode ser trocada pelo navegador; avisa as abas abertas para inscrever de novo.
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windows) => windows.forEach((c) => c.postMessage({ type: "push-resubscribe" }))),
  );
});
