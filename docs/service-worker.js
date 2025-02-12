const CACHE_NAME = "network-setting-pwa-v30";

const urlsToCache = [
    "/",
    "/index.html",
    "/manifest.webmanifest",
    "/service-worker.js",
    "/search/search_index.json",
    "/404.html"
];

// **파일 목록을 동적으로 로드하여 캐싱**
async function loadFileList() {
    try {
        const response = await fetch("/fileList.json");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const files = await response.json();
        console.log("✅ fileList.json에서 로드된 파일 목록:", files);
        return [...urlsToCache, ...files];
    } catch (error) {
        console.error("❌ 파일 리스트 로드 실패, 기본 파일만 캐싱:", error);
        return urlsToCache;
    }
}

// **서비스 워커 설치 시 모든 파일 개별적으로 캐싱**
self.addEventListener("install", event => {
    event.waitUntil(
        loadFileList().then(files => {
            return caches.open(CACHE_NAME).then(cache => {
                console.log("✅ 캐싱할 파일 목록:", files);
                return Promise.all(
                    files.map(file =>
                        fetch(file)
                            .then(response => {
                                if (!response.ok) throw new Error(`HTTP ${response.status} - ${file}`);
                                console.log(`📥 캐싱됨: ${file}`);
                                return cache.put(file, response.clone());
                            })
                            .catch(error => {
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
    console.log(`🔍 요청됨: ${event.request.url}`);

    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                console.log(`✅ 캐시에서 찾음: ${event.request.url}`);
                return response;
            }

            return fetch(event.request)
                .then(networkResponse => {
                    console.log(`🌐 네트워크에서 가져옴: ${event.request.url}`);
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(() => {
                    console.warn(`🚫 오프라인 상태에서 ${event.request.url} 찾을 수 없음`);

                    // ✅ fileList.json에서 가져온 파일 리스트를 기반으로 HTML 페이지 찾기
                    return caches.match("/fileList.json").then(fileListResponse => {
                        if (!fileListResponse) {
                            console.warn("⚠️ fileList.json을 찾을 수 없음, 기본 index.html 반환");
                            return caches.match("/index.html");
                        }

                        return fileListResponse.json().then(fileList => {
                            const requestedPath = new URL(event.request.url).pathname;

                            if (fileList.includes(requestedPath)) {
                                console.log(`📄 요청된 페이지 (${requestedPath})가 존재하므로 반환`);
                                return caches.match(requestedPath);
                            }

                            console.log("🔍 요청된 페이지를 찾을 수 없어 404.html 반환");
                            return caches.match("/404.html");
                        });
                    });
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
