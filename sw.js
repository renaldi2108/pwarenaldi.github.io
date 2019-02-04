'use strict';
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js');

const version = 1;
const currentCaches = 'learningpwa-v'+version;
let plugins = [];

const precacheController = new workbox.precaching.PrecacheController();

precacheController.addToCacheList([
  'https://renaldi2108.github.io/pwarenaldi.github.io/js/jquery.min.js',
  'https://renaldi2108.github.io/pwarenaldi.github.io/js/materialize.min.js',
  'https://renaldi2108.github.io/pwarenaldi.github.io/js/app.js',
  'https://renaldi2108.github.io/pwarenaldi.github.io/js/index.js',
  'https://renaldi2108.github.io/pwarenaldi.github.io/js/sw-controller.js',
  'https://renaldi2108.github.io/pwarenaldi.github.io/js/idb.js',
  'https://renaldi2108.github.io/pwarenaldi.github.io/js/notify-updates.js',
  'https://renaldi2108.github.io/pwarenaldi.github.io/css/materialize.min.css',
  'https://renaldi2108.github.io/pwarenaldi.github.io/css/styles.css',
  'https://renaldi2108.github.io/pwarenaldi.github.io/favicon.ico'
]);

precacheController.addToCacheList([
  {
    url: 'https://renaldi2108.github.io/pwarenaldi.github.io/',
    revision: 'asdf',
  },
  {
    url: 'https://renaldi2108.github.io/pwarenaldi.github.io/index.html',
    revision: 'abcd',
  }, {
    url: 'https://renaldi2108.github.io/pwarenaldi.github.io/schedule.html',
    revision: '1234',
  },
  {
    url: 'https://renaldi2108.github.io/pwarenaldi.github.io/offlineschedule.html',
    revision: 'qwer',
  }
]);

self.addEventListener("install", function(event){
  console.log("install event in progress");
  event.waitUntil(precacheController.install());
});

self.addEventListener("fetch", function(event){
  console.log('WORKER: fetch event in progress.');
  if (event.request.method !== 'GET') {
    console.log('WORKER: fetch event ignored.', event.request.method, event.request.url);
    return;
  }
  
  event.respondWith(caches.match(event.request).then());
});

self.addEventListener("activate", function(event) {
  console.log('WORKER: activate event in progress.');
  event.waitUntil(precacheController.activate({plugins}));
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
    icon: 'https://renaldi2108.github.io/pwarenaldi.github.io/icon-192.png',
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