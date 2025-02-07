const CACHE_NAME = "network-setting-pwa-v7";
const urlsToCache = [
    "/",  
    "/index.html",  
    "/manifest.webmanifest",
    "/search_index.json",
    "/service-worker.js"
];

// 파일 목록을 동적으로 로드
async function loadFileList() {
    try {
        const response = await fetch("/fileList.json"); // 🔹 자동 생성된 파일 불러오기
        const files = await response.json();
        return [...urlsToCache, ...files];
    } catch (error) {
        console.error("❌ 파일 리스트 로드 실패:", error);
        return urlsToCache;
    }
}

// 서비스 워커 설치 시 파일 목록을 불러와 캐싱
self.addEventListener("install", event => {
    event.waitUntil(
        loadFileList().then(files => {
            return caches.open(CACHE_NAME).then(cache => cache.addAll(files));
        }).then(() => self.skipWaiting())
    );
});

// 요청을 가로채서 캐싱된 데이터 제공
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
        }).then(() => self.clients.claim())
    );
});
