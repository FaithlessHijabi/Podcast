'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "feed.xml": "87f54b4793fadfd07ad84a02541c79c3",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"favicon.png": "21dbc710b1c160da8d8d572fd108a37d",
"img/icon.jpg": "5391f51340d10ca33334141bc1eb2142",
"img/spotify.png": "0a5ef7a942cb1d9a64169f57ba1a05c3",
"audio/Zara%20Kay%20-%20Life%20after%20Islam%20with%20Jesse.mp3": "d903656ef27c19ef6610aa35d1fa071f",
"audio/Zara%20Kay%20-%20Life%20after%20Islam%20with%20Ali%20(@leavingislam).mp3": "4b5db3628985ff1a7b5a4da4df8825c1",
"audio/Zara%20Kay%20-%20Life%20after%20Islam%20Embracing%20losing%20your%20faith.mp3": "86facdde6d8c8c7bb225736bf32af93f",
"audio/Zara%20Kay%20-%20Life%20After%20Islam%20with%20Zahraa%20(SeedsOfDoubt3).mp3": "2b070a09053b4579600dafec4d22527c",
"audio/Zara%20Kay%20-%20Life%20after%20Islam%20with%20Izzy.mp3": "b7ab22da490f4a7a949e885d75936c48",
"audio/Zara%20Kay%20-%20Life%20After%20Islam%20with%20Ghada%20Alkhars.mp3": "f919657e754c735c91f6b6a876907472",
"audio/Zara%20Kay%20-%20Life%20After%20Islam%20with%20Little%20Devil.mp3": "7b8982a9039a729c5a3a56281d02905a",
"audio/Zara%20Kay%20-%20Life%20after%20Islam%20with%20Seyyid.mp3": "987680020db2f902b51cb75f6b664a4e",
"audio/Zara%20Kay%20-%20Life%20After%20Islam%20with%20Inas.mp3": "0e7add5a637cd25f27afbacdae241152",
"audio/Zara%20Kay%20-%20Life%20After%20Islam%20with%20Khulud.mp3": "fb640c294c770da2dd13198374b0314c",
"audio/Zara%20Kay%20-%20Life%20after%20Islam%20with%20Omayma.mp3": "9466be1f46eb8ebf0e3604e268ff6f04",
"audio/Zara%20Kay%20-%20Life%20after%20Islam%20with%20Hassan,%20Somali-Kenyan.mp3": "336e028584858e50c0bf58914ddd4eb6",
"main.dart.js": "dfa4906605f331a38afca8ac63f3cc79",
"index.html": "1e388da931a9c99dee69aab8c723accd",
"/": "1e388da931a9c99dee69aab8c723accd",
"manifest.json": "0d2ef5bf43d0a5d981e8400f48458541",
"CNAME": "12565d68535b4fff98bb730a5f758142",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "a68d2a28c526b3b070aefca4bac93d25",
"assets/packages/flutter_markdown/assets/logo.png": "67642a0b80f3d50277c44cde8f450e50",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "115e937bb829a890521f72d2e664b632",
"assets/AssetManifest.json": "0d266ffbe90dae02458487c9d33b7373",
"assets/NOTICES": "fb5e4f1382cf8b579f8c08bba9c77115"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');

      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }

      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#')) {
    key = '/';
  }
  // If the URL is not the RESOURCE list, skip the cache.
  if (!RESOURCES[key]) {
    return event.respondWith(fetch(event.request));
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache. Ensure the resources are not cached
        // by the browser for longer than the service worker expects.
        var modifiedRequest = new Request(event.request, {'cache': 'reload'});
        return response || fetch(modifiedRequest).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    return self.skipWaiting();
  }

  if (event.message === 'downloadOffline') {
    downloadOffline();
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
