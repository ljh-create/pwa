const CACHE_NAME = "network-setting-pwa-v14";
const OFFLINE_PAGE = "/offline.html"; // ✅ 오프라인 전용 페이지 추가

const urlsToCache = [
    "/",  
    "/index.html",  
    "/manifest.webmanifest",
    "/search_index.json",
    "/service-worker.js",
    OFFLINE_PAGE
];

// 파일 목록을 동적으로 로드 (JSON 검사 추가)
async function loadFileList() {
    try {
        const response = await fetch("/fileList.json");

        // 응답이 정상적인지 확인
        if (!response.ok) {
            console.error("❌ 파일 리스트 로드 실패: HTTP " + response.status);
            return urlsToCache;
        }

        // JSON 파싱 전에 텍스트로 먼저 확인 (HTML 오류 방지)
        const text = await response.text();
        if (text.startsWith("<")) {  // JSON이 아니라 HTML이라면 (404 등)
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

// **서비스 워커 설치 시 개별 요청으로 캐싱 (전체 실패 방지)**
self.addEventListener("install", event => {
    event.waitUntil(
        loadFileList().then(files => {
            return caches.open(CACHE_NAME).then(cache => {
                console.log("✅ 캐싱할 파일 목록:", files);
                return Promise.all(
                    files.map(file =>
                        fetch(file, { mode: "no-cors" }) // ✅ CORS 문제 해결 시도
                            .then(response => {
                                if (!response.ok) throw new Error(`HTTP ${response.status} - ${file}`);
                                return cache.put(file, response);
                            })
                            .catch(error => console.warn(`⚠️ 캐싱 실패: ${file}`, error))
                    )
                );
            });
        }).then(() => self.skipWaiting())
    );
});

// **fetch 이벤트 수정 (오프라인에서도 작동하도록)**
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).catch(() => caches.match(OFFLINE_PAGE));
        })
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
