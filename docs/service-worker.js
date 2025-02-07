const CACHE_NAME = "network-setting-pwa-v10";
const OFFLINE_PAGE = "/offline.html"; 

const urlsToCache = [
    "/",  
    "/index.html",  
    "/manifest.webmanifest",
    "/search_index.json",
    "/service-worker.js",
    OFFLINE_PAGE
];

// 파일 목록을 동적으로 로드 (JSON 오류 처리 추가)
async function loadFileList() {
    try {
        const response = await fetch("/fileList.json");

        // HTTP 응답이 정상인지 확인 (404 방지)
        if (!response.ok) {
            console.error("❌ 파일 리스트 로드 실패: HTTP " + response.status);
            return urlsToCache;
        }

        // JSON 파싱 전에 텍스트로 먼저 확인
        const text = await response.text();
        if (text.startsWith("<")) {  // JSON이 아니라 HTML이면 (404 등)
            console.error("❌ fileList.json이 JSON 형식이 아님");
            return urlsToCache;
        }

        const files = JSON.parse(text);
        return [...urlsToCache, ...files];
    } catch (error) {
        console.error("❌ 파일 리스트 로드 중 예외 발생:", error);
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
        }).catch(() => caches.match(OFFLINE_PAGE)) // ✅ 오프라인 시 캐싱된 페이지 제공
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
