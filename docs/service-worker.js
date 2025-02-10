const CACHE_NAME = "network-setting-pwa-v20";

const urlsToCache = [
    "/",  
    "/index.html",  
    "/manifest.webmanifest",
    "/search_index.json",
    "/service-worker.js"
];

// 파일 목록을 동적으로 로드하여 캐싱
async function loadFileList() {
    try {
        const response = await fetch("/fileList.json");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const files = await response.json();
        return [...urlsToCache, ...files];
    } catch (error) {
        console.error("❌ 파일 리스트 로드 실패, 기본 파일만 캐싱:", error);
        return urlsToCache;
    }
}

// **서비스 워커 설치 시 모든 파일 캐싱**
self.addEventListener("install", event => {
    event.waitUntil(
        loadFileList().then(files => {
            return caches.open(CACHE_NAME).then(cache => {
                console.log("✅ 캐싱할 파일 목록:", files);
                return cache.addAll(files);
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
                        cache.put(event.request, networkResponse.clone()); // 온라인 시 방문한 페이지 자동 캐싱
                        return networkResponse;
                    });
                })
                .catch(() => {
                    console.warn(`⚠️ 네트워크 요청 실패: ${event.request.url}`);
                    return caches.match("/index.html"); // 오프라인 시 항상 index.html 제공
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
