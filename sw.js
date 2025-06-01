// sw.js

const CACHE_NAME = 'controle-gastos-v3'; // Mantenha seu nome de cache
const FILES_TO_CACHE = [ // Mantenha seus arquivos
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js'
];

// Seu self.addEventListener('install', ...) e self.addEventListener('activate', ...) permanecem os mesmos

self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);

    // Se a requisição for para uma origem diferente E não for o Chart.js (que está explicitamente em cache)
    if (requestUrl.origin !== self.location.origin && requestUrl.href !== FILES_TO_CACHE[5] /* URL do Chart.js */) {
        // Apenas busca da rede. Não interfere se falhar (ex: adblocker).
        event.respondWith(
            fetch(event.request).catch(() => {
                // Retorna uma resposta de erro genérica para não quebrar a promessa do SW
                // se a busca falhar por motivos externos (como adblocker).
                return new Response('', {
                    status: 503, // Service Unavailable
                    statusText: 'Service Unavailable (external resource blocked or failed)'
                });
            })
        );
        return; // Importante: sai da função para não processar mais nada para esta requisição
    }

    // Para requisições da mesma origem ou o Chart.js
    if (event.request.mode === 'navigate') {
        event.respondWith(
            caches.match('/index.html').then((response) => {
                return response || fetch(event.request).catch(() => caches.match('/index.html'));
            })
        );
    } else {
        event.respondWith(
            caches.match(event.request).then((response) => {
                if (response) {
                    return response; // Encontrado no cache
                }
                // Não encontrado no cache, busca na rede
                return fetch(event.request).then((networkResponse) => {
                    // Opcional: Se quiser adicionar novos recursos ao cache dinamicamente:
                    // if (networkResponse && networkResponse.status === 200) {
                    //     const cache = await caches.open(CACHE_NAME);
                    //     cache.put(event.request, networkResponse.clone());
                    // }
                    return networkResponse;
                }).catch(error => {
                    console.error("SW Fetch Error (same-origin or explicit cache):", event.request.url, error);
                    // Você pode querer retornar um fallback aqui para assets locais, se apropriado
                    throw error; // Ou re-throw para ver o erro no console
                });
            })
        );
    }
});