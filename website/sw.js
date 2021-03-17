// Set a name for the current cache
var cacheName = 'v1';

// Default files to always cache
var cacheFiles = [
    './',
    './index.html',
    './scss/all.css',
    './cityviewbg.png'
]


self.addEventListener('install', function(e) {
    console.log('[ServiceWorker] Installed');

    // e.waitUntil Delays the event until the Promise is resolved
    e.waitUntil(

        // Open the cache
        caches.open(cacheName).then(function(cache) {

            // Add all the default files to the cache
            console.log('[ServiceWorker] Caching cacheFiles');
            return cache.addAll(cacheFiles);
        })
    ); // end e.waitUntil
});


self.addEventListener('activate', function(e) {
   // console.log('[ServiceWorker] Activated');

    e.waitUntil(

        // Get all the cache keys (cacheName)
        caches.keys().then(function(cacheNames) {
            return Promise.all(cacheNames.map(function(thisCacheName) {

                // If a cached item is saved under a previous cacheName
                if (thisCacheName !== cacheName) {

                    // Delete that cached file
                    console.log('[ServiceWorker] Removing Cached Files from Cache - ', thisCacheName);
                    return caches.delete(thisCacheName);
                }
            }));
        })
    ); // end e.waitUntil

});

self.addEventListener('fetch', function(event) {

    // e.respondWidth Responds to the fetch event
    event.respondWith((async () => {
    const cachedResponse = await caches.match(event.request);
    
    if (cachedResponse) {
        console.log('[ServiceWorker] Using cahced response for: ',event.request.url);
        return cachedResponse;
    }
    var requestClone = event.request.clone();
    const response = await fetch(event.request);

    var responseClone = response.clone();

    if (!response || response.status !== 200 || response.type !== 'basic') {
        console.log('[ServiceWorker] using fetched response for: ',event.request.url);
        caches.open(cacheName).then(function(cache) {

            // Put the fetched response in the cache
            cache.put(requestClone, responseClone);
            console.log('[ServiceWorker] New Data Cached', event.request.url);

            // Return the response
            return response;

        }); // end caches.open
        return response;
    }

    return response;
    })());
});
