// 定义缓存名称（版本号），修改代码后需要修改这里的版本号（例如 v1 -> v2）
const CACHE_NAME = 'pwa-365-habit-v2';

// 需要缓存的文件列表
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
  // 如果您有本地的图标文件，也可以加在这里，例如：
  // './icon-192.png',
  // './icon-512.png'
];

// 1. 安装 Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // 强制立即接管，不用等待下次加载
  self.skipWaiting();
});

// 2. 激活 Service Worker（清理旧缓存）
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // 删除旧版本的缓存（例如 v1）
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 立即控制所有页面
  event.waitUntil(self.clients.claim());
});

// 3. 拦截网络请求（优先使用缓存，网络请求失败时回退到缓存）
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果缓存中有，直接返回缓存
        if (response) {
          return response;
        }
        // 否则发起网络请求
        return fetch(event.request).catch(() => {
            // 如果网络也失败了（离线状态），且请求的是页面，可以返回离线提示页
            // 这里简单处理，如果缓存和网络都失败，就什么都不做
        });
      })
  );
});