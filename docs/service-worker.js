const CACHE_NAME = "network-setting-pwa-v31";

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

// **서비스 워커 설치 시 모든 파일 캐싱 및 기존 캐시 삭제**
self.addEventListener("install", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => caches.delete(cache)) // ✅ 기존 캐시 삭제
            );
        }).then(() =>
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
        )
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

// **기존 캐시 완전 삭제 및 새로운 캐시 적용**
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cache => cache !== CACHE_NAME)
                          .map(cache => caches.delete(cache)) // ✅ 기존 캐시 삭제
            );
        }).then(() => {
            return self.clients.claim(); // ✅ 활성화된 모든 탭에 서비스 워커 적용
        })
    );
});
