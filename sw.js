'use strict';
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js');

const version = 1;
const currentCaches = 'learningpwa-v'+version;

self.addEventListener("install", function(event){
  console.log("install event in progress");
  workbox.precaching.precacheAndRoute([
    '/js/jquery.min.js',
    '/js/materialize.min.js',
    '/js/app.js',
    '/js/index.js',
    '/css/materialize.min.css',
    '/css/styles.css',
    {
      url: '/index.html',
      revision: version
    },
    {
      url: '/',
      revision: version
    },
    {
      url: '/offlineschedule.html',
      revision: version
    },
    {
      url: '/schedule.html',
      revision: version
    }
  ]);

  // event.waitUntil(
  //   caches.open(currentCaches).then(function(cache){
  //     return cache.addAll([
  //       '/js/jquery.min.js',
  //       '/js/materialize.min.js',
  //       '/js/app.js',
  //       '/js/index.js',
  //       '/css/materialize.min.css',
  //       '/css/styles.css',
  //       'offlineschedule.html',
  //       'schedule.html'
  //     ]); // TODO: Load asset for offline mode
  //   }).then(function() {
  //     console.log('WORKER: install completed');
  //   })
  // );
});

self.addEventListener("fetch", function(event){
  console.log('WORKER: fetch event in progress.');
  if (event.request.method !== 'GET') {
    console.log('WORKER: fetch event ignored.', event.request.method, event.request.url);
    return;
  }
  console.log("woyy"+event.request);
  event.respondWith(
    caches.match(event.request).then(function(cached){
      var networked = fetch(event.request).then(fetchedFromNetwork, unableToResolve).catch(unableToResolve);
      console.log('WORKER: fetch event', cached ? '(cached)' : '(network)', event.request.url);
      return cached || networked;

      function fetchedFromNetwork(response) {
        var cacheCopy = response.clone();
        console.log('WORKER: fetch response from network.', event.request.url);
        caches.open(currentCaches + 'pages').then(function add(cache){
          cache.put(event.request, cacheCopy);
        }).then(function() {
          console.log('WORKER: fetch response stored in cache.', event.request.url);
        });
        return response;
      }
      
      function unableToResolve () {
        console.log('WORKER: fetch request failed in both cache and network.');
      }
    })
  );
});

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