const CACHE_NAME = 'ezi-servo-cache-v1';

const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/assets/javascripts/bundle.60a45f97.min.js',
    '/assets/stylesheets/main.a40c8224.min.css',
    '/assets/stylesheets/palette.06af60db.min.css',
    '/doc-E1/',
    '/doc-E2/',
    '/doc-E3/',
    '/doc-E4/',
    '/doc-E5/',
    '/doc-E6/',
    '/doc-E7/',
    '/doc-E8/',
    '/doc-E9/',
    '/doc-E10/',
    '/doc-R1/',
    '/doc-R2/',
    '/doc-R3/',
    '/doc-R4/',
    '/doc-R5/',
    '/doc-R6/',
    '/doc-R7/',
    '/doc-R8/',
    '/doc-R9/',
    '/doc-R10/',
    '/FASTECH.png',
    '/icon-128x128.png',
    '/icon-512x512.png',
    '/manifest.webmanifest',
    '/README_E/',
    '/README_Example/',
    '/README_R/',
    '/sitemap.xml'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                ASSETS_TO_CACHE.map(url => {
                    return fetch(url).then(response => {
                        if (!response.ok) {
                            throw new Error(`Failed to fetch ${url}`);
                        }
                        return cache.put(url, response);
                    }).catch(error => {
                        console.error(`Failed to cache ${url}: ${error}`);
                    });
                })
            );
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('livereload')) {
      return;
  }

  event.respondWith(
      caches.match(event.request).then((response) => {
          if (response) {
              return response;
          }
          
          // ngrok URL에서 실제 요청 경로 추출
          const url = new URL(event.request.url);
          const fullPath = url.pathname;
          
          return fetch(event.request).then((response) => {
              if (!response || response.status !== 200) {
                  return response;
              }
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                  if (response.headers.get('content-type') && 
                      response.headers.get('content-type').includes('text/html')) {
                      cache.put(fullPath + '/', responseToCache);
                  } else {
                      cache.put(fullPath, responseToCache);
                  }
              });
              return response;
          }).catch(error => {
              console.error('Fetching failed:', error);
              throw error;
          });
      })
  );
});
