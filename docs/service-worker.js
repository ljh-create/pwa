const CACHE_NAME = "network-setting-pwa-v4";
const urlsToCache = [
    "/",                // 기본 페이지
    "/index.html",      // 메인 페이지
    "/search_index.json",  // ✅ 검색 데이터 캐싱 추가
    "/manifest.webmanifest",  // PWA 메타 정보 추가
    "/service-worker.js", // 서비스 워커 자체도 캐싱
    "/assets/FASTECH.png",
    "/assets/icon-192x192.png",
    "/assets/icon-512x512.png"
];

// 서비스 워커 설치 시 캐시 저장
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting()) // 즉시 활성화
    );
});

// 요청 가로채기 및 캐싱된 데이터 반환
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(fetchResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, fetchResponse.clone());
                    return fetchResponse;
                });
            });
        }).catch(() => caches.match("/index.html"))  // 오프라인 시 기본 페이지 제공
    );
});

// 오래된 캐시 정리
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cache => cache !== CACHE_NAME)
                          .map(cache => caches.delete(cache))
            );
        }).then(() => self.clients.claim()) // 활성화 즉시 컨트롤 적용
    );
});
