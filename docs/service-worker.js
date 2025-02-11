const CACHE_NAME = "network-setting-pwa-v24";

const urlsToCache = [
    "/",  
    "/index.html",  
    "/manifest.webmanifest",
    "/service-worker.js",
    "/search/search_index.json"
];

// 파일 목록을 동적으로 로드하여 캐싱
async function loadFileList() {
    try {
        const response = await fetch("/fileList.json");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const files = await response.json();
        return [...urlsToCache, ...files.map(file => file.toLowerCase())]; // ✅ 모든 파일 경로를 소문자로 변환
    } catch (error) {
        console.error("❌ 파일 리스트 로드 실패, 기본 파일만 캐싱:", error);
        return urlsToCache;
    }
}

// **서비스 워커 설치 시 모든 파일 개별적으로 캐싱 (404 에러 방지)**
self.addEventListener("install", event => {
    event.waitUntil(
        loadFileList().then(files => {
            return caches.open(CACHE_NAME).then(cache => {
                console.log("✅ 캐싱할 파일 목록:", files);
                return Promise.all(
                    files.map(file =>
                        fetch(file).then(response => {
                            if (!response.ok) throw new Error(`HTTP ${response.status} - ${file}`);
                            return cache.put(file, response.clone());
                        }).catch(error => {
                            console.warn(`⚠️ 캐싱 실패 (무시됨): ${file}`, error);
                        })
                    )
                );
            });
        }).then(() => self.skipWaiting())
    );
});

// **fetch 이벤트 수정 (오프라인에서도 모든 페이지 제공)**
self.addEventListener("fetch", event => {
    const requestUrl = new URL(event.request.url);
    const lowercaseUrl = requestUrl.pathname.toLowerCase(); // ✅ 요청 경로를 소문자로 변환

    event.respondWith(
        caches.match(lowercaseUrl).then(response => {
            return response || fetch(event.request)
                .then(networkResponse => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(lowercaseUrl, networkResponse.clone()); // 온라인 시 방문한 페이지 자동 캐싱
                        return networkResponse;
                    });
                })
                .catch(() => caches.match("/index.html"));  // 네트워크 실패 시 기본 index.html 제공
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
