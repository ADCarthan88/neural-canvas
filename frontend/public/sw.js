/**
 * Service Worker for Neural Canvas PWA
 * Handles caching, offline functionality, and background sync
 */

const CACHE_NAME = 'neural-canvas-v2.0.0';
const STATIC_CACHE = 'neural-canvas-static-v2.0.0';
const DYNAMIC_CACHE = 'neural-canvas-dynamic-v2.0.0';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Failed to cache static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip external requests
  if (url.origin !== location.origin) return;
  
  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - network first with cache fallback
    event.respondWith(networkFirstStrategy(request));
  } else if (url.pathname.match(/\.(js|css|woff2?|png|jpg|jpeg|svg|ico)$/)) {
    // Static assets - cache first with network fallback
    event.respondWith(cacheFirstStrategy(request));
  } else {
    // HTML pages - stale while revalidate
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// Network first strategy (for API calls)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📡 Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for API calls
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This feature requires an internet connection' 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache first strategy (for static assets)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('❌ Failed to fetch asset:', request.url);
    
    // Return placeholder for images
    if (request.url.match(/\.(png|jpg|jpeg|svg)$/)) {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#333"/><text x="100" y="100" text-anchor="middle" fill="white" font-family="Arial">Offline</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    throw error;
  }
}

// Stale while revalidate strategy (for HTML pages)
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const networkResponsePromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);
  
  // Return cached version immediately if available
  if (cachedResponse) {
    // Update cache in background
    networkResponsePromise;
    return cachedResponse;
  }
  
  // Wait for network if no cache
  try {
    const networkResponse = await networkResponsePromise;
    if (networkResponse) {
      return networkResponse;
    }
  } catch (error) {
    console.log('📄 Network failed for page:', request.url);
  }
  
  // Return offline page as fallback
  const offlineResponse = await caches.match('/offline.html');
  return offlineResponse || new Response('Offline', { status: 503 });
}

// Background sync for saving user creations
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'save-canvas') {
    event.waitUntil(syncCanvasData());
  }
  
  if (event.tag === 'upload-creation') {
    event.waitUntil(syncCreations());
  }
});

// Sync canvas data when back online
async function syncCanvasData() {
  try {
    const db = await openIndexedDB();
    const pendingData = await getPendingCanvasData(db);
    
    for (const data of pendingData) {
      try {
        await fetch('/api/canvas/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        // Remove from pending queue
        await removePendingData(db, data.id);
        console.log('✅ Synced canvas data:', data.id);
      } catch (error) {
        console.log('❌ Failed to sync canvas data:', error);
      }
    }
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// Sync user creations
async function syncCreations() {
  try {
    const db = await openIndexedDB();
    const pendingCreations = await getPendingCreations(db);
    
    for (const creation of pendingCreations) {
      try {
        const formData = new FormData();
        formData.append('image', creation.imageBlob);
        formData.append('metadata', JSON.stringify(creation.metadata));
        
        await fetch('/api/creations/upload', {
          method: 'POST',
          body: formData
        });
        
        await removePendingCreation(db, creation.id);
        console.log('✅ Synced creation:', creation.id);
      } catch (error) {
        console.log('❌ Failed to sync creation:', error);
      }
    }
  } catch (error) {
    console.error('❌ Creation sync failed:', error);
  }
}

// IndexedDB helpers
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('NeuralCanvasDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pendingCanvas')) {
        db.createObjectStore('pendingCanvas', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('pendingCreations')) {
        db.createObjectStore('pendingCreations', { keyPath: 'id' });
      }
    };
  });
}

async function getPendingCanvasData(db) {
  const transaction = db.transaction(['pendingCanvas'], 'readonly');
  const store = transaction.objectStore('pendingCanvas');
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function getPendingCreations(db) {
  const transaction = db.transaction(['pendingCreations'], 'readonly');
  const store = transaction.objectStore('pendingCreations');
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function removePendingData(db, id) {
  const transaction = db.transaction(['pendingCanvas'], 'readwrite');
  const store = transaction.objectStore('pendingCanvas');
  
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function removePendingCreation(db, id) {
  const transaction = db.transaction(['pendingCreations'], 'readwrite');
  const store = transaction.objectStore('pendingCreations');
  
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Push notifications for collaboration
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received');
  
  const options = {
    body: 'Someone joined your Neural Canvas session!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      action: 'open-app'
    },
    actions: [
      {
        action: 'open',
        title: 'Open Canvas',
        icon: '/icons/action-open.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ]
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.message || options.body;
    options.data = { ...options.data, ...data };
  }
  
  event.waitUntil(
    self.registration.showNotification('Neural Canvas', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Handle app shortcuts
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🎨 Neural Canvas Service Worker loaded successfully!');