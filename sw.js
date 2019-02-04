'use strict';
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js');

const version = 1;
const currentCaches = 'learningpwa-v'+version;
let plugins = [];

const precacheController = new workbox.precaching.PrecacheController();

precacheController.addToCacheList([
  '/js/jquery.min.js',
  '/js/materialize.min.js',
  '/js/app.js',
  '/js/index.js',
  '/css/materialize.min.css',
  '/css/styles.css',
]);

precacheController.addToCacheList([
  {
    url: 'index.html',
    revision: 'abcd',
  }, {
    url: 'schedule.html',
    revision: '1234',
  },
  {
    url: 'offlineschedule.html',
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