// Keeps a copy of the app on the device so it opens with no internet. Your notes never pass through here.
const CACHE = "focusflow-v3";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon.svg", "icon-180.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE && x !== "focusflow-cal").map(x => caches.delete(x)))).then(() => self.clients.claim())));
// Newest version when online, saved copy when offline.
self.addEventListener("notificationclick", e => { e.notification.close(); e.waitUntil(self.clients.matchAll({ type: "window" }).then(cs => cs[0] ? cs[0].focus() : self.clients.openWindow("./"))); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  // Calendar files the app made on this device a moment ago: hand them straight back.
  if (new URL(e.request.url).pathname.includes("/cal/")) return e.respondWith(caches.match(e.request).then(r => r || new Response("", { status: 404 })));
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("index.html"))));
});
