'use strict';
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js');

const version = 1;
const currentCaches = 'learningpwa-v'+version;
let plugins = [];

workbox.precaching.precacheAndRoute(
  [
    { url: 'https://renaldi2108.github.io/pwarenaldi.github.io/schedule.html', revision: currentCaches },
    { url: 'https://renaldi2108.github.io/pwarenaldi.github.io/offlineschedule.html', revision: currentCaches },
    { url: 'https://renaldi2108.github.io/pwarenaldi.github.io/index.html', revision: currentCaches },
  ],
  {
    ignoreUrlParametersMatching: [/.*/]
  }
);

// Add Precache Route
workbox.precaching.addRoute();

workbox.routing.registerRoute(
  /\.(?:png|jpg|jpeg|js|css|json|woff|woff2|ico)$/,
  workbox.strategies.cacheFirst()
);

workbox.routing.registerRoute(
  new RegExp('https://api.football-data.org/v2/(.*)'),
  workbox.strategies.cacheFirst()
);

self.addEventListener("activate", function(event) {
  console.log('WORKER: activate event in progress.');

  event.waitUntil(
    caches.keys().then(function (keys) {
        return Promise.all(
          keys.filter(function (key) {
              return !key.startsWith(version);
            }).map(function (key) {
              return caches.delete(key);
            })
        );
      }).then(function() {
        console.log('WORKER: activate completed.');
      })
  );
});

self.addEventListener("message", function(event) {
    if (event.data.action === 'skipWaiting') {
      self.skipWaiting();
    }
});

self.addEventListener('push', function(event) {
  var body;
  if (event.data) {
    body = event.data.text();
  } else {
    body = 'Woyy';
  }
  var options = {
    body: body,
    icon: 'icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  event.waitUntil(
    self.registration.showNotification('Notification', options)
  );
});