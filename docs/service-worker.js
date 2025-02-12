const CACHE_NAME = "network-setting-pwa-v42"; // ✅ 최신 버전 업데이트

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
        console.error("❌ fileList.json 로드 실패, 기본 파일만 캐싱:", error);
        return urlsToCache;
    }
}

// **서비스 워커 설치 시 모든 파일을 강제 캐싱**
self.addEventListener("install", event => {
    event.waitUntil(
        loadFileList().then(files => {
            return caches.open(CACHE_NAME).then(async cache => {
                console.log("✅ 캐싱할 파일 목록:", files);

                await Promise.allSettled(
                    files.map(async file => {
                        try {
                            const response = await fetch(file);
                            if (!response.ok) throw new Error(`HTTP ${response.status}`);
                            console.log(`📥 캐싱됨: ${file}`);
                            await cache.put(file, response);
                        } catch (error) {
                            console.warn(`⚠️ 캐싱 실패 (무시됨): ${file}`, error);
                        }
                    })
                );

                console.log("✅ 모든 파일 캐싱 완료");
            });
        }).then(() => {
            self.skipWaiting();  // ✅ 새 서비스 워커 즉시 활성화
        })
    );
});

// **fetch 이벤트 수정 (SPA에서도 정상 동작)**
self.addEventListener("fetch", event => {
    console.log(`🔍 요청됨: ${event.request.url}`);
    const url = new URL(event.request.url);

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

                    // ✅ `.html` 확장자가 없는 경우 자동 추가하여 검색
                    if (!url.pathname.includes(".") && !url.pathname.endsWith("/")) {
                        return caches.match(url.pathname + ".html").then(cachedResponse => {
                            if (cachedResponse) {
                                console.log(`✅ ${url.pathname}.html을(를) 캐시에서 찾음`);
                                return cachedResponse;
                            }
                            console.warn(`❌ ${url.pathname}.html 도 캐시에 없음, 404.html 반환`);
                            return caches.match("/404.html");
                        });
                    }

                    // ✅ 기존 요청이 실패하면 기본적으로 `404.html` 반환
                    return caches.match("/404.html");
                });
        })
    );
});

// **SPA에서도 서비스 워커가 정상 동작하도록 추가**
self.addEventListener("message", event => {
    if (event.data === "refresh-fetch") {
        console.log("🔄 `fetch` 이벤트 강제 트리거");
        self.clients.matchAll().then(clients => {
            clients.forEach(client => client.navigate(client.url));
        });
    }
});

// **오래된 캐시 정리**
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cache => cache !== CACHE_NAME)
                          .map(cache => caches.delete(cache))
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});
