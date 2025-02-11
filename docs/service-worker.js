const CACHE_NAME = "network-setting-pwa-v29";

const urlsToCache = [
    "/",  
    "/index.html",  
    "/manifest.webmanifest",
    "/service-worker.js",
    "/search/search_index.json"
];

// **파일 목록을 동적으로 로드하여 캐싱**
async function loadFileList() {
    try {
        const response = await fetch("/fileList.json");
        if (!response.ok) throw new Error();
        const files = await response.json();
        return [...urlsToCache, ...files];
    } catch (error) {
        return urlsToCache;
    }
}

// **서비스 워커 설치 시 모든 파일 개별적으로 캐싱**
self.addEventListener("install", event => {
    event.waitUntil(
        loadFileList().then(files => {
            return caches.open(CACHE_NAME).then(cache => {
                return Promise.all(
                    files.map(file =>
                        fetch(file)
                            .then(response => {
                                if (!response.ok) throw new Error();
                                return cache.put(file, response.clone());
                            })
                            .catch(() => {})
                    )
                );
            });
        }).then(() => self.skipWaiting())
    );
});

// **fetch 이벤트 수정 (오프라인에서도 모든 페이지 제공)**
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request)
                .then(networkResponse => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(() => {
                    if (event.request.url.includes("/Chapter3/")) {
                        return caches.match("/404.html");
                    }
                    return caches.match("/index.html");
                });
        })
    );
});

// **오래된 캐시 정리**
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cache => cache !== CACHE_NAME)
                          .map(cache => caches.delete(cache))
            );
        }).then(() => self.clients.claim())
    );
});
