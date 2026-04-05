/* 🚀 THÉO EM ÓRBITA - SERVICE WORKER DE NOTIFICAÇÕES 🌙 */

const THEO_NAME = 'Théo no Mundo da Lua';

// 🛠️ Esculpir a notificação quando um push chega
self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    // Suporte para JSON ou Texto
    let payload = {};
    try {
        payload = event.data.json();
    } catch (e) {
        payload = { title: THEO_NAME, body: event.data.text() };
    }

    const options = {
        body: payload.body || 'Tem uma novidade espacial te esperando!',
        icon: '/moon.svg',
        badge: '/moon.svg',
        image: payload.image || null,
        data: {
          url: payload.url || '/jogos'
        },
        // Sons e vibrações (compatível com mobile)
        vibrate: [200, 100, 200],
        actions: payload.actions || [
          { action: 'open', title: 'Explorar Agora 🚀' },
          { action: 'close', title: 'Mais tarde' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(payload.title || THEO_NAME, options)
    );
});

// 🧭 Lógica de clique (Deep Linking)
self.addEventListener('notificationclick', (event) => {
    const notification = event.notification;
    const action = event.action;

    notification.close();

    if (action === 'close') return;

    // Redireciona para a URL especificada no payload
    const targetUrl = notification.data.url || '/jogos';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
